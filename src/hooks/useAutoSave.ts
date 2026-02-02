
import { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectService } from '../services/projectService';
import { debounce } from 'lodash';
// Note: You'll need to install lodash or implement a simple debounce if not present. 
// For now I'll implement a simple debounce to avoid dependencies.

type SaveStatus = 'saved' | 'saving' | 'offline';

export function useAutoSave(projectId: string | undefined, initialSurfaces: any) {
    const [status, setStatus] = useState<SaveStatus>('saved');
    const [lastSaved, setLastSaved] = useState<Date>(new Date());

    // Ref to track if it's the initial load to avoid saving on mount
    const isFirstRender = useRef(true);

    // Debounced save for surfaces
    const debouncedSaveSurfaces = useCallback(
        debounce(async (surfaces: any) => {
            if (!projectId) return;

            try {
                setStatus('saving');
                await ProjectService.saveSurfaces(projectId, surfaces);
                setStatus('saved');
                setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
                setStatus('offline'); // simplified error state
            }
        }, 1000),
        [projectId]
    );

    // Immediate save for critical items (like new products or completed polygons)
    const saveImmediate = async (action: () => Promise<void>) => {
        if (!projectId) return;
        try {
            setStatus('saving');
            await action();
            setStatus('saved');
            setLastSaved(new Date());
        } catch (error) {
            console.error('Immediate save failed:', error);
            setStatus('offline');
        }
    };

    return {
        status,
        lastSaved,
        debouncedSaveSurfaces,
        saveImmediate
    };
}

// Simple debounce implementation if lodash/debounce is not available
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
