'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, 
  SquareCheck as CheckSquare, 
  Image, 
  Mic, 
  Palette, 
  X, 
  Save, 
  Pin, 
  Clock, 
  Tag, 
  MoveHorizontal as MoreHorizontal,
  Brush,
  Share2,
  Copy,
  Edit3,
  FileText,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DrawingCanvas } from '@/components/drawing/drawing-canvas';
import { AudioRecorder } from '@/components/audio/audio-recorder';
import { OCRImageProcessor } from '@/components/ocr/ocr-image-processor';
import { 
  NoteType, 
  NoteColor, 
  NOTE_COLORS, 
  ChecklistItem, 
  DrawingData, 
  NoteImage,
  Reminder
} from '@/types/note';
import { useCreateNote } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CreateNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNoteModal({ open, onOpenChange }: CreateNoteModalProps) {
  const [noteType, setNoteType] = useState<NoteType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('default');
  const [pinned, setPinned] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTranscription, setAudioTranscription] = useState<string>('');
  const [images, setImages] = useState<NoteImage[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  
  const createNoteMutation = useCreateNote();

  const noteTypes = [
    { type: 'text' as NoteType, label: 'Text', icon: Type, description: 'Rich text note with formatting' },
    { type: 'checklist' as NoteType, label: 'List', icon: CheckSquare, description: 'Checkable list items' },
    { type: 'drawing' as NoteType, label: 'Drawing', icon: Brush, description: 'Freehand drawing canvas' },
    { type: 'image' as NoteType, label: 'Image', icon: Image, description: 'Images with OCR text extraction' },
    { type: 'audio' as NoteType, label: 'Audio', icon: Mic, description: 'Voice recording with transcription' },
    { type: 'mixed' as NoteType, label: 'Mixed', icon: FileText, description: 'Combine all content types' },
  ];

  const colors: NoteColor[] = [
    'default', 'red', 'orange', 'yellow', 'green', 'teal',
    'blue', 'purple', 'pink', 'brown', 'gray', 'dark'
  ];

  const formatButtons = [
    { icon: Bold, action: 'bold', label: 'Bold' },
    { icon: Italic, action: 'italic', label: 'Italic' },
    { icon: Underline, action: 'underline', label: 'Underline' },
  ];

  const alignButtons = [
    { icon: AlignLeft, action: 'left', label: 'Align Left' },
    { icon: AlignCenter, action: 'center', label: 'Align Center' },
    { icon: AlignRight, action: 'right', label: 'Align Right' },
  ];

  const addChecklistItem = useCallback(() => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
      order: checklist.length,
      createdAt: new Date().toISOString(),
    };
    setChecklist([...checklist, newItem]);
  }, [checklist]);

  const updateChecklistItem = useCallback((id: string, text: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  }, [checklist]);

  const removeChecklistItem = useCallback((id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  }, [checklist]);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { 
        ...item, 
        completed: !item.completed,
        completedAt: !item.completed ? new Date().toISOString() : undefined
      } : item
    ));
  }, [checklist]);

  const handleDrawingSave = useCallback((data: DrawingData) => {
    setDrawingData(data);
    toast.success('Drawing saved to note');
  }, []);

  const handleAudioSave = useCallback((url: string, transcription?: string) => {
    setAudioUrl(url);
    if (transcription) {
      setAudioTranscription(transcription);
      if (!content) {
        setContent(transcription);
      }
    }
    toast.success('Audio saved to note');
  }, [content]);

  const handleImagesSave = useCallback((newImages: NoteImage[]) => {
    setImages(newImages);
    
    // Automatically extract OCR text and add to content
    const ocrText = newImages
      .filter(img => img.ocrText)
      .map(img => img.ocrText)
      .join('\n');
    
    if (ocrText && !content) {
      setContent(ocrText);
    }
    
    toast.success(`${newImages.length} images saved to note`);
  }, [content]);

  const handleTextExtracted = useCallback((text: string) => {
    if (!content) {
      setContent(text);
    } else {
      setContent(content + '\n\n' + text);
    }
  }, [content]);

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setNoteType('text');
    setColor('default');
    setPinned(false);
    setChecklist([]);
    setDrawingData(null);
    setAudioUrl('');
    setAudioTranscription('');
    setImages([]);
    setLabels([]);
    setReminder(null);
    setIsCollaborative(false);
    setActiveTab('content');
  }, []);

  const handleSave = async () => {
    const hasContent = title.trim() || 
                      content.trim() || 
                      checklist.length > 0 || 
                      drawingData || 
                      audioUrl || 
                      images.length > 0;

    if (!hasContent) {
      toast.error('Please add some content to your note');
      return;
    }

    const noteData = {
      title: title.trim() || 'Untitled Note',
      content,
      type: noteType,
      color,
      labels,
      pinned,
      archived: false,
      deleted: false,
      reminder,
      checklist: checklist.length > 0 ? checklist : undefined,
      images: images.length > 0 ? images : undefined,
      audioUrl: audioUrl || undefined,
      audioTranscription: audioTranscription || undefined,
      drawingData: drawingData || undefined,
      permissions: isCollaborative ? 'edit' as const : 'private' as const,
      metadata: {
        wordCount: content.split(' ').filter(word => word.trim()).length,
        characterCount: content.length,
        readingTime: Math.ceil(content.split(' ').length / 200), // 200 WPM average
        lastViewedAt: new Date().toISOString(),
        viewCount: 0,
        exportCount: 0,
        shareCount: 0,
        duplicateCount: 0,
        tags: [],
        source: 'web' as const,
      },
      syncStatus: 'pending' as const,
      version: 1,
      userId: 'current-user',
    };

    try {
      await createNoteMutation.mutateAsync(noteData);
      toast.success('Note created successfully!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    }
  };

  const renderNoteTypeContent = () => {
    switch (noteType) {
      case 'checklist':
        return (
          <div className="space-y-3">
            {checklist.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 group"
              >
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                    item.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                >
                  {item.completed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <Input
                  placeholder="List item"
                  value={item.text}
                  onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                  className={cn(
                    "flex-1 border-0 bg-transparent px-0 focus-visible:ring-0",
                    item.completed && "line-through text-muted-foreground"
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeChecklistItem(item.id)}
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
            <Button
              variant="ghost"
              onClick={addChecklistItem}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              + Add item
            </Button>
          </div>
        );

      case 'drawing':
        return (
          <div className="h-96">
            <DrawingCanvas
              onSave={handleDrawingSave}
              initialData={drawingData || undefined}
              width={600}
              height={400}
            />
          </div>
        );

      case 'image':
        return (
          <OCRImageProcessor
            onSave={handleImagesSave}
            onTextExtracted={handleTextExtracted}
            initialImages={images}
            enableOCR={true}
          />
        );

      case 'audio':
        return (
          <AudioRecorder
            onSave={handleAudioSave}
            onTranscription={handleTextExtracted}
            enableTranscription={true}
            initialAudioUrl={audioUrl}
          />
        );

      case 'mixed':
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="content" className="text-xs">Text</TabsTrigger>
              <TabsTrigger value="checklist" className="text-xs">Lists</TabsTrigger>
              <TabsTrigger value="drawing" className="text-xs">Draw</TabsTrigger>
              <TabsTrigger value="images" className="text-xs">Images</TabsTrigger>
              <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <Textarea
                placeholder="Start writing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] border-0 bg-transparent px-0 focus-visible:ring-0 resize-none"
              />
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-4">
              <div className="space-y-3">
                {checklist.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 group"
                  >
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0",
                        item.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30 hover:border-primary/50"
                      )}
                    >
                      {item.completed && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                    <Input
                      placeholder="List item"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                      className={cn(
                        "flex-1 border-0 bg-transparent px-0 focus-visible:ring-0",
                        item.completed && "line-through text-muted-foreground"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChecklistItem(item.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button
                  variant="ghost"
                  onClick={addChecklistItem}
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  + Add item
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="drawing" className="mt-4">
              <div className="h-80">
                <DrawingCanvas
                  onSave={handleDrawingSave}
                  initialData={drawingData || undefined}
                  width={600}
                  height={320}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="images" className="mt-4">
              <OCRImageProcessor
                onSave={handleImagesSave}
                onTextExtracted={handleTextExtracted}
                initialImages={images}
                enableOCR={true}
              />
            </TabsContent>
            
            <TabsContent value="audio" className="mt-4">
              <AudioRecorder
                onSave={handleAudioSave}
                onTranscription={handleTextExtracted}
                enableTranscription={true}
                initialAudioUrl={audioUrl}
              />
            </TabsContent>
          </Tabs>
        );

      default:
        return (
          <div className="space-y-4">
            {/* Rich text formatting toolbar */}
            <div className="flex items-center gap-1 p-2 border border-border rounded-lg bg-muted/30">
              {formatButtons.map((button) => (
                <Button
                  key={button.action}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={button.label}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              {alignButtons.map((button) => (
                <Button
                  key={button.action}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title={button.label}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
              
              <Separator orientation="vertical" className="h-6 mx-1" />
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] border-0 bg-transparent px-0 focus-visible:ring-0 resize-none"
            />
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Create New Note</DialogTitle>
            <div className="flex items-center gap-2">
              {/* Note Type Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {noteTypes.find(t => t.type === noteType)?.icon && 
                      React.createElement(noteTypes.find(t => t.type === noteType)!.icon, { className: "h-4 w-4" })
                    }
                    {noteTypes.find(t => t.type === noteType)?.label}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-2">
                    <h4 className="font-semibold mb-2">Note Type</h4>
                    <div className="grid gap-1">
                      {noteTypes.map((type) => (
                        <Button
                          key={type.type}
                          variant={noteType === type.type ? 'default' : 'ghost'}
                          onClick={() => setNoteType(type.type)}
                          className="justify-start gap-3 h-auto p-3"
                        >
                          <type.icon className="h-5 w-5 shrink-0" />
                          <div className="text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-0 bg-transparent px-0 focus-visible:ring-0"
          />

          {/* Content */}
          <div className="min-h-[300px]">
            {renderNoteTypeContent()}
          </div>

          {/* Color Picker */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 bg-muted/30"
              >
                <h4 className="font-medium mb-3">Choose Color</h4>
                <div className="grid grid-cols-6 gap-3">
                  {colors.map((colorOption) => {
                    const colorConfig = NOTE_COLORS[colorOption];
                    return (
                      <button
                        key={colorOption}
                        onClick={() => setColor(colorOption)}
                        className={cn(
                          "w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center",
                          colorConfig.bg,
                          color === colorOption
                            ? "border-primary scale-110 shadow-lg"
                            : "border-transparent hover:border-muted-foreground/30 hover:scale-105"
                        )}
                        title={colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                      >
                        {color === colorOption && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="pinned"
                  checked={pinned}
                  onCheckedChange={setPinned}
                />
                <Label htmlFor="pinned" className="text-sm">Pin to top</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="collaborative"
                  checked={isCollaborative}
                  onCheckedChange={setIsCollaborative}
                />
                <Label htmlFor="collaborative" className="text-sm">Enable sharing</Label>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {content.split(' ').filter(word => word.trim()).length} words
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPinned(!pinned)}
                className={cn(pinned && "text-primary bg-primary/10")}
                title="Pin note"
              >
                <Pin className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
              >
                <Palette className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowReminderPicker(!showReminderPicker)}
                title="Add reminder"
              >
                <Clock className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" title="Add labels">
                <Tag className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" title="Share note">
                <Share2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" title="More options">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createNoteMutation.isPending}
                className="min-w-24"
              >
                <Save className="h-4 w-4 mr-2" />
                {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}