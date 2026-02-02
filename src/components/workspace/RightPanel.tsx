import React, { useRef, ChangeEvent } from 'react';
import {
    Layers,
    Check,
    ChevronRight,
    X,
    ZoomIn,
    ZoomOut,
    ArrowUp,
    ArrowDown,
    Maximize2,
    DoorOpen,
    Package,
    Sparkles,
    Paintbrush,
    Upload,
    AlertTriangle,
    Trash2,
    ExternalLink,
    Calendar
} from 'lucide-react';
import { Wall, QUICK_COLORS, MOCK_SPONSORED_PAINTS, PendingChanges, ProductPlacement, AICredits } from './types';
import { ToolType } from './LeftToolbar';
import { FlooringPanel } from './FlooringPanel';
import { CatalogTab } from './catalogTypes';

// ============================================
// HIDDEN SCROLLBAR STYLES
// ============================================
const scrollbarHideStyles: React.CSSProperties = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
};

// ============================================
// PROPS INTERFACE
// ============================================

interface RightPanelProps {
    activeTool: ToolType;
    hasImage: boolean;
    walls: Wall[];
    selectedWallId: string | null;
    pendingChanges: PendingChanges;
    onSelectWall: (id: string | null) => void;
    onUpdatePendingChange: (type: 'walls' | 'floor', id: string, data: any) => void;
    onClearFloorChange?: () => void;
    onOpenCatalog?: (tab: CatalogTab) => void;
    // Product Placement Props
    pendingPlacements?: ProductPlacement[];
    activePlacementId?: string | null;
    onSetActivePlacement?: (id: string | null) => void;
    onRemovePlacement?: (id: string) => void;
    onApplyPlacements?: () => void;
    // AI Editor Props
    aiCredits?: AICredits;
    aiBrushSize?: number;
    onAiBrushSizeChange?: (size: number) => void;
    aiPrompt?: string;
    onAiPromptChange?: (prompt: string) => void;
    aiPromptError?: string | null;
    aiMaskStrokes?: number[][];
    onClearAiMask?: () => void;
    aiReferencePreview?: string | null;
    onAiReferenceSelect?: (file: File) => void;
    onAiReferenceRemove?: () => void;
    onApplyAiEdit?: () => void;
    isAiApplying?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const RightPanel: React.FC<RightPanelProps> = ({
    activeTool,
    hasImage,
    walls,
    selectedWallId,
    pendingChanges,
    onSelectWall,
    onUpdatePendingChange,
    onClearFloorChange,
    onOpenCatalog,
    // Product Placement
    pendingPlacements = [],
    activePlacementId,
    onSetActivePlacement,
    onRemovePlacement,
    onApplyPlacements,
    // AI Editor
    aiCredits = { used: 0, limit: 5, resetDate: new Date().toISOString() },
    aiBrushSize = 50,
    onAiBrushSizeChange,
    aiPrompt = '',
    onAiPromptChange,
    aiPromptError,
    aiMaskStrokes = [],
    onClearAiMask,
    aiReferencePreview,
    onAiReferenceSelect,
    onAiReferenceRemove,
    onApplyAiEdit,
    isAiApplying = false
}) => {
    const selectedWall = walls.find(w => w.id === selectedWallId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ============================================
    // EMPTY STATE - No Image
    // ============================================
    if (!hasImage) {
        return (
            <div className="w-[400px] bg-slate-950/80 backdrop-blur-xl border-l border-white/5 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-10">
                    <div className="text-center">
                        <Layers size={56} className="mx-auto text-gray-700 mb-6" />
                        <p className="text-gray-400 text-base mb-2">No Image Loaded</p>
                        <p className="text-gray-600 text-sm">Upload a photo to start editing</p>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // EMPTY STATE - No Tool Selected (POV Options)
    // ============================================
    const renderEmptyState = () => (
        <div className="p-8">
            <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Change Perspective</h3>
                <p className="text-sm text-gray-500">Adjust how you view your room</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Wider View */}
                <button className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] 
                                   hover:border-orange-500/30 transition-all flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center 
                                    group-hover:bg-orange-500/10 transition-colors">
                        <ZoomOut size={24} className="text-gray-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Wider View</span>
                </button>

                {/* Closer View */}
                <button className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] 
                                   hover:border-orange-500/30 transition-all flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center 
                                    group-hover:bg-orange-500/10 transition-colors">
                        <ZoomIn size={24} className="text-gray-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Closer View</span>
                </button>

                {/* Higher Angle */}
                <button className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] 
                                   hover:border-orange-500/30 transition-all flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center 
                                    group-hover:bg-orange-500/10 transition-colors">
                        <ArrowUp size={24} className="text-gray-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Higher Angle</span>
                </button>

                {/* Lower Angle */}
                <button className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] 
                                   hover:border-orange-500/30 transition-all flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center 
                                    group-hover:bg-orange-500/10 transition-colors">
                        <ArrowDown size={24} className="text-gray-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-sm text-gray-300 font-medium">Lower Angle</span>
                </button>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-600">
                    Or select a tool from the left to start editing
                </p>
            </div>
        </div>
    );

    // ============================================
    // WALL EDITOR
    // ============================================
    const renderWallEditor = () => {
        if (!selectedWall) {
            return (
                <div className="p-8">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                        <Layers size={22} className="text-orange-400" />
                        Wall Colors
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        Select a wall from the sidebar or canvas to edit its color and finish.
                    </p>

                    {/* Marked Walls List */}
                    {walls.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Marked Walls
                            </h4>
                            {walls.map((wall) => (
                                <button
                                    key={wall.id}
                                    onClick={() => onSelectWall(wall.id)}
                                    className="w-full p-3 rounded-lg border border-white/10 bg-white/[0.02] 
                                               hover:bg-white/[0.05] hover:border-orange-500/30 transition-all 
                                               flex items-center gap-3"
                                >
                                    <div
                                        className="w-4 h-4 rounded-full ring-1 ring-white/20"
                                        style={{ backgroundColor: wall.lastAppliedColor || wall.color || '#6B7280' }}
                                    />
                                    <span className="text-sm text-gray-300">{wall.label}</span>
                                    <ChevronRight size={16} className="text-gray-600 ml-auto" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Browse All Wall Finishes */}
                    <button
                        onClick={() => onOpenCatalog?.('wall-finishes')}
                        className="w-full mt-6 py-4 px-6 rounded-xl border border-white/10 hover:border-orange-500/30 
                                   bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
                    >
                        <span className="text-sm text-gray-300 font-medium">Browse All Wall Finishes</span>
                        <ChevronRight size={18} className="text-gray-500" />
                    </button>
                </div>
            );
        }

        const pendingChange = pendingChanges.walls[selectedWall.id];
        const currentColor = pendingChange?.color || selectedWall.color;
        const currentSponsoredId = pendingChange?.sponsoredProductId || selectedWall.sponsoredProductId;

        const handleColorSelect = (color: string, sponsoredProduct?: { id: string; name: string }) => {
            onUpdatePendingChange('walls', selectedWall.id, {
                color,
                sponsoredProductId: sponsoredProduct?.id,
                sponsoredProductName: sponsoredProduct?.name,
                label: selectedWall.label
            });
        };

        return (
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">{selectedWall.label}</h3>
                    <button
                        onClick={() => onSelectWall(null)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 
                                   hover:text-white hover:bg-white/5 transition-all"
                    >
                        <X size={14} />
                        Deselect
                    </button>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Quick Colors - Larger Swatches */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Quick Colors
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        {QUICK_COLORS.map((color) => (
                            <button
                                key={color.hex}
                                onClick={() => handleColorSelect(color.hex)}
                                className={`relative p-4 rounded-xl border transition-all flex flex-col items-center gap-3
                                    ${currentColor === color.hex
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                            >
                                {/* Large Color Swatch */}
                                <div
                                    className="w-12 h-12 rounded-xl border-2 border-white/20"
                                    style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-xs text-gray-400 text-center truncate w-full">
                                    {color.name}
                                </span>
                                {currentColor === color.hex && (
                                    <Check size={16} className="absolute top-2 right-2 text-orange-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Sponsored Paints - Horizontal Cards */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Sponsored Paints
                    </h4>
                    <div className="space-y-3">
                        {MOCK_SPONSORED_PAINTS.slice(0, 3).map((paint) => (
                            <button
                                key={paint.id}
                                onClick={() => handleColorSelect(paint.color, { id: paint.id, name: paint.name })}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4
                                    ${currentSponsoredId === paint.id
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                            >
                                {/* Color Swatch */}
                                <div
                                    className="w-12 h-12 rounded-lg border-2 border-white/20 shrink-0"
                                    style={{ backgroundColor: paint.color }}
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm text-gray-200 font-medium truncate">{paint.name}</p>
                                    <p className="text-xs text-gray-500">{paint.brand}</p>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                    <p className="text-sm text-orange-400 font-semibold">₹450</p>
                                    <p className="text-[10px] text-gray-600">/sq ft</p>
                                </div>

                                {/* Check */}
                                {currentSponsoredId === paint.id && (
                                    <Check size={18} className="text-orange-400 shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Browse All Button */}
                <button
                    onClick={() => onOpenCatalog?.('wall-finishes')}
                    className="w-full py-4 px-6 rounded-xl border border-white/10 hover:border-orange-500/30 
                               bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
                >
                    <span className="text-sm text-gray-300 font-medium">Browse All Wall Finishes</span>
                    <ChevronRight size={18} className="text-gray-500" />
                </button>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Custom Texture Section */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Custom Texture
                    </h4>

                    <div className="space-y-4">
                        {/* Upload */}
                        <div>
                            <label className="text-xs text-gray-500 mb-2 block">Upload Reference:</label>
                            <button className="w-full py-4 rounded-xl border border-dashed border-white/20 
                                              hover:border-orange-500/40 hover:bg-orange-500/5 transition-all 
                                              flex flex-col items-center gap-2 text-gray-500 hover:text-orange-400">
                                <Upload size={20} />
                                <span className="text-sm">Choose File...</span>
                            </button>
                        </div>

                        {/* Describe */}
                        <div>
                            <label className="text-xs text-gray-500 mb-2 block">Describe:</label>
                            <input
                                type="text"
                                placeholder="e.g., Exposed brick texture"
                                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 
                                           text-gray-300 text-sm placeholder:text-gray-600 focus:outline-none 
                                           focus:border-orange-500/50"
                            />
                        </div>

                        {/* Apply Button */}
                        <button
                            className="w-full py-3 rounded-xl bg-orange-500/20 text-orange-400 text-sm font-medium
                                       hover:bg-orange-500/30 transition-all"
                        >
                            Apply Custom
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ============================================
    // OPENINGS PANEL
    // ============================================
    const renderOpeningsPanel = () => (
        <div className="p-8">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                <DoorOpen size={22} className="text-orange-400" />
                Windows & Doors
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Transform your windows and doors with new styles.
            </p>

            {/* No Openings State */}
            <div className="p-6 rounded-xl border border-dashed border-white/20 bg-white/[0.02] mb-6 text-center">
                <DoorOpen size={40} className="mx-auto text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 mb-4">No openings marked yet</p>
                <button className="px-6 py-2.5 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium
                                   hover:bg-orange-500/30 transition-all">
                    + Mark Window/Door
                </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-6" />

            {/* Browse Options */}
            <p className="text-xs text-gray-500 mb-4">Or explore window & door styles:</p>
            <button
                onClick={() => onOpenCatalog?.('windows-doors')}
                className="w-full py-4 px-6 rounded-xl border border-white/10 hover:border-orange-500/30 
                           bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
            >
                <span className="text-sm text-gray-300 font-medium">Browse Window & Door Styles</span>
                <ChevronRight size={18} className="text-gray-500" />
            </button>
        </div>
    );

    // ============================================
    // PRODUCTS PANEL
    // ============================================
    const renderProductsPanel = () => (
        <div className="p-8">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                <Package size={22} className="text-orange-400" />
                Products
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Add furniture, decor, and accessories to your room.
            </p>

            {/* Recommended Products */}
            <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Recommended for Living Room
                </h4>
                <div className="space-y-3">
                    {[
                        { id: '1', name: 'Oslo Lounge Chair', brand: 'Pepper2', price: '₹62,271' },
                        { id: '2', name: 'Modern Floor Lamp', brand: 'LightHouse', price: '₹12,500' },
                        { id: '3', name: 'Artisan Coffee Table', brand: 'WoodCraft', price: '₹28,900' },
                    ].map((product) => (
                        <div
                            key={product.id}
                            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] 
                                       hover:bg-white/[0.05] transition-all flex items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <Package size={24} className="text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 font-medium truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.brand}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-orange-400 font-semibold">{product.price}</p>
                                <button className="text-xs text-gray-500 hover:text-orange-400 mt-1">
                                    Select →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Browse All Button */}
            <button
                onClick={() => onOpenCatalog?.('products')}
                className="w-full py-4 px-6 rounded-xl border border-white/10 hover:border-orange-500/30 
                           bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
            >
                <span className="text-sm text-gray-300 font-medium">Browse All Products</span>
                <ChevronRight size={18} className="text-gray-500" />
            </button>

            {/* Divider */}
            <div className="border-t border-white/5 my-6" />

            {/* Custom Product */}
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Custom Product
                </h4>
                <div className="space-y-4">
                    <button className="w-full py-4 rounded-xl border border-dashed border-white/20 
                                      hover:border-orange-500/40 hover:bg-orange-500/5 transition-all 
                                      flex flex-col items-center gap-2 text-gray-500 hover:text-orange-400">
                        <Upload size={20} />
                        <span className="text-sm">Upload Product Image...</span>
                    </button>
                    <input
                        type="text"
                        placeholder="Or describe the product..."
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 
                                   text-gray-300 text-sm placeholder:text-gray-600 focus:outline-none 
                                   focus:border-orange-500/50"
                    />
                </div>
            </div>
        </div>
    );

    // ============================================
    // CUSTOM AI PANEL
    // ============================================
    const remainingCredits = aiCredits.limit - aiCredits.used;
    const resetDateFormatted = new Date(aiCredits.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const canApplyAiEdit = aiMaskStrokes.length > 0 && aiPrompt.trim().length >= 10 && !aiPromptError && remainingCredits > 0;

    const handleReferenceFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onAiReferenceSelect) {
            onAiReferenceSelect(file);
        }
    };

    const renderAIPanel = () => (
        <div className="p-6 overflow-y-auto" style={scrollbarHideStyles}>
            {/* Header */}
            <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-3">
                <Sparkles size={22} className="text-orange-400" />
                Custom AI Editor
            </h3>
            <p className="text-xs text-gray-500 mb-6">Brush an area and describe what to change</p>

            {/* Credits Display */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Credits remaining</span>
                    <span className={`text-lg font-bold ${remainingCredits > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                        {remainingCredits}/{aiCredits.limit}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Resets: {resetDateFormatted}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-400/80">
                    <AlertTriangle size={12} />
                    <span>Each edit costs 1 credit</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-6" />

            {/* STEP 1: Brush Size */}
            <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] flex items-center justify-center font-bold">1</span>
                    Brush the Area
                </h4>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500 w-8">10px</span>
                    <input
                        type="range"
                        min="10"
                        max="200"
                        value={aiBrushSize}
                        onChange={(e) => onAiBrushSizeChange?.(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                                   [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:cursor-pointer
                                   [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <span className="text-xs text-gray-500 w-12">200px</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">Current size:</span>
                    <span className="text-sm font-medium text-orange-400">{aiBrushSize}px</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    Paint on the canvas to mark the area you want to edit
                </p>
                {aiMaskStrokes.length > 0 && (
                    <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                        <span className="text-xs text-green-400">
                            ✓ {aiMaskStrokes.length} stroke{aiMaskStrokes.length !== 1 ? 's' : ''} painted
                        </span>
                        <button
                            onClick={onClearAiMask}
                            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-6" />

            {/* STEP 2: Describe Edit */}
            <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] flex items-center justify-center font-bold">2</span>
                    Describe Your Edit
                </h4>
                <textarea
                    value={aiPrompt}
                    onChange={(e) => onAiPromptChange?.(e.target.value)}
                    placeholder="What should the AI do in the marked area?"
                    maxLength={200}
                    className={`w-full h-24 px-4 py-3 rounded-xl bg-white/5 border 
                               text-gray-300 text-sm placeholder:text-gray-600 focus:outline-none 
                               resize-none transition-colors
                               ${aiPromptError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-orange-500/50'}`}
                />
                <div className="flex items-center justify-between mt-2">
                    {aiPromptError ? (
                        <span className="text-xs text-red-400 flex items-center gap-1">
                            <AlertTriangle size={12} /> {aiPromptError}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-600">Min 10 characters</span>
                    )}
                    <span className={`text-xs ${aiPrompt.length >= 180 ? 'text-orange-400' : 'text-gray-600'}`}>
                        {aiPrompt.length}/200
                    </span>
                </div>
                <div className="mt-3 space-y-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide">Examples:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                        <li>• "Remove ceiling fan"</li>
                        <li>• "Add potted plant here"</li>
                        <li>• "Remove window reflection"</li>
                        <li>• "Change curtain to beige linen"</li>
                    </ul>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-6" />

            {/* STEP 3: Reference Image */}
            <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-700 text-gray-400 text-[10px] flex items-center justify-center font-bold">3</span>
                    Reference (Optional)
                </h4>

                {aiReferencePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                        <img
                            src={aiReferencePreview}
                            alt="Reference"
                            className="w-full h-32 object-cover"
                        />
                        <button
                            onClick={onAiReferenceRemove}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 rounded-xl border border-dashed border-white/20 
                                   hover:border-orange-500/40 hover:bg-orange-500/5 transition-all 
                                   flex flex-col items-center gap-2 text-gray-500 hover:text-orange-400"
                    >
                        <Upload size={20} />
                        <span className="text-sm">Upload inspiration image...</span>
                        <span className="text-xs text-gray-600">Helps AI understand style</span>
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceFileChange}
                    className="hidden"
                />
            </div>

            {/* Clear Mask Button */}
            {aiMaskStrokes.length > 0 && (
                <button
                    onClick={onClearAiMask}
                    className="w-full py-3 mb-3 rounded-xl border border-white/10 
                               text-gray-400 hover:text-white hover:bg-white/5 transition-all 
                               flex items-center justify-center gap-2 text-sm"
                >
                    <Trash2 size={16} />
                    Clear Brush Strokes
                </button>
            )}

            {/* Apply Button */}
            <button
                onClick={onApplyAiEdit}
                disabled={!canApplyAiEdit || isAiApplying}
                className={`w-full py-4 rounded-xl text-sm font-semibold transition-all 
                           flex items-center justify-center gap-2
                           ${canApplyAiEdit && !isAiApplying
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
            >
                {isAiApplying ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Apply Edit (1 credit)
                    </>
                )}
            </button>

            {/* Disabled state hints */}
            {!canApplyAiEdit && !isAiApplying && (
                <div className="mt-3 text-xs text-gray-600 text-center">
                    {remainingCredits <= 0 && <p className="text-red-400">No credits remaining</p>}
                    {remainingCredits > 0 && aiMaskStrokes.length === 0 && <p>Brush an area to edit first</p>}
                    {remainingCredits > 0 && aiMaskStrokes.length > 0 && aiPrompt.length < 10 && <p>Add a description (min 10 chars)</p>}
                </div>
            )}
        </div>
    );

    // ============================================
    // PLACEMENT LIST (Product Placement Mode)
    // ============================================
    const renderPlacementList = () => {
        if (pendingPlacements.length === 0) return null;

        return (
            <div className="p-6 border-b border-white/5">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Products to Place
                </h4>
                <div className="space-y-3">
                    {pendingPlacements.map((placement) => {
                        const isActive = activePlacementId === placement.id;
                        return (
                            <div
                                key={placement.id}
                                onClick={() => onSetActivePlacement?.(isActive ? null : placement.id)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3
                                    ${isActive
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                    }`}
                            >
                                {/* Color Indicator */}
                                <div
                                    className="w-5 h-5 rounded-full shrink-0 ring-2 ring-white/20"
                                    style={{ backgroundColor: placement.color }}
                                />

                                {/* Thumbnail */}
                                {placement.thumbnail ? (
                                    <img
                                        src={placement.thumbnail}
                                        alt={placement.name}
                                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                        <Package size={20} className="text-gray-600" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 font-medium truncate">{placement.name}</p>
                                    <p className="text-xs text-gray-500">{placement.brand}</p>
                                    <p className="text-xs text-orange-400 font-medium">₹{placement.price.toLocaleString()}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {placement.buyLink && (
                                        <a
                                            href={placement.buyLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-colors"
                                            title="Buy Link"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemovePlacement?.(placement.id);
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                        title="Remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-gray-600 mt-3 text-center">
                    Click a product to select it, then brush on the canvas to mark placement
                </p>

                {/* Apply Placements Button */}
                {pendingPlacements.some(p => p.strokePoints.length > 0) && (
                    <button
                        onClick={onApplyPlacements}
                        className="mt-4 w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 
                                   hover:from-orange-400 hover:to-amber-400 text-white font-medium 
                                   rounded-xl transition-all shadow-lg shadow-orange-500/20"
                    >
                        🎨 Apply Placements
                    </button>
                )}
            </div>
        );
    };

    // ============================================
    // TOOL CONTENT ROUTER
    // ============================================
    const renderToolContent = () => {
        switch (activeTool) {
            case 'walls':
                return renderWallEditor();
            case 'flooring':
                return (
                    <FlooringPanel
                        pendingChange={pendingChanges.floor}
                        onUpdateChange={(data) => {
                            if (data) {
                                onUpdatePendingChange('floor', 'floor', data);
                            } else if (onClearFloorChange) {
                                onClearFloorChange();
                            }
                        }}
                        onOpenCatalog={() => onOpenCatalog?.('flooring')}
                    />
                );
            case 'openings':
                return renderOpeningsPanel();
            case 'products':
                return renderProductsPanel();
            case 'ai':
                return renderAIPanel();
            default:
                return renderEmptyState();
        }
    };

    // ============================================
    // MAIN RENDER
    // ============================================
    return (
        <div
            className="w-[400px] bg-slate-950/80 backdrop-blur-xl border-l border-white/5 flex flex-col 
                       overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={scrollbarHideStyles}
        >
            {/* Placement List - Always visible when products are pending */}
            {renderPlacementList()}

            {/* Tool-specific content */}
            {renderToolContent()}
        </div>
    );
};
