import React, { useState } from 'react';
import {
    Layers,
    Grid3X3,
    DoorOpen,
    Package,
    Sparkles,
    FileText,
    ChevronDown,
    ChevronRight,
    Edit2,
    Trash2,
    Plus,
    Clock,
    ExternalLink
} from 'lucide-react';
import { Wall, FloorChange } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { CatalogTab } from './catalogTypes';

export type ToolType = 'walls' | 'flooring' | 'openings' | 'products' | 'ai' | 'boq' | null;

// ============================================
// PROPS INTERFACE
// ============================================

interface LeftToolbarProps {
    activeTool: ToolType;
    onToolSelect: (tool: ToolType) => void;
    disabled: boolean;
    walls: Wall[];
    selectedWallId: string | null;
    onSelectWall: (id: string) => void;
    onEditWall: (id: string) => void;
    onDeleteWall: (id: string) => void;
    onAddNewWall: () => void;
    onRenameWall?: (id: string, newName: string) => void;
    isDrawing: boolean;
    pendingFloor?: FloorChange;
    addedProducts?: { id: string; name: string }[];
    historyCount?: number;
    boqEstimate?: number;
    onOpenCatalog?: (tab: CatalogTab) => void;
    onOpenHistory?: () => void;
    onOpenBOQ?: () => void;
    onOpenAIAgent?: () => void;
    onClearFloor?: () => void;
    // Product Placement indicator
    hasPendingPlacements?: boolean;
}

// ============================================
// HIDDEN SCROLLBAR STYLES (inline for simplicity)
// ============================================
const scrollbarHideStyles: React.CSSProperties = {
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
};

