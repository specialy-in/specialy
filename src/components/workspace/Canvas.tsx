import React, { useCallback, useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from 'react-konva';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { ImageIcon, Loader2, ZoomIn, ZoomOut, Maximize2, Check, X, Brush } from 'lucide-react';
import { Wall, ProductPlacement } from './types';
import { ToolType } from './LeftToolbar';
import Konva from 'konva';

interface CanvasProps {
    imageUrl: string | null;
    isUploading: boolean;
    uploadProgress: number;
    onFileSelect: (file: File) => void;
    activeTool: ToolType;
    walls: Wall[];
    selectedWallId: string | null;
    isDrawing: boolean;
    currentPoints: number[];
    onCanvasClick: (x: number, y: number) => void;
    onClosePolygon: () => void;
    onCancelDrawing: () => void;
    onEmptyClick?: () => void;
    showWalls?: boolean;
    imageSize?: { width: number; height: number };
    onImageSizeChange?: (size: { width: number; height: number }) => void;
    // Product Placement Props
    pendingPlacements?: ProductPlacement[];
    activePlacementId?: string | null;
    onUpdatePlacementStrokes?: (placementId: string, strokes: number[][]) => void;
    // AI Mask Props
    aiMaskStrokes?: number[][];
    aiBrushSize?: number;
    onUpdateAIMaskStrokes?: (strokes: number[][]) => void;
}

export interface CanvasHandle {
    getStageRef: () => Konva.Stage | null;
    exportReferenceImage: () => string | null;
    exportMaskImage: () => string | null;
}

// Denormalize 0-1 scale to pixel coordinates
const denormalizePoints = (points: number[], w: number, h: number): number[] =>
    points.map((c, i) => i % 2 === 0 ? c * w : c * h);

export const Canvas = forwardRef<CanvasHandle, CanvasProps>(({
    imageUrl,
    isUploading,
    uploadProgress,
    onFileSelect,
    activeTool,
    walls,
    selectedWallId,
    isDrawing,
    currentPoints,
    onCanvasClick,
    onClosePolygon,
    onCancelDrawing,
    onEmptyClick,
    showWalls = true,
    imageSize: parentImageSize,
    onImageSizeChange,
    // Product Placement
    pendingPlacements = [],
    activePlacementId,
    onUpdatePlacementStrokes,
    // AI Mask
    aiMaskStrokes = [],
    aiBrushSize = 50,
    onUpdateAIMaskStrokes
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    // Brush state
    const [isBrushing, setIsBrushing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<number[]>([]);

    // Get active placement
    const activePlacement = pendingPlacements.find(p => p.id === activePlacementId);
    const isPlacementMode = !!activePlacementId && pendingPlacements.length > 0;
    const isAIMode = activeTool === 'ai';

    // Expose stage ref to parent
    useImperativeHandle(ref, () => ({
        getStageRef: () => stageRef.current,
        exportReferenceImage: () => {
            if (!stageRef.current || !image) return null;

            const stage = stageRef.current;

            // Store current stage state
            const originalWidth = stage.width();
            const originalHeight = stage.height();
            const originalScaleX = stage.scaleX();
            const originalScaleY = stage.scaleY();
            const originalX = stage.x();
            const originalY = stage.y();

            // Temporarily set stage to match original image dimensions exactly
            stage.width(imageSize.width);
            stage.height(imageSize.height);
            stage.scaleX(1);
            stage.scaleY(1);
            stage.x(0);
            stage.y(0);

            // Export at native resolution
            const dataUrl = stage.toDataURL({
                x: 0,
                y: 0,
                width: imageSize.width,
                height: imageSize.height,
                pixelRatio: 1,
                mimeType: 'image/png'
            });

            // Restore original stage state
            stage.width(originalWidth);
            stage.height(originalHeight);
            stage.scaleX(originalScaleX);
            stage.scaleY(originalScaleY);
            stage.x(originalX);
            stage.y(originalY);

            return dataUrl;
        },
        exportMaskImage: () => {
            // Generate white-on-black mask image from AI brush strokes
            if (!imageSize.width || !imageSize.height || aiMaskStrokes.length === 0) return null;

            const canvas = document.createElement('canvas');
            canvas.width = imageSize.width;
            canvas.height = imageSize.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Fill black (preserve area)
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, imageSize.width, imageSize.height);

            // Draw white strokes (edit area)
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = aiBrushSize;

            aiMaskStrokes.forEach(stroke => {
                if (stroke.length < 4) return;
                ctx.beginPath();
                ctx.moveTo(stroke[0], stroke[1]);
                for (let i = 2; i < stroke.length; i += 2) {
                    ctx.lineTo(stroke[i], stroke[i + 1]);
                }
                ctx.stroke();
            });

            return canvas.toDataURL('image/png');
        }
    }));

    // Handle container resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Handle mouse move for custom cursor
    const handleContainerMouseMove = useCallback((e: React.MouseEvent) => {
        if ((isPlacementMode || isAIMode) && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update CSS variables for the custom cursor
            containerRef.current.style.setProperty('--mouse-x', `${x}px`);
            containerRef.current.style.setProperty('--mouse-y', `${y}px`);
        }
    }, [isPlacementMode, isAIMode]);

    // Load image when URL changes
    useEffect(() => {
        if (imageUrl) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;
            img.onload = () => {
                setImage(img);
                const newSize = { width: img.width, height: img.height };
                setImageSize(newSize);
                if (onImageSizeChange) onImageSizeChange(newSize);
                // Fit image to container
                const scaleX = (dimensions.width * 0.9) / img.width;
                const scaleY = (dimensions.height * 0.9) / img.height;
                const newScale = Math.min(scaleX, scaleY, 1);
                setScale(newScale);
                setPosition({
                    x: (dimensions.width - img.width * newScale) / 2,
                    y: (dimensions.height - img.height * newScale) / 2
                });
            };
        } else {
            setImage(null);
        }
    }, [imageUrl, dimensions, onImageSizeChange]);

    // Dropzone setup
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const dropzoneOptions: DropzoneOptions = {
        onDrop,
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
        maxFiles: 1,
        disabled: isUploading || isPlacementMode,
        multiple: false,
        onDragEnter: () => { },
        onDragOver: () => { },
        onDragLeave: () => { }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

    // Zoom controls
    const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
    const handleFitToScreen = () => {
        if (image) {
            const scaleX = (dimensions.width * 0.9) / image.width;
            const scaleY = (dimensions.height * 0.9) / image.height;
            const newScale = Math.min(scaleX, scaleY, 1);
            setScale(newScale);
            setPosition({
                x: (dimensions.width - image.width * newScale) / 2,
                y: (dimensions.height - image.height * newScale) / 2
            });
        }
    };

    // Convert screen coords to image coords
    const screenToImageCoords = (pointer: { x: number; y: number }) => {
        const x = (pointer.x - position.x) / scale;
        const y = (pointer.y - position.y) / scale;
        return { x, y };
    };

    // Check if point is within image bounds
    const isWithinImage = (x: number, y: number) => {
        return x >= 0 && y >= 0 && x <= imageSize.width && y <= imageSize.height;
    };

    // Brush handlers for product placement AND AI mask mode
    const handleBrushStart = (e: any) => {
        // Handle both AI mode and placement mode
        if (!isPlacementMode && !isAIMode) return;
        if (isPlacementMode && !activePlacement) return;

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const { x, y } = screenToImageCoords(pointer);
        if (!isWithinImage(x, y)) return;

        setIsBrushing(true);
        setCurrentStroke([x, y]);
    };

    const handleBrushMove = (e: any) => {
        if (!isBrushing) return;
        if (!isPlacementMode && !isAIMode) return;
        if (isPlacementMode && !activePlacement) return;

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const { x, y } = screenToImageCoords(pointer);
        if (!isWithinImage(x, y)) return;

        setCurrentStroke(prev => [...prev, x, y]);
    };

    const handleBrushEnd = () => {
        if (!isBrushing || currentStroke.length < 4) {
            setIsBrushing(false);
            setCurrentStroke([]);
            return;
        }

        // AI Mode: add to AI mask strokes
        if (isAIMode) {
            const updatedStrokes = [...aiMaskStrokes, currentStroke];
            onUpdateAIMaskStrokes?.(updatedStrokes);
        }
        // Placement Mode: add to placement strokes
        else if (isPlacementMode && activePlacement) {
            const updatedStrokes = [...activePlacement.strokePoints, currentStroke];
            onUpdatePlacementStrokes?.(activePlacement.id, updatedStrokes);
        }

        setIsBrushing(false);
        setCurrentStroke([]);
    };

    // Handle stage click for polygon drawing or deselection
    const handleStageClick = (e: any) => {
        // If in placement mode, don't handle as click (brushing handles it)
        if (isPlacementMode) return;

        // If not in walls tool or not drawing, trigger empty click for deselection
        if (activeTool !== 'walls' || !isDrawing) {
            onEmptyClick?.();
            return;
        }

        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const { x, y } = screenToImageCoords(pointer);
        if (!isWithinImage(x, y)) return;

        // Check if clicking first point to close polygon (within 15px)
        if (currentPoints.length >= 6) {
            const firstX = currentPoints[0];
            const firstY = currentPoints[1];
            const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
            if (dist < 15) {
                onClosePolygon();
                return;
            }
        }

        onCanvasClick(x, y);
    };

    // Check if can finish polygon (3+ points = 6+ coords)
    const canFinish = currentPoints.length >= 6;

    // Render upload state
    if (!imageUrl && !isUploading) {
        return (
            <div ref={containerRef} className="flex-1 flex items-center justify-center bg-slate-950/40">
                <div
                    {...getRootProps()}
                    className={`
                        w-full max-w-lg mx-8 p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all
                        ${isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="w-20 h-20 mx-auto mb-6 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/[0.06]">
                        <ImageIcon size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-200 mb-2">Upload Your Room Photo</h3>
                    <p className="text-sm text-gray-500 mb-6">Drag & drop or click to browse</p>
                    <button className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
                        Choose File
                    </button>
                    <p className="text-xs text-gray-600 mt-4">Supported: JPG, PNG (max 10MB)</p>
                </div>
            </div>
        );
    }

    // Render uploading state
    if (isUploading) {
        return (
            <div ref={containerRef} className="flex-1 flex items-center justify-center bg-slate-950/40">
                <div className="text-center">
                    <Loader2 size={48} className="mx-auto text-orange-500 animate-spin mb-4" />
                    <p className="text-gray-300 font-medium mb-2">Uploading...</p>
                    <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                        <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{Math.round(uploadProgress)}%</p>
                </div>
            </div>
        );
    }

    // Cursor style based on mode
    let cursorStyle = 'default';
    if (activeTool === 'walls' && isDrawing) {
        cursorStyle = 'crosshair';
    } else if (isPlacementMode || isAIMode) {
        cursorStyle = 'none'; // We'll render a custom cursor
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 relative bg-slate-950/40 overflow-hidden"
            onMouseMove={handleContainerMouseMove}
            style={{ cursor: cursorStyle }}
        >
            {/* Placement Active Banner */}
            {isPlacementMode && activePlacement && (
                <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 
                               bg-slate-900/95 backdrop-blur-xl border rounded-lg shadow-xl"
                    style={{ borderColor: activePlacement.color }}
                >
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: activePlacement.color }}
                    />
                    <span className="text-sm text-white font-medium">
                        Placing: {activePlacement.name}
                    </span>
                    <Brush size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Draw where to place</span>
                </div>
            )}

            {/* Custom Brush Cursor - Product Placement */}
            {isPlacementMode && activePlacement && (
                <div
                    className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2
                               rounded-full border-2 opacity-80 shadow-sm"
                    style={{
                        width: 24,
                        height: 24,
                        borderColor: activePlacement.color,
                        backgroundColor: `${activePlacement.color}30`,
                        left: 'var(--mouse-x, -50px)',
                        top: 'var(--mouse-y, -50px)',
                        transition: 'transform 0.05s linear'
                    }}
                    id="brush-cursor"
                />
            )}

            {/* Custom Brush Cursor - AI Mode */}
            {isAIMode && (
                <div
                    className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2
                               rounded-full border-2 opacity-70"
                    style={{
                        width: aiBrushSize * scale,
                        height: aiBrushSize * scale,
                        borderColor: '#FF0000',
                        backgroundColor: 'rgba(255, 0, 0, 0.15)',
                        left: 'var(--mouse-x, -50px)',
                        top: 'var(--mouse-y, -50px)',
                        transition: 'width 0.1s, height 0.1s'
                    }}
                    id="ai-brush-cursor"
                />
            )}

            {/* @ts-ignore - react-konva has known type issues with React 18 */}
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable={!isDrawing && !isPlacementMode && !isAIMode}
                onDragEnd={(e: any) => {
                    if (!isDrawing && !isPlacementMode) {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                onClick={handleStageClick}
                onTap={handleStageClick}
                onMouseDown={handleBrushStart}
                onMouseMove={handleBrushMove}
                onMouseUp={handleBrushEnd}
                onMouseLeave={handleBrushEnd}
                onTouchStart={handleBrushStart}
                onTouchMove={handleBrushMove}
                onTouchEnd={handleBrushEnd}
            >
                {/* Base Image Layer */}
                {/* @ts-ignore */}
                <Layer>
                    {image && (
                        // @ts-ignore
                        <KonvaImage image={image} x={0} y={0} />
                    )}
                </Layer>

                {/* Product Placement Reference Layer - Brush Strokes */}
                {/* @ts-ignore */}
                <Layer>
                    {pendingPlacements.map(placement => (
                        <React.Fragment key={placement.id}>
                            {/* Existing strokes */}
                            {placement.strokePoints.map((stroke, idx) => (
                                // @ts-ignore
                                <Line
                                    key={`${placement.id}-stroke-${idx}`}
                                    points={stroke}
                                    stroke={placement.color}
                                    strokeWidth={20}
                                    lineCap="round"
                                    lineJoin="round"
                                    opacity={0.7}
                                    tension={0.5}
                                />
                            ))}
                        </React.Fragment>
                    ))}

                    {/* Current stroke being drawn */}
                    {isBrushing && currentStroke.length >= 4 && activePlacement && (
                        // @ts-ignore
                        <Line
                            points={currentStroke}
                            stroke={activePlacement.color}
                            strokeWidth={20}
                            lineCap="round"
                            lineJoin="round"
                            opacity={0.7}
                            tension={0.5}
                        />
                    )}
                </Layer>

                {/* AI Mask Layer - Red semi-transparent brush strokes */}
                {/* @ts-ignore */}
                <Layer>
                    {/* Existing AI mask strokes */}
                    {aiMaskStrokes.map((stroke, idx) => (
                        // @ts-ignore
                        <Line
                            key={`ai-mask-stroke-${idx}`}
                            points={stroke}
                            stroke="rgba(255, 0, 0, 0.4)"
                            strokeWidth={aiBrushSize}
                            lineCap="round"
                            lineJoin="round"
                            listening={false}
                        />
                    ))}

                    {/* Current AI stroke being drawn */}
                    {isBrushing && isAIMode && currentStroke.length >= 4 && (
                        // @ts-ignore
                        <Line
                            points={currentStroke}
                            stroke="rgba(255, 0, 0, 0.4)"
                            strokeWidth={aiBrushSize}
                            lineCap="round"
                            lineJoin="round"
                            listening={false}
                        />
                    )}
                </Layer>

                {/* Existing Walls Layer - only show selected wall */}
                {showWalls && (
                    // @ts-ignore
                    <Layer>
                        {walls.map(wall => {
                            if (selectedWallId !== wall.id) return null;

                            const displayPoints = denormalizePoints(
                                wall.polygonPoints,
                                imageSize.width || 1920,
                                imageSize.height || 1080
                            );

                            return (
                                // @ts-ignore
                                <Group key={wall.id}>
                                    {/* @ts-ignore */}
                                    <Line
                                        points={displayPoints}
                                        closed
                                        stroke='#f97316'
                                        strokeWidth={3}
                                        fill={wall.color ? `${wall.color}40` : 'rgba(59, 130, 246, 0.1)'}
                                    />
                                </Group>
                            );
                        })}
                    </Layer>
                )}

                {/* Drawing in Progress Layer */}
                {/* @ts-ignore */}
                <Layer>
                    {isDrawing && currentPoints.length >= 2 && (
                        <>
                            {/* @ts-ignore */}
                            <Line
                                points={currentPoints}
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dash={[6, 3]}
                                lineCap="round"
                                lineJoin="round"
                            />
                            {/* Vertex Points */}
                            {Array.from({ length: currentPoints.length / 2 }).map((_, i) => {
                                const x = currentPoints[i * 2];
                                const y = currentPoints[i * 2 + 1];
                                const isFirst = i === 0;
                                return (
                                    // @ts-ignore
                                    <Circle
                                        key={i}
                                        x={x}
                                        y={y}
                                        radius={isFirst && currentPoints.length >= 6 ? 8 : 5}
                                        fill={isFirst ? '#3b82f6' : '#fbbf24'}
                                        stroke={isFirst ? '#1d4ed8' : '#d97706'}
                                        strokeWidth={2}
                                    />
                                );
                            })}
                        </>
                    )}
                </Layer>
            </Stage>

            {/* Drawing Controls */}
            {isDrawing && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-xl">
                    <span className="text-xs text-gray-400">
                        {currentPoints.length / 2} point{currentPoints.length !== 2 ? 's' : ''}
                    </span>
                    {canFinish && (
                        <button
                            onClick={onClosePolygon}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded flex items-center gap-1"
                        >
                            <Check size={12} /> Finish
                        </button>
                    )}
                    <button
                        onClick={onCancelDrawing}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded flex items-center gap-1"
                    >
                        <X size={12} /> Cancel
                    </button>
                </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-lg p-1">
                <button onClick={handleZoomOut} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom Out">
                    <ZoomOut size={18} className="text-gray-300" />
                </button>
                <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="p-2 hover:bg-white/10 rounded transition-colors" title="Zoom In">
                    <ZoomIn size={18} className="text-gray-300" />
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={handleFitToScreen} className="p-2 hover:bg-white/10 rounded transition-colors" title="Fit to Screen">
                    <Maximize2 size={18} className="text-gray-300" />
                </button>
            </div>
        </div>
    );
});

Canvas.displayName = 'Canvas';
