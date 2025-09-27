'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, SquareCheck as CheckSquare, Image, Mic, Palette, X, Save, Pin, Clock, Tag, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { NoteType, NoteColor, NOTE_COLORS } from '@/types/note';
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
  const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createNoteMutation = useCreateNote();

  const noteTypes = [
    { type: 'text' as NoteType, label: 'Text', icon: Type },
    { type: 'checklist' as NoteType, label: 'Checklist', icon: CheckSquare },
    { type: 'image' as NoteType, label: 'Image', icon: Image },
    { type: 'audio' as NoteType, label: 'Audio', icon: Mic },
  ];

  const colors: NoteColor[] = [
    'default', 'red', 'orange', 'yellow', 'green', 'teal',
    'blue', 'purple', 'pink', 'brown', 'gray', 'dark'
  ];

  const addChecklistItem = () => {
    const newItem = {
      id: Date.now().toString(),
      text: '',
      completed: false,
    };
    setChecklist([...checklist, newItem]);
  };

  const updateChecklistItem = (id: string, text: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      // Implementation for audio recording would go here
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log('Recording stopped');
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && checklist.length === 0) {
      toast.error('Please add some content to your note');
      return;
    }

    const note = {
      title,
      content,
      type: noteType,
      color,
      labels: [],
      pinned,
      archived: false,
      checklist: noteType === 'checklist' ? checklist : undefined,
      userId: 'current-user',
    };

    try {
      await createNoteMutation.mutateAsync(note);
      toast.success('Note created successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      setNoteType('text');
      setColor('default');
      setPinned(false);
      setChecklist([]);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const renderContent = () => {
    switch (noteType) {
      case 'checklist':
        return (
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
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
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
            <Button
              variant="ghost"
              onClick={addChecklistItem}
              className="w-full justify-start text-muted-foreground"
            >
              + Add item
            </Button>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Drag images here or click to upload</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
            <Textarea
              placeholder="Add a description..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <div className="text-center">
                <Mic className={cn(
                  "h-12 w-12 mx-auto mb-4",
                  isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground/50"
                )} />
                <p className="text-muted-foreground mb-4">
                  {isRecording ? 'Recording audio...' : 'Record audio note'}
                </p>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "outline"}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Transcription will appear here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        );

      default:
        return (
          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] border-0 bg-transparent px-0 focus-visible:ring-0 resize-none"
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create New Note</DialogTitle>
            <div className="flex items-center gap-2">
              {/* Note Type Selector */}
              <div className="flex bg-muted/50 rounded-lg p-1">
                {noteTypes.map((type) => (
                  <Button
                    key={type.type}
                    variant={noteType === type.type ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setNoteType(type.type)}
                    className={cn(
                      "h-8 px-3 transition-all duration-200",
                      noteType === type.type && "bg-primary text-primary-foreground shadow-sm"
                    )}
                  >
                    <type.icon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
          />

          {/* Content */}
          <div className="group">
            {renderContent()}
          </div>

          {/* Color Picker */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-6 gap-2 p-4 bg-muted/30 rounded-lg"
              >
                {colors.map((colorOption) => {
                  const colorConfig = NOTE_COLORS[colorOption];
                  return (
                    <button
                      key={colorOption}
                      onClick={() => setColor(colorOption)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        colorConfig.bg,
                        color === colorOption
                          ? "border-primary scale-110"
                          : "border-transparent hover:border-muted-foreground/30"
                      )}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPinned(!pinned)}
                className={cn(pinned && "text-primary bg-primary/10")}
              >
                <Pin className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <Clock className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <Tag className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={createNoteMutation.isPending || (!title.trim() && !content.trim() && checklist.length === 0)}
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