// ============================================
// MAIN COMPONENT
// ============================================

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
    activeTool,
    onToolSelect,
    disabled,
    walls,
    selectedWallId,
    onSelectWall,
    onEditWall,
    onDeleteWall,
    onAddNewWall,
    onRenameWall,
    isDrawing,
    pendingFloor,
    addedProducts = [],
    historyCount = 0,
    boqEstimate = 0,
    onOpenCatalog,
    onOpenHistory,
    onOpenBOQ,
    onOpenAIAgent,
    onClearFloor,
    hasPendingPlacements = false
}) => {
    // Expanded sections state
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['walls', 'flooring']));
    const [editingWallId, setEditingWallId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            next.has(section) ? next.delete(section) : next.add(section);
            return next;
        });
    };

    const isExpanded = (section: string) => expandedSections.has(section);

    // ============================================
    // SECTION HEADER COMPONENT
    // ============================================
    const renderToolHeader = (
        id: string,
        icon: React.ReactNode,
        label: string,
        count?: number,
        hasIndicator?: boolean
    ) => (
        <button
            onClick={() => {
                toggleSection(id);
                // Also set this as the active tool (opens right sidebar)
                if (id === 'walls' || id === 'flooring' || id === 'openings' || id === 'products' || id === 'ai') {
                    onToolSelect(id as ToolType);
                }
            }}
            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all
                ${activeTool === id
                    ? 'bg-orange-500/10 border-l-2 border-orange-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'}`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {count !== undefined && count > 0 && (
                    <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-400">{count}</span>
                )}
                {hasIndicator && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                )}
                {isExpanded(id)
                    ? <ChevronDown size={14} className="text-gray-500" />
                    : <ChevronRight size={14} className="text-gray-500" />
                }
            </div>
        </button>
    );

    // ============================================
    // ADD BUTTON COMPONENT
    // ============================================
    const renderAddButton = (label: string, onClick: () => void, disabled?: boolean) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full py-2.5 text-sm rounded-lg border border-dashed transition-all 
                        flex items-center justify-center gap-2
                ${disabled
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-white/20 text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5'}`}
        >
            <Plus size={14} />
            {label}
        </button>
    );

    // ============================================
    // MAIN RENDER
    // ============================================

    return (
        <div className="w-[280px] bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden">
            {/* Drawing Status Banner */}
            {isDrawing && (
                <div className="mx-6 mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-xs text-blue-300 font-medium mb-1">Drawing Mode Active</p>
                    <p className="text-[11px] text-blue-400/70 leading-relaxed">
                        Click to add points. Click first point to close polygon.
                    </p>
                </div>
            )}

            {/* Scrollable Content */}
            <div
                className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden"
                style={scrollbarHideStyles}
            >
                {/* ============================================ */}
                {/* EDIT SECTION */}
                {/* ============================================ */}
                <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Edit
                    </h4>

                    {/* Walls */}
                    <div className="mb-3">
                        {renderToolHeader(
                            'walls',
                            <Layers size={18} className={activeTool === 'walls' ? 'text-orange-400' : 'text-gray-400'} />,
                            'Walls',
                            walls.length
                        )}

                        <AnimatePresence>
                            {isExpanded('walls') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-2 space-y-1">
                                        {walls.length === 0 ? (
                                            <p className="text-xs text-gray-600 py-2 pl-2">No walls marked</p>
                                        ) : (
                                            walls.map((wall) => (
                                                <div
                                                    key={wall.id}
                                                    onClick={() => { onSelectWall(wall.id); onToolSelect('walls'); }}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-all
                                                        ${selectedWallId === wall.id
                                                            ? 'bg-orange-500/10 text-white'
                                                            : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200'}`}
                                                >
                                                    {/* Color Dot */}
                                                    <div
                                                        className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20"
                                                        style={{ backgroundColor: wall.lastAppliedColor || wall.color || '#6B7280' }}
                                                    />

                                                    {/* Name / Edit Input */}
                                                    {editingWallId === wall.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onBlur={() => {
                                                                if (onRenameWall && editingName.trim()) {
                                                                    onRenameWall(wall.id, editingName.trim());
                                                                }
                                                                setEditingWallId(null);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    if (onRenameWall && editingName.trim()) {
                                                                        onRenameWall(wall.id, editingName.trim());
                                                                    }
                                                                    setEditingWallId(null);
                                                                }
                                                                if (e.key === 'Escape') setEditingWallId(null);
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            autoFocus
                                                            className="text-sm bg-white/10 border border-orange-500/50 rounded px-2 py-0.5 w-24 outline-none text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-sm truncate flex-1">{wall.label}</span>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingWallId(wall.id);
                                                                setEditingName(wall.label);
                                                            }}
                                                            className="p-1 hover:bg-white/10 rounded"
                                                        >
                                                            <Edit2 size={12} className="text-gray-500" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDeleteWall(wall.id); }}
                                                            className="p-1 hover:bg-red-500/20 rounded"
                                                        >
                                                            <Trash2 size={12} className="text-gray-500 hover:text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {/* Add Wall Button */}
                                        <div className="pt-2">
                                            {renderAddButton('Add New Wall', onAddNewWall, isDrawing)}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Flooring */}
                    <div className="mb-3">
                        {renderToolHeader(
                            'flooring',
                            <Grid3X3 size={18} className={activeTool === 'flooring' ? 'text-orange-400' : 'text-gray-400'} />,
                            'Flooring',
                            undefined,
                            !!pendingFloor
                        )}

                        <AnimatePresence>
                            {isExpanded('flooring') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-2">
                                        {pendingFloor ? (
                                            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                                <p className="text-[11px] text-gray-500 mb-1">Selected:</p>
                                                <p className="text-sm text-orange-400 font-medium truncate">
                                                    {pendingFloor.materialName}
                                                </p>
                                                {pendingFloor.price && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        ₹{pendingFloor.price}/sq ft
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => onOpenCatalog?.('flooring')}
                                                    className="w-full mt-3 py-2 text-sm rounded-lg border border-dashed 
                                                               border-white/20 text-orange-400 hover:border-orange-500/40 
                                                               hover:bg-orange-500/5 transition-all"
                                                >
                                                    Change Material
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="pt-1">
                                                <p className="text-xs text-gray-600 py-2 pl-2">Select from the sidebar →</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Openings */}
                    <div className="mb-3">
                        {renderToolHeader(
                            'openings',
                            <DoorOpen size={18} className={activeTool === 'openings' ? 'text-orange-400' : 'text-gray-400'} />,
                            'Openings',
                            0
                        )}

                        <AnimatePresence>
                            {isExpanded('openings') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-2">
                                        <p className="text-xs text-gray-600 py-2 pl-2">No openings marked</p>
                                        <p className="text-xs text-gray-500 pl-2">Select from the sidebar →</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Section Divider */}
                <div className="border-t border-white/5 my-6" />

                {/* ============================================ */}
                {/* ADD SECTION */}
                {/* ============================================ */}
                <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Add
                    </h4>

                    {/* Products */}
                    <div className="mb-3">
                        {renderToolHeader(
                            'products',
                            <Package size={18} className={activeTool === 'products' ? 'text-orange-400' : 'text-gray-400'} />,
                            'Products',
                            addedProducts.length,
                            hasPendingPlacements // Show orange indicator when placements are pending
                        )}

                        <AnimatePresence>
                            {isExpanded('products') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-6 mt-2 space-y-1">
                                        {addedProducts.length === 0 ? (
                                            <p className="text-xs text-gray-600 py-2 pl-2">No products added</p>
                                        ) : (
                                            addedProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 
                                                               hover:bg-white/[0.03] hover:text-gray-200 cursor-pointer transition-all"
                                                >
                                                    <div className="w-2 h-2 rounded bg-slate-600 shrink-0" />
                                                    <span className="text-sm truncate">{product.name}</span>
                                                </div>
                                            ))
                                        )}
                                        <div className="pt-2">
                                            {renderAddButton('Add Product', () => onOpenCatalog?.('products'))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Custom AI */}
                    <button
                        onClick={() => onToolSelect('ai')}
                        className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all
                            ${activeTool === 'ai'
                                ? 'bg-orange-500/10 border-l-2 border-orange-500 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles size={18} className={activeTool === 'ai' ? 'text-orange-400' : 'text-gray-400'} />
                            <span className="text-sm font-medium">Custom AI</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">2/5</span>
                    </button>
                </div>

                {/* Section Divider */}
                <div className="border-t border-white/5 my-6" />

                {/* ============================================ */}
                {/* VIEW SECTION */}
                {/* ============================================ */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        View
                    </h4>

                    {/* BOQ */}
                    <div className="mb-3">
                        <button
                            onClick={onOpenBOQ}
                            className={`w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all
                                ${activeTool === 'boq'
                                    ? 'bg-orange-500/10 border-l-2 border-orange-500 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-white/[0.03]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={18} className={activeTool === 'boq' ? 'text-orange-400' : 'text-gray-400'} />
                                <div className="text-left">
                                    <span className="text-sm font-medium block">BOQ</span>
                                    {boqEstimate > 0 && (
                                        <span className="text-[11px] text-orange-400">
                                            Estimated: ₹{(boqEstimate / 100000).toFixed(1)}L
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-600" />
                        </button>

                        {boqEstimate > 0 && (
                            <div className="ml-6 mt-2">
                                <button
                                    onClick={onOpenBOQ}
                                    className="w-full py-2.5 text-sm rounded-lg border border-dashed 
                                               border-white/20 text-orange-400 hover:border-orange-500/40 
                                               hover:bg-orange-500/5 transition-all"
                                >
                                    View Breakdown
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <button
                        onClick={onOpenHistory}
                        className="w-full flex items-center justify-between py-3 px-4 rounded-lg transition-all
                                   text-gray-300 hover:text-white hover:bg-white/[0.03]"
                    >
                        <div className="flex items-center gap-3">
                            <Clock size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">History</span>
                        </div>
                        {historyCount > 0 && (
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-400">
                                {historyCount}
                            </span>
                        )}
                    </button>

                    {historyCount > 0 && (
                        <div className="ml-6 mt-2">
                            <button
                                onClick={onOpenHistory}
                                className="w-full py-2.5 text-sm rounded-lg border border-dashed 
                                           border-white/20 text-orange-400 hover:border-orange-500/40 
                                           hover:bg-orange-500/5 transition-all"
                            >
                                View Timeline
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeftToolbar;
