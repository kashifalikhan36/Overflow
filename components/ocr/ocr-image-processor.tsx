'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { NoteImage } from '@/types/note';
// @ts-ignore
import Tesseract from 'tesseract.js';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Copy, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Loader2,
  Camera,
  X,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/context/preferences-context';

interface OCRImageProcessorProps {
  onSave: (images: NoteImage[]) => void;
  onTextExtracted?: (text: string) => void;
  initialImages?: NoteImage[];
  maxImages?: number;
  readonly?: boolean;
  enableOCR?: boolean;
}

export function OCRImageProcessor({ 
  onSave, 
  onTextExtracted, 
  initialImages = [], 
  maxImages = 10,
  readonly = false,
  enableOCR = true
}: OCRImageProcessorProps) {
  const [images, setImages] = useState<NoteImage[]>(initialImages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<NoteImage | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { showImages } = usePreferences();

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (readonly) return;
    
    const newImages: NoteImage[] = [];
    const remainingSlots = maxImages - images.length;
    
    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only add ${remainingSlots} more images.`,
        variant: "destructive",
      });
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        continue;
      }

      // Create image object
      const imageUrl = URL.createObjectURL(file);
      const image: NoteImage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        ocrText: ''
      };

      // Create thumbnail
      const thumbnail = await createThumbnail(file);
      if (thumbnail) {
        image.thumbnail = thumbnail;
      }

      // Get image dimensions
      const dimensions = await getImageDimensions(imageUrl);
      if (dimensions) {
        image.width = dimensions.width;
        image.height = dimensions.height;
      }

      newImages.push(image);

      // Process OCR if enabled
      if (enableOCR) {
        processOCR(image, file);
      }
    }

    setImages(prev => [...prev, ...newImages]);
  }, [images, maxImages, readonly, enableOCR, toast]);

  const createThumbnail = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const MAX_THUMB_SIZE = 200;
        const ratio = Math.min(MAX_THUMB_SIZE / img.width, MAX_THUMB_SIZE / img.height);
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const getImageDimensions = (url: string): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const processOCR = async (image: NoteImage, file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProcessingProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Update image with OCR text
      setImages(prev => prev.map(img => 
        img.id === image.id ? { ...img, ocrText: text.trim() } : img
      ));

      if (text.trim() && onTextExtracted) {
        onTextExtracted(text.trim());
      }

      toast({
        title: "OCR completed",
        description: `Extracted ${text.trim().split(' ').length} words from ${image.filename}`,
      });

    } catch (error) {
      toast({
        title: "OCR failed",
        description: `Could not extract text from ${image.filename}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const copyTextToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Text copied",
        description: "OCR text has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (image: NoteImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveImages = () => {
    onSave(images);
    toast({
      title: "Images saved",
      description: `${images.length} images saved to note`,
    });
  };

  const getAllExtractedText = () => {
    return images
      .filter(img => img.ocrText)
      .map(img => img.ocrText)
      .join('\n\n');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!readonly && (
        <Card
          className={cn(
            "border-2 border-dashed p-6 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            images.length >= maxImages && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop images here or click to browse
              </p>
              {enableOCR && (
                <p className="text-sm text-muted-foreground">
                  OCR will automatically extract text from your images
                </p>
              )}
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= maxImages}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              {images.length} / {maxImages} images uploaded
            </p>
          </div>
        </Card>
      )}

      {/* OCR Processing */}
      {isProcessing && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">Processing OCR...</span>
            </div>
            <Progress value={processingProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Extracting text from images ({processingProgress}%)
            </p>
          </div>
        </Card>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Uploaded Images</h3>
            {!readonly && (
              <Button onClick={saveImages} size="sm">
                Save All Images
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative group">
                  {showImages ? (
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                      Preview hidden
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {!readonly && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* OCR Indicator */}
                  {image.ocrText && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <FileText className="h-3 w-3" />
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <p className="text-sm font-medium truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {image.ocrText && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {image.ocrText.split(' ').length} words extracted
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Text Summary */}
      {enableOCR && images.some(img => img.ocrText) && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Extracted Text
              </h3>
              <Button
                onClick={() => copyTextToClipboard(getAllExtractedText())}
                size="sm"
                variant="outline"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy All
              </Button>
            </div>
            
            <Textarea
              value={getAllExtractedText()}
              readOnly
              className="min-h-32 resize-none"
              placeholder="No text extracted yet..."
            />
          </div>
        </Card>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{selectedImage.filename}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-96 mx-auto rounded"
              />
              
              {selectedImage.ocrText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Extracted Text</h4>
                    <Button
                      onClick={() => copyTextToClipboard(selectedImage.ocrText!)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={selectedImage.ocrText}
                    readOnly
                    className="min-h-32"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
