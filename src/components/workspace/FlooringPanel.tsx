import React, { useState, useRef } from 'react';
import { Grid3X3, Check, Upload, ChevronRight, X, Maximize2 } from 'lucide-react';
import {
    FloorChange,
    FlooringMaterial,
    SponsoredFlooring,
    QUICK_FLOORING,
    MOCK_SPONSORED_FLOORING
} from './types';

interface FlooringPanelProps {
    pendingChange?: FloorChange;
    onUpdateChange: (data: FloorChange | null) => void;
    onOpenCatalog?: () => void;
}

export const FlooringPanel: React.FC<FlooringPanelProps> = ({
    pendingChange,
    onUpdateChange,
    onOpenCatalog
}) => {
    const [customPrompt, setCustomPrompt] = useState('');
    const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleQuickSelect = (material: FlooringMaterial) => {
        onUpdateChange({
            materialId: material.id,
            materialName: material.name,
            type: 'quick'
        });
    };

    const handleSponsoredSelect = (flooring: SponsoredFlooring) => {
        onUpdateChange({
            materialId: flooring.id,
            materialName: `${flooring.brand} ${flooring.name}`,
            type: 'sponsored',
            sponsoredProductId: flooring.id,
            price: flooring.price,
            brand: flooring.brand,
            textureImageUrl: flooring.textureUrl
        });
    };

    const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCustomImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            onUpdateChange({
                materialId: 'custom_image',
                materialName: 'Custom Texture',
                type: 'custom',
                customImageFile: file
            });
        }
    };

    const handleCustomPromptApply = () => {
        if (customPrompt.trim()) {
            onUpdateChange({
                materialId: 'custom_prompt',
                materialName: customPrompt.trim(),
                type: 'custom',
                customPrompt: customPrompt.trim()
            });
        }
    };

    const handleClearSelection = () => {
        onUpdateChange(null);
        setCustomPrompt('');
        setCustomImagePreview(null);
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Grid3X3 size={22} className="text-orange-400" />
                <h3 className="text-xl font-semibold text-white">Flooring</h3>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Quick Picks - Larger Cards */}
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Quick Picks
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {QUICK_FLOORING.map((material) => {
                        const isSelected = pendingChange?.materialId === material.id;
                        return (
                            <button
                                key={material.id}
                                onClick={() => handleQuickSelect(material)}
                                className={`relative p-4 rounded-xl border transition-all flex items-center gap-3
                                    ${isSelected
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                            >
                                {/* Material Icon */}
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-800/50 to-stone-600/50 
                                                flex items-center justify-center shrink-0">
                                    <Grid3X3 size={18} className="text-amber-300/70" />
                                </div>
                                <span className="text-sm text-gray-200 truncate">{material.name}</span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2">
                                        <Check size={14} className="text-orange-400" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Sponsored Materials - Horizontal Cards */}
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Sponsored ({MOCK_SPONSORED_FLOORING.length})
                </h4>
                <div className="space-y-3">
                    {MOCK_SPONSORED_FLOORING.map((flooring) => {
                        const isSelected = pendingChange?.sponsoredProductId === flooring.id;
                        return (
                            <button
                                key={flooring.id}
                                onClick={() => handleSponsoredSelect(flooring)}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 text-left
                                    ${isSelected
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                            >
                                {/* Material Swatch */}
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-500/50 to-stone-600/50 
                                                flex items-center justify-center shrink-0">
                                    <Grid3X3 size={20} className="text-slate-300/70" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-200 font-medium truncate">{flooring.name}</p>
                                    <p className="text-xs text-gray-500">{flooring.brand}</p>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                    <p className="text-sm text-orange-400 font-semibold">₹{flooring.price}</p>
                                    <p className="text-[10px] text-gray-600">/sq ft</p>
                                </div>

                                {/* Check */}
                                {isSelected && <Check size={18} className="text-orange-400 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Browse All Button */}
            <button
                onClick={() => onOpenCatalog?.()}
                className="w-full py-4 px-6 rounded-xl border border-white/10 hover:border-orange-500/30 
                           bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
            >
                <span className="text-sm text-gray-300 font-medium">Browse All Flooring</span>
                <ChevronRight size={18} className="text-gray-500" />
            </button>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Custom Flooring */}
            <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Custom Flooring
                </h4>

                <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">Upload Reference:</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCustomImageUpload}
                            className="hidden"
                        />
                        {customImagePreview ? (
                            <div className="relative">
                                <img
                                    src={customImagePreview}
                                    alt="Custom texture"
                                    className="w-full h-28 object-cover rounded-xl border border-white/10"
                                />
                                <button
                                    onClick={() => {
                                        setCustomImagePreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-5 rounded-xl border border-dashed border-white/20 
                                           hover:border-orange-500/40 hover:bg-orange-500/5 transition-all 
                                           flex flex-col items-center gap-2 text-gray-500 hover:text-orange-400"
                            >
                                <Maximize2 size={22} />
                                <span className="text-sm">Choose File...</span>
                            </button>
                        )}
                    </div>

                    {/* Describe */}
                    <div>
                        <label className="text-xs text-gray-500 mb-2 block">Describe Material:</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., Dark walnut herringbone pattern"
                                className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 
                                           text-gray-300 text-sm placeholder:text-gray-600 focus:outline-none 
                                           focus:border-orange-500/50"
                            />
                            <button
                                onClick={handleCustomPromptApply}
                                disabled={!customPrompt.trim()}
                                className="px-4 py-3 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium
                                           hover:bg-orange-500/30 transition-all disabled:opacity-50 
                                           disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Indicator */}
            {pendingChange && (
                <>
                    {/* Divider */}
                    <div className="border-t border-white/5" />

                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-gray-500 mb-1">Selected:</p>
                                <p className="text-sm text-orange-400 font-medium">{pendingChange.materialName}</p>
                                {pendingChange.price && (
                                    <p className="text-xs text-gray-500 mt-0.5">₹{pendingChange.price}/sq ft</p>
                                )}
                            </div>
                            <button
                                onClick={handleClearSelection}
                                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white 
                                           hover:bg-white/10 transition-all"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
