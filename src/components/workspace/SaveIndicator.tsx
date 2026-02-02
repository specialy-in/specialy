
import React, { useEffect, useState } from 'react';
import { Check, Loader2, WifiOff } from 'lucide-react';

export type SaveStatus = 'saved' | 'saving' | 'offline';

interface SaveIndicatorProps {
    status: SaveStatus;
    lastSaved?: Date;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, lastSaved }) => {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const displayStatus = !online ? 'offline' : status;

    return (
        <div className="flex items-center gap-2 text-xs font-medium px-3 bg-[#0f172a]/50 rounded-full h-8 border border-white/5 backdrop-blur-sm">
            {displayStatus === 'saved' && (
                <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Saved</span>
                </>
            )}

            {displayStatus === 'saving' && (
                <>
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-blue-400">Saving...</span>
                </>
            )}

            {displayStatus === 'offline' && (
                <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-500">Offline</span>
                </>
            )}
        </div>
    );
};
