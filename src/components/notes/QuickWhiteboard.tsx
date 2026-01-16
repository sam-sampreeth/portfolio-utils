import React, { useState, useRef, useEffect } from 'react';

import {
    MousePointer2, Square, Circle, Type, Pencil, Image as ImageIcon,
    Eraser, Undo2, Redo2, Download, Lock, Unlock,
    Trash2, Maximize, Minimize, Grid, Hand, ZoomIn, ZoomOut, RotateCcw,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- Types ---

type ToolType = 'select' | 'hand' | 'rect' | 'circle' | 'text' | 'pencil';

interface BaseElement {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'pencil' | 'image';
    x: number;
    y: number;
    color: string;
    isLocked?: boolean;
}

interface ShapeElement extends BaseElement {
    type: 'rect' | 'circle';
    width: number;
    height: number;
    fill: string;
}

interface TextElement extends BaseElement {
    type: 'text';
    content: string;
    fontSize: number;
}

interface PencilElement extends BaseElement {
    type: 'pencil';
    points: { x: number, y: number }[];
    strokeWidth: number;
}

interface ImageElement extends BaseElement {
    type: 'image';
    dataUrl: string; // Base64
    width: number;
    height: number;
}

type WhiteboardElement = ShapeElement | TextElement | PencilElement | ImageElement;

type BackgroundType = 'grid-dark' | 'grid-light' | 'dark' | 'light';

// --- Constants ---
const STORAGE_KEY = 'quick-whiteboard-data';
const MAX_HISTORY = 50;

const COLORS = [
    '#ffffff', '#9ca3af', '#000000', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#6366f1', '#a855f7'
];

export const QuickWhiteboard = () => {
    // --- State ---
    const [elements, setElements] = useState<WhiteboardElement[]>([]);
    const [history, setHistory] = useState<WhiteboardElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // View State
    const [tool, setTool] = useState<ToolType>('select');
    const [color, setColor] = useState('#3b82f6');
    const [background, setBackground] = useState<BackgroundType>('grid-dark');
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // UI State
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

    // Export Dialog State
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportName, setExportName] = useState('whiteboard');
    const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'svg'>('png');

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const startPosRef = useRef<{ x: number, y: number } | null>(null);
    const isDraggingRef = useRef(false);
    const isPanningRef = useRef(false);
    const lastMousePosRef = useRef<{ x: number, y: number } | null>(null);
    const isSpaceDownRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const colorBtnRef = useRef<HTMLButtonElement>(null);

    // --- Helpers ---
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const getMousePos = (e: React.MouseEvent) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const rect = svgRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - panOffset.x) / zoom,
            y: (e.clientY - rect.top - panOffset.y) / zoom
        };
    };

    // --- History ---
    const addToHistory = (newElements: WhiteboardElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        if (newHistory.length > MAX_HISTORY) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setElements(history[historyIndex - 1]);
            setSelectedId(null);
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setElements([]);
            setSelectedId(null);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setElements(history[historyIndex + 1]);
            setSelectedId(null);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // --- Zoom Ops ---
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
    const handleResetZoom = () => { setZoom(1); setPanOffset({ x: 0, y: 0 }); };

    // --- Keyboard & Paste ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editingId || showExportDialog) return;

            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) handleDelete();
            }
            if (e.code === 'Space' && !e.repeat) {
                isSpaceDownRef.current = true;
            }
            // Zoom shortcuts
            if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); handleZoomIn(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); handleZoomOut(); }
            if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); handleResetZoom(); }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpaceDownRef.current = false;
            }
        };

        const handlePaste = (e: ClipboardEvent) => {
            if (editingId) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    if (!blob) continue;
                    processImageFile(blob);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('paste', handlePaste);
        };
    }, [historyIndex, history, selectedId, editingId, showExportDialog]);

    const processImageFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                // constrain max size
                if (w > 500) { const r = 500 / w; w = 500; h = h * r; }

                const centerX = (-panOffset.x + (svgRef.current?.clientWidth || 800) / 2) / zoom - w / 2;
                const centerY = (-panOffset.y + (svgRef.current?.clientHeight || 600) / 2) / zoom - h / 2;

                const newEl: ImageElement = {
                    id: generateId(),
                    type: 'image',
                    x: centerX, y: centerY, width: w, height: h,
                    dataUrl: event.target?.result as string,
                    color: 'transparent'
                };
                const newElements = [...elements, newEl];
                setElements(newElements);
                addToHistory(newElements);
                setTool('select');
                toast.success("Image added");
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // --- Persistence ---
    useEffect(() => {
        const load = async () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    const binaryString = atob(stored);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
                    const text = await new Response(stream).text();
                    const data = JSON.parse(text);
                    if (Array.isArray(data)) {
                        setElements(data);
                        setHistory([data]);
                        setHistoryIndex(0);
                    }
                } catch (e) {
                    console.error("Failed to load", e);
                }
            }
        };
        load();
    }, []);

    useEffect(() => {
        const saveTimeout = setTimeout(async () => {
            if (elements.length === 0) { localStorage.removeItem(STORAGE_KEY); return; }
            try {
                const json = JSON.stringify(elements);
                const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
                const buf = await new Response(stream).arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(buf);
                for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
                localStorage.setItem(STORAGE_KEY, btoa(binary));
            } catch (e) { console.error("Save failed", e); }
        }, 2000);
        return () => clearTimeout(saveTimeout);
    }, [elements]);

    // --- Interaction ---
    const handleMouseDown = (e: React.MouseEvent) => {
        // Close color picker
        if (showColorPicker) setShowColorPicker(false);

        if (isLocked) return;

        // Panning Init
        if (tool === 'hand' || e.button === 1 || (e.button === 0 && isSpaceDownRef.current)) {
            e.preventDefault();
            isPanningRef.current = true;
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (e.button !== 0) return; // Left click only for drawing

        const pos = getMousePos(e);
        startPosRef.current = pos;
        isDraggingRef.current = true;

        if (selectedId && tool === 'select') {
            const el = elements.find(el => el.id === selectedId);
            if (el && (el.type === 'rect' || el.type === 'image' || el.type === 'circle')) {
                const r = el as ShapeElement | ImageElement;
                const handles = {
                    nw: { x: r.x - 5 / zoom, y: r.y - 5 / zoom },
                    ne: { x: r.x + r.width - 5 / zoom, y: r.y - 5 / zoom },
                    sw: { x: r.x - 5 / zoom, y: r.y + r.height - 5 / zoom },
                    se: { x: r.x + r.width - 5 / zoom, y: r.y + r.height - 5 / zoom }
                };
                // Check handles (larger hit area)
                const hitDist = 10 / zoom;
                for (const [key, h] of Object.entries(handles)) {
                    if (Math.abs(pos.x - h.x) < hitDist && Math.abs(pos.y - h.y) < hitDist) {
                        setResizeHandle(key);
                        return;
                    }
                }
            }
        }

        if (tool === 'select') {
            const clickedId = [...elements].reverse().find(el => {
                if (el.isLocked) return false;
                if (el.type === 'rect' || el.type === 'image') {
                    const r = el as ShapeElement | ImageElement;
                    return pos.x >= r.x && pos.x <= r.x + r.width && pos.y >= r.y && pos.y <= r.y + r.height;
                }
                if (el.type === 'circle') {
                    const c = el as ShapeElement;
                    const cx = c.x + c.width / 2;
                    const cy = c.y + c.height / 2;
                    return Math.sqrt(Math.pow(pos.x - cx, 2) + Math.pow(pos.y - cy, 2)) <= c.width / 2;
                }
                if (el.type === 'text') {
                    const t = el as TextElement;
                    return pos.x >= t.x && pos.x <= t.x + (t.content.length * t.fontSize * 0.6) && pos.y >= t.y - t.fontSize && pos.y <= t.y;
                }
                if (el.type === 'pencil') {
                    // Simple bounding box check for pencil to start
                    const p = el as PencilElement;
                    const minX = Math.min(...p.points.map(pt => pt.x));
                    const maxX = Math.max(...p.points.map(pt => pt.x));
                    const minY = Math.min(...p.points.map(pt => pt.y));
                    const maxY = Math.max(...p.points.map(pt => pt.y));
                    if (pos.x >= minX - 5 && pos.x <= maxX + 5 && pos.y >= minY - 5 && pos.y <= maxY + 5) return true;
                }
                return false;
            })?.id;

            setSelectedId(clickedId || null);
            setResizeHandle(null);
            if (!clickedId) setEditingId(null);
            return;
        }

        if (tool === 'text') {
            const newEl: TextElement = {
                id: generateId(), type: 'text', x: pos.x, y: pos.y,
                content: "Double click to edit", fontSize: 24, color
            };
            const newElements = [...elements, newEl];
            setElements(newElements);
            addToHistory(newElements);
            setTool('select');
            isDraggingRef.current = false;
            return;
        }

        const id = generateId();
        let newEl: WhiteboardElement | null = null;
        if (tool === 'rect' || tool === 'circle') {
            newEl = { id, type: tool, x: pos.x, y: pos.y, width: 0, height: 0, color, fill: 'transparent' } as ShapeElement;
        } else if (tool === 'pencil') {
            newEl = { id, type: 'pencil', x: pos.x, y: pos.y, points: [{ x: pos.x, y: pos.y }], color, strokeWidth: 2 / zoom } as PencilElement;
        }

        if (newEl) {
            setElements(prev => [...prev, newEl!]);
            setSelectedId(id);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isLocked) return;

        // Panning
        if (isPanningRef.current && lastMousePosRef.current) {
            const dx = e.clientX - lastMousePosRef.current.x;
            const dy = e.clientY - lastMousePosRef.current.y;
            setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (!isDraggingRef.current) return;
        const pos = getMousePos(e);
        const startPos = startPosRef.current;
        if (!startPos) return;

        // Resizing
        if (resizeHandle && selectedId) {
            setElements(prev => prev.map(el => {
                if (el.id !== selectedId) return el;
                const r = el as ShapeElement | ImageElement;
                const dx = pos.x - startPos.x;
                const dy = pos.y - startPos.y;

                if (resizeHandle === 'se') return { ...el, width: Math.max(10, r.width + dx), height: Math.max(10, r.height + dy) };
                if (resizeHandle === 'sw') return { ...el, x: r.x + dx, width: Math.max(10, r.width - dx), height: Math.max(10, r.height + dy) };
                if (resizeHandle === 'ne') return { ...el, y: r.y + dy, width: Math.max(10, r.width + dx), height: Math.max(10, r.height - dy) };
                if (resizeHandle === 'nw') return { ...el, x: r.x + dx, y: r.y + dy, width: Math.max(10, r.width - dx), height: Math.max(10, r.height - dy) };
                return el;
            }));
            startPosRef.current = pos;
            return;
        }

        // Moving (only if select tool)
        if (tool === 'select' && selectedId) {
            const dx = pos.x - startPos.x;
            const dy = pos.y - startPos.y;
            setElements(prev => prev.map(el => {
                if (el.id !== selectedId) return el;
                if (el.type === 'pencil') {
                    const p = el as PencilElement;
                    return { ...p, points: p.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
                }
                return { ...el, x: el.x + dx, y: el.y + dy };
            }));
            startPosRef.current = pos;
            return;
        }

        // Creating
        if (tool === 'rect' || tool === 'circle' || tool === 'pencil') {
            setElements(prev => {
                const last = prev[prev.length - 1];
                if (!last || last.type !== tool) return prev;

                if (tool === 'rect' || tool === 'circle') {
                    const startX = startPos.x;
                    const startY = startPos.y;
                    const width = Math.abs(pos.x - startX);
                    const height = Math.abs(pos.y - startY);
                    const x = pos.x < startX ? pos.x : startX;
                    const y = pos.y < startY ? pos.y : startY;
                    return prev.map(el => el.id === last.id ? { ...el, x, y, width, height } : el);
                } else if (tool === 'pencil') {
                    const p = last as PencilElement;
                    return prev.map(el => el.id === last.id ? { ...p, points: [...p.points, pos] } : el);
                }
                return prev;
            });
        }
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current) {
            addToHistory(elements);
            // Auto-switch to cursor if we just drew a shape
            // (We check isDraggingRef was true, meaning we likely completed a draw/move)
            if (tool === 'rect' || tool === 'circle') {
                setTool('select');
            }
        }
        isPanningRef.current = false;
        isDraggingRef.current = false;
        startPosRef.current = null;
        lastMousePosRef.current = null;
        setResizeHandle(null);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const pos = getMousePos(e);
        const clickedId = [...elements].reverse().find(el => {
            if (el.type !== 'text') return false;
            const t = el as TextElement;
            return pos.x >= t.x && pos.x <= t.x + (t.content.length * t.fontSize * 0.6) && pos.y >= t.y - t.fontSize && pos.y <= t.y;
        })?.id;

        if (clickedId) {
            setEditingId(clickedId);
            setTool('select');
        }
    };

    const handleTextChange = (id: string, newContent: string) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, content: newContent } : el));
    };

    const handleDelete = () => {
        if (selectedId) {
            const newElements = elements.filter(el => el.id !== selectedId);
            setElements(newElements);
            addToHistory(newElements);
            setSelectedId(null);
            toast.success("Deleted");
        }
    };

    const handleClear = () => {
        if (window.confirm("Clear entire whiteboard?")) {
            setElements([]);
            addToHistory([]);
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const handleExport = () => {
        if (!svgRef.current) return;

        // Finalize export
        const canvas = document.createElement("canvas");
        // Get bounding box of content + some padding
        // For simplicity: Export current VIEWPORT size, but we need to render the content at current scale
        // OR better: Export the entire content BBox. 
        // Let's stick to viewport for "What you see is what you get" but without the UI.

        const width = svgRef.current.clientWidth;
        const height = svgRef.current.clientHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Serialize SVG with current Transform
        // We need to inject the background
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        img.onload = () => {
            // Fill background
            if (exportFormat !== 'svg') {
                if (background.includes('light')) {
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.fillStyle = "#0a0a0a";
                }
                // If user wants transparent, specific format handling needed. 
                // JPEG no transparency. PNG yes.
                // Assuming standard opaque export for now unless grid is off?
                // Let's force opaque background for consistency unless it's SVG export logic.
                ctx.fillRect(0, 0, width, height);
            }

            ctx.drawImage(img, 0, 0);

            const a = document.createElement("a");
            a.download = `${exportName || 'whiteboard'}.${exportFormat}`;

            if (exportFormat === 'svg') {
                a.href = url; // Directly download SVG blob
            } else {
                a.href = canvas.toDataURL(`image/${exportFormat}`);
            }
            a.click();
            URL.revokeObjectURL(url);
            setShowExportDialog(false);
            toast.success("Exported!");
        };
        img.src = url;
    };

    // --- Render Helpers ---
    const getBgStyle = () => {
        switch (background) {
            case 'grid-dark': return { className: 'bg-[#050505]', grid: true, dark: true };
            case 'grid-light': return { className: 'bg-white', grid: true, dark: false };
            case 'dark': return { className: 'bg-[#050505]', grid: false, dark: true };
            case 'light': return { className: 'bg-white', grid: false, dark: false };
        }
    };
    const bgConfig = getBgStyle();

    const renderResizeHandles = (el: ShapeElement | ImageElement) => {
        if (selectedId !== el.id || isLocked) return null;
        const hSize = 8 / zoom;
        const handles = [
            { cursor: 'nw-resize', x: el.x - hSize / 2, y: el.y - hSize / 2 },
            { cursor: 'ne-resize', x: el.x + el.width - hSize / 2, y: el.y - hSize / 2 },
            { cursor: 'sw-resize', x: el.x - hSize / 2, y: el.y + el.height - hSize / 2 },
            { cursor: 'se-resize', x: el.x + el.width - hSize / 2, y: el.y + el.height - hSize / 2 },
        ];
        return (
            <>
                {handles.map((h, i) => (
                    <rect key={i} x={h.x} y={h.y} width={hSize} height={hSize} fill={background.includes('light') ? '#3b82f6' : 'white'} stroke="#3b82f6" strokeWidth={1 / zoom} style={{ cursor: h.cursor }} />
                ))}
            </>
        );
    };

    const renderElement = (el: WhiteboardElement) => {
        const isSelected = selectedId === el.id;
        const selectionClass = isSelected ? "outline outline-1 outline-blue-500/50" : "";
        const style = { cursor: isLocked ? 'default' : 'move' };

        switch (el.type) {
            case 'rect':
                const r = el as ShapeElement;
                return (
                    <g key={r.id}>
                        <rect x={r.x} y={r.y} width={r.width} height={r.height} stroke={r.color} strokeWidth={2 / zoom} fill={r.fill} className={selectionClass} style={style} />
                        {renderResizeHandles(r)}
                    </g>
                );
            case 'circle':
                const c = el as ShapeElement;
                return (
                    <g key={c.id}>
                        <ellipse cx={c.x + c.width / 2} cy={c.y + c.height / 2} rx={c.width / 2} ry={c.height / 2} stroke={c.color} strokeWidth={2 / zoom} fill={c.fill} className={selectionClass} style={style} />
                        {renderResizeHandles(c)}
                    </g>
                );
            case 'image':
                const img = el as ImageElement;
                return (
                    <g key={img.id}>
                        <image href={img.dataUrl} x={img.x} y={img.y} width={img.width} height={img.height} className={`select-none ${selectionClass}`} style={style} />
                        {renderResizeHandles(img)}
                    </g>
                );
            case 'text':
                const t = el as TextElement;
                if (editingId === t.id) {
                    return (
                        <foreignObject key={t.id} x={t.x} y={t.y - t.fontSize} width={Math.max(200, t.content.length * 15)} height={t.fontSize * 2 + 10}>
                            <input
                                autoFocus
                                value={t.content}
                                onChange={(e) => handleTextChange(t.id, e.target.value)}
                                onBlur={() => { setEditingId(null); addToHistory(elements); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { setEditingId(null); addToHistory(elements); } }}
                                style={{
                                    fontSize: t.fontSize, color: t.color, background: 'transparent',
                                    border: '1px dashed #555', outline: 'none', width: '100%'
                                }}
                            />
                        </foreignObject>
                    );
                }
                return <text key={t.id} x={t.x} y={t.y} fill={t.color} fontSize={t.fontSize} className={`select-none ${selectionClass}`} style={style}>{t.content}</text>;
            case 'pencil':
                const p = el as PencilElement;
                const pathData = `M ${p.points.map(pt => `${pt.x} ${pt.y}`).join(' L ')}`;
                return <path key={p.id} d={pathData} stroke={p.color} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" className={selectionClass} style={style} />;
            default: return null;
        }
    };

    const ToolButton = ({ t, icon: Icon, title, active = false, onClick }: { t?: ToolType, icon: any, title: string, active?: boolean, onClick?: () => void }) => (
        <button
            onClick={onClick || (() => t && setTool(t))}
            className={`p-3 rounded-lg transition-colors relative group ${active || (t && tool === t)
                ? 'bg-blue-600 text-white'
                : bgConfig.dark ? 'text-white/60 hover:bg-white/10' : 'text-black/60 hover:bg-black/10'}`}
            title={title}
        >
            <Icon size={20} />
            {/* Simple tooltip fallback if native title isn't enough - but sticking to pure title for now */}
        </button>
    );

    return (
        <div ref={containerRef} className={`flex flex-col relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#020202] w-full h-full overflow-hidden' : 'h-[calc(100vh-12rem)] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'}`}>
            <div className={`flex flex-col h-full ${isFullscreen ? '' : ''}`}>

                {/* Header */}
                <div className={`flex items-center ${isFullscreen ? 'absolute top-6 right-6 z-50 gap-2' : 'justify-between shrink-0'}`}>
                    {!isFullscreen && (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Pencil size={24} />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black tracking-tight ${bgConfig.dark ? 'text-white' : 'text-black'}`}>Quick Whiteboard</h2>
                                <p className={`${bgConfig.dark ? 'text-white/50' : 'text-black/50'} font-medium text-sm flex items-center gap-2`}>
                                    <span>Infinite Canvas</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>Zoom: {Math.round(zoom * 100)}%</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={`flex items-center gap-2 ${isFullscreen ? 'bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10' : ''}`}>
                        {/* Backgrounds */}
                        <div className={`flex items-center gap-1 rounded-lg border p-1 ${bgConfig.dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                            <button onClick={() => setBackground('grid-dark')} className={`p-1.5 rounded ${background === 'grid-dark' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Dark Grid"><Grid size={16} /></button>
                            <button onClick={() => setBackground('grid-light')} className={`p-1.5 rounded ${background === 'grid-light' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Light Grid"><Grid size={16} className="text-current" /></button>
                            <button onClick={() => setBackground('dark')} className={`p-1.5 rounded ${background === 'dark' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Dark Solid"><Square size={16} fill="currentColor" /></button>
                            <button onClick={() => setBackground('light')} className={`p-1.5 rounded ${background === 'light' ? 'bg-blue-600 text-white' : 'text-gray-400'}`} title="Light Solid"><Square size={16} fill="currentColor" className="stroke-2" /></button>
                        </div>

                        <div className={`w-px h-6 mx-2 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        {/* Zoom Controls */}
                        <div className={`flex items-center gap-1 rounded-lg border p-1 ${bgConfig.dark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                            <button onClick={handleZoomOut} className="p-1.5 rounded text-gray-400 hover:text-white" title="Zoom Out (-)"><ZoomOut size={16} /></button>
                            <button onClick={handleResetZoom} className="p-1.5 rounded text-gray-400 hover:text-white" title="Reset Zoom (0)"><RotateCcw size={14} /></button>
                            <button onClick={handleZoomIn} className="p-1.5 rounded text-gray-400 hover:text-white" title="Zoom In (+)"><ZoomIn size={16} /></button>
                        </div>

                        <div className={`w-px h-6 mx-2 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <button
                            onClick={handleUndo} disabled={historyIndex <= 0}
                            className={`p-2 rounded transition-colors ${bgConfig.dark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'} ${historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={20} />
                        </button>
                        <button
                            onClick={handleRedo} disabled={historyIndex >= history.length - 1}
                            className={`p-2 rounded transition-colors ${bgConfig.dark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'} ${historyIndex >= history.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 size={20} />
                        </button>

                        <div className={`w-px h-6 mx-2 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <button
                            onClick={toggleFullscreen}
                            className={`p-2 transition-colors ${bgConfig.dark ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>

                        <div className={`w-px h-6 mx-2 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <button onClick={() => setShowExportDialog(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors" title="Export Image">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex gap-6 flex-1 min-h-0 relative">
                    {/* Toolbar */}
                    <div
                        onScroll={() => { if (showColorPicker) setShowColorPicker(false); }}
                        className={`shrink-0 flex flex-col gap-2 p-2 border rounded-xl overflow-y-auto ${bgConfig.dark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/10'}`}
                    >
                        <ToolButton t="select" icon={MousePointer2} title="Select (V)" />
                        <ToolButton t="hand" icon={Hand} title="Pan Tool (Space)" />

                        <div className={`h-px mx-2 my-1 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <ToolButton t="rect" icon={Square} title="Rectangle (R)" />
                        <ToolButton t="circle" icon={Circle} title="Circle (C)" />
                        <ToolButton t="text" icon={Type} title="Text (T)" />
                        <ToolButton t="pencil" icon={Pencil} title="Pencil (P)" />

                        <div className={`h-px mx-2 my-1 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        {/* Image Upload */}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                            e.target.value = ''; // Reset
                        }} />
                        <ToolButton icon={ImageIcon} title="Upload Image" onClick={() => fileInputRef.current?.click()} />

                        <button
                            onClick={handleDelete}
                            className={`p-3 rounded-lg transition-colors hover:text-red-400 ${bgConfig.dark ? 'text-white/60 hover:bg-white/10' : 'text-black/60 hover:bg-black/10'}`}
                            title="Delete Selected (Del)"
                        >
                            <Eraser size={20} />
                        </button>

                        <div className={`h-px mx-2 my-1 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        {/* Color Picker Trigger */}
                        <div className="relative">
                            <button
                                ref={colorBtnRef}
                                onClick={() => {
                                    if (showColorPicker) {
                                        setShowColorPicker(false);
                                    } else if (colorBtnRef.current) {
                                        const rect = colorBtnRef.current.getBoundingClientRect();
                                        // Center align the popover relative to the button
                                        const popoverHeight = 180; // approximate height of 5 rows
                                        let top = rect.top + (rect.height / 2) - (popoverHeight / 2);

                                        // Simple containment check
                                        if (top + popoverHeight > window.innerHeight - 20) {
                                            top = window.innerHeight - popoverHeight - 20;
                                        }
                                        if (top < 20) top = 20;

                                        setPopoverPos({
                                            x: rect.right + 16, // bit more spacing 
                                            y: top
                                        });
                                        setShowColorPicker(true);
                                    }
                                }}
                                className={`p-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 hover:opacity-80 group relative ${showColorPicker ? 'ring-2 ring-blue-500' : ''}`}
                                title="Color Picker"
                            >
                                <div className="w-8 h-8 rounded-md shadow-sm border border-black/10 dark:border-white/10" style={{ backgroundColor: color }} />
                            </button>
                        </div>

                        <div className={`h-px mx-2 my-1 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <button
                            onClick={handleClear}
                            className={`p-3 rounded-lg transition-colors hover:text-red-400 mt-auto ${bgConfig.dark ? 'text-white/60 hover:bg-white/10' : 'text-black/60 hover:bg-black/10'}`}
                            title="Clear All (Trash)"
                        >
                            <Trash2 size={20} />
                        </button>

                        <div className={`h-px mx-2 my-1 ${bgConfig.dark ? 'bg-white/10' : 'bg-black/10'}`} />

                        <button
                            onClick={() => setIsLocked(!isLocked)}
                            className={`p-3 rounded-lg transition-colors ${isLocked ? 'text-red-500 bg-red-500/10' : bgConfig.dark ? 'text-white/60 hover:bg-white/10' : 'text-black/60 hover:bg-black/10'}`}
                            title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                        >
                            {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                        </button>
                    </div>

                    {/* Canvas */}
                    <div className={`flex-1 relative group rounded-2xl border overflow-hidden shadow-2xl ${bgConfig.className} ${bgConfig.dark ? 'border-white/10 shadow-black/50' : 'border-black/10 shadow-black/10'}`}>
                        {bgConfig.grid && (
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    backgroundImage: `linear-gradient(to right, ${bgConfig.dark ? '#80808012' : '#00000010'} 1px, transparent 1px), linear-gradient(to bottom, ${bgConfig.dark ? '#80808012' : '#00000010'} 1px, transparent 1px)`,
                                    backgroundSize: `${24 * zoom}px ${24 * zoom}px`, // Scale grid with zoom
                                    backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
                                }}
                            />
                        )}

                        <svg
                            ref={svgRef}
                            className="w-full h-full touch-none relative z-10"
                            style={{ cursor: (isPanningRef.current || tool === 'hand') ? 'grabbing' : isDraggingRef.current ? 'crosshair' : isSpaceDownRef.current ? 'grab' : 'default' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onDoubleClick={handleDoubleClick}
                        >
                            <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
                                {elements.length === 0 && (
                                    <text x="50%" y="50%" textAnchor="middle" fill={bgConfig.dark ? "#333" : "#ccc"} fontSize={20 / zoom} className="opacity-50 select-none pointer-events-none">
                                        Select a tool to start drawing
                                    </text>
                                )}
                                {elements.map(el => renderElement(el))}
                            </g>
                        </svg>

                        <div className={`absolute bottom-4 right-4 px-3 py-1.5 backdrop-blur-md rounded-full border text-xs font-mono pointer-events-none ${bgConfig.dark ? 'bg-black/50 border-white/10 text-white/40' : 'bg-white/50 border-black/10 text-black/40'}`}>
                            {elements.length} items
                        </div>
                    </div>

                    {/* Export Dialog Overlay (Shadcn Theme) */}
                    {showExportDialog && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className={`w-[400px] p-6 rounded-xl border shadow-lg ${bgConfig.dark ? 'bg-zinc-950 border-zinc-800 text-zinc-50' : 'bg-white border-zinc-200 text-zinc-950'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold leading-none tracking-tight">Export Whiteboard</h3>
                                        <p className={`text-sm mt-1.5 ${bgConfig.dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                            Save your canvas as an image.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowExportDialog(false)}
                                        className={`rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${bgConfig.dark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'}`}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Filename & Format
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={exportName}
                                                onChange={(e) => setExportName(e.target.value)}
                                                className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${bgConfig.dark ? 'border-zinc-800 bg-zinc-950 ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-300' : 'border-zinc-200 bg-white ring-offset-white placeholder:text-zinc-500 focus-visible:ring-zinc-950'}`}
                                                placeholder="filename"
                                            />
                                            <div className="relative">
                                                <select
                                                    value={exportFormat}
                                                    onChange={(e) => setExportFormat(e.target.value as any)}
                                                    className={`h-10 rounded-md border px-3 py-2 pl-3 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer ${bgConfig.dark ? 'border-zinc-800 bg-zinc-950 ring-offset-zinc-950 focus-visible:ring-zinc-300 hover:bg-zinc-900' : 'border-zinc-200 bg-white ring-offset-white focus-visible:ring-zinc-950 hover:bg-zinc-50'}`}
                                                >
                                                    <option value="png">.png</option>
                                                    <option value="jpeg">.jpeg</option>
                                                    <option value="svg">.svg</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-full mt-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Color Picker (Fixed Position - Outside Animated Container) */}
            {showColorPicker && (
                <>
                    <div
                        className="fixed z-[100] p-2 rounded-xl border shadow-xl grid grid-cols-2 gap-2 w-24 bg-white dark:bg-[#111] border-black/10 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200"
                        style={{ top: popoverPos.y, left: popoverPos.x }}
                    >
                        {COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); setShowColorPicker(false); }}
                                className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/10 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowColorPicker(false)} />
                </>
            )}
        </div>
    );
};
