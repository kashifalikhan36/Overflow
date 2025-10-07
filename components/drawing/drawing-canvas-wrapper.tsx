'use client';

import dynamic from 'next/dynamic';
import { DrawingData } from '@/types/note';

// Dynamically import the drawing canvas (client-side only)
const DrawingCanvasComponent = dynamic(
  () => import('./drawing-canvas').then(mod => mod.DrawingCanvas),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    )
  }
);

interface DrawingCanvasWrapperProps {
  onSave: (data: DrawingData) => void;
  initialData?: DrawingData;
}

export function DrawingCanvasWrapper(props: DrawingCanvasWrapperProps) {
  return <DrawingCanvasComponent {...props} />;
}
