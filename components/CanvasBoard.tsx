import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Pen, Trash2, Undo } from 'lucide-react';

interface CanvasBoardProps {
  strokeColor?: string;
  lineWidth?: number;
  disabled?: boolean;
}

export interface CanvasBoardRef {
  getImageData: () => string;
  clearCanvas: () => void;
  isEmpty: () => boolean;
}

const CHRISTMAS_COLORS = [
  '#000000', // Black
  '#DC2626', // Red
  '#16A34A', // Green
  '#CA8A04', // Gold
  '#78350F', // Brown
  '#2563EB', // Blue
];

const CanvasBoard = forwardRef<CanvasBoardRef, CanvasBoardProps>(({ 
  strokeColor = '#000000', 
  lineWidth = 3,
  disabled = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [activeColor, setActiveColor] = useState(strokeColor);

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return '';
    },
    clearCanvas: handleClear,
    isEmpty: () => history.length === 0 && !isDrawing
  }));

  useEffect(() => {
    const initCanvas = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = activeColor;
                ctx.lineWidth = lineWidth;
                setContext(ctx);
            }
        }
    };

    initCanvas();
    
    // Handle resize
    const handleResize = () => {
        initCanvas(); // In a real app we might want to preserve content on resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update context styles when state changes
  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'eraser' ? '#ffffff' : activeColor;
      context.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    }
  }, [activeColor, lineWidth, context, tool]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / (rect.width * dpr);
    const scaleY = canvas.height / (rect.height * dpr);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !context || !canvasRef.current) return;
    
    setHistory(prev => [...prev.slice(-10), context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
    
    const { x, y } = getCoordinates(e);
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || !context) return;
    e.preventDefault(); 
    const { x, y } = getCoordinates(e);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!context || !canvasRef.current) return;
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0 || !context || !canvasRef.current) return;
    const previousState = history[history.length - 1];
    context.putImageData(previousState, 0, 0);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleColorSelect = (color: string) => {
      setActiveColor(color);
      setTool('pen');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-square md:aspect-[4/3] bg-white rounded-xl shadow-inner border-4 border-gray-200 overflow-hidden cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-4 w-full">
         {/* Color Palette - Touch Friendly */}
         <div className="flex gap-3 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
            {CHRISTMAS_COLORS.map(color => (
                <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-full border-4 transition-all ${activeColor === color && tool === 'pen' ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent active:scale-95'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                />
            ))}
         </div>

         {/* Tools - Wrap on small screens */}
         <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/80 backdrop-blur rounded-2xl md:rounded-full shadow-lg border border-gray-100">
            <button 
              onClick={() => setTool('pen')}
              className={`p-3 rounded-full transition-all ${tool === 'pen' ? 'scale-110 shadow-md text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={{ backgroundColor: tool === 'pen' ? activeColor : undefined }}
              title="Pen"
            >
              <Pen size={20} />
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-full transition-all ${tool === 'eraser' ? 'bg-red-500 text-white scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Eraser"
            >
              <Eraser size={20} />
            </button>
            <div className="w-px h-10 bg-gray-300 mx-2 hidden md:block"></div>
            <button 
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button 
              onClick={handleClear}
              className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              title="Clear Board"
            >
              <Trash2 size={20} />
            </button>
         </div>
      </div>
    </div>
  );
});

CanvasBoard.displayName = 'CanvasBoard';

export default CanvasBoard;