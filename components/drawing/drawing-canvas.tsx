'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DrawingData, DrawingStroke, DrawingTool } from '@/types/note';
import { 
  Palette, 
  Pen, 
  Brush, 
  Eraser, 
  Square, 
  Circle as CircleIcon, 
  Type,
  Undo,
  Redo,
  Save,
  Download,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  initialData?: DrawingData;
  onSave: (data: DrawingData) => void;
  width?: number;
  height?: number;
  readonly?: boolean;
}

export function DrawingCanvas({ 
  initialData, 
  onSave, 
  width = 800, 
  height = 600, 
  readonly = false 
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<DrawingStroke[]>(initialData?.strokes || []);
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#000000',
    width: 2,
    opacity: 1
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [history, setHistory] = useState<DrawingStroke[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#ffffff'
  ];

  const tools = [
    { type: 'pen' as const, icon: Pen, label: 'Pen' },
    { type: 'brush' as const, icon: Brush, label: 'Brush' },
    { type: 'eraser' as const, icon: Eraser, label: 'Eraser' },
    { type: 'shape' as const, icon: Square, label: 'Rectangle' },
  ];

  const handleMouseDown = useCallback((e: any) => {
    if (readonly) return;
    
    const pos = e.target.getStage().getPointerPosition();
    
    if (currentTool.type === 'pen' || currentTool.type === 'brush' || currentTool.type === 'eraser') {
      setIsDrawing(true);
      const newStroke: DrawingStroke = {
        id: Date.now().toString(),
        points: [pos.x, pos.y],
        color: currentTool.type === 'eraser' ? '#ffffff' : currentTool.color,
        width: currentTool.width,
        tool: currentTool.type,
        timestamp: Date.now()
      };
      setCurrentStroke(newStroke);
    }
  }, [currentTool, readonly]);

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing || readonly) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    if (currentStroke) {
      const newPoints = currentStroke.points.concat([point.x, point.y]);
      const updatedStroke = { ...currentStroke, points: newPoints };
      setCurrentStroke(updatedStroke);
    }
  }, [isDrawing, currentStroke, readonly]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || readonly) return;
    
    setIsDrawing(false);
    if (currentStroke) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setCurrentStroke(null);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStrokes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [isDrawing, currentStroke, strokes, history, historyIndex, readonly]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStrokes(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStrokes(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const clear = useCallback(() => {
    setStrokes([]);
    setHistory([[]]);
    setHistoryIndex(0);
  }, []);

  const saveDrawing = useCallback(() => {
    const canvas = stageRef.current?.toDataURL();
    const drawingData: DrawingData = {
      canvas,
      strokes,
      dimensions: { width, height },
      tools: [currentTool]
    };
    onSave(drawingData);
  }, [strokes, width, height, currentTool, onSave]);

  const exportDrawing = useCallback(() => {
    const dataURL = stageRef.current?.toDataURL();
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
    setZoom(newZoom);
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readonly && (
        <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {tools.map((tool) => (
              <Button
                key={tool.type}
                variant={currentTool.type === tool.type ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentTool({ ...currentTool, type: tool.type })}
                className="h-8 w-8 p-0"
              >
                <tool.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentTool({ ...currentTool, color })}
                className={cn(
                  "w-6 h-6 rounded border-2 transition-all",
                  currentTool.color === color ? "border-foreground scale-110" : "border-muted-foreground/30"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Brush Size */}
          <div className="flex items-center gap-2 min-w-32">
            <span className="text-sm">Size:</span>
            <Slider
              value={[currentTool.width]}
              onValueChange={([value]) => setCurrentTool({ ...currentTool, width: value })}
              max={20}
              min={1}
              step={1}
              className="flex-1"
            />
            <span className="text-sm w-6">{currentTool.width}</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleZoom(-0.1)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm px-1">{Math.round(zoom * 100)}%</span>
            <Button
              onClick={() => handleZoom(0.1)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              onClick={clear}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Save/Export */}
          <div className="flex items-center gap-1">
            <Button onClick={saveDrawing} size="sm" className="h-8">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button onClick={exportDrawing} variant="outline" size="sm" className="h-8">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 overflow-hidden bg-white">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={zoom}
          scaleY={zoom}
          x={position.x}
          y={position.y}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          className="cursor-crosshair"
        >
          <Layer ref={layerRef}>
            {/* Existing strokes */}
            {strokes.map((stroke) => (
              <Line
                key={stroke.id}
                points={stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  stroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
            
            {/* Current stroke being drawn */}
            {currentStroke && (
              <Line
                points={currentStroke.points}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  currentStroke.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-sm text-muted-foreground">
        <div>Strokes: {strokes.length}</div>
        <div>Tool: {currentTool.type} | Size: {currentTool.width} | Color: {currentTool.color}</div>
        <div>Zoom: {Math.round(zoom * 100)}%</div>
      </div>
    </div>
  );
}
