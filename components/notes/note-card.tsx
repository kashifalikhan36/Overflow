'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, Archive, MoveHorizontal as MoreHorizontal, Copy, Share2, Trash2, Clock, Tag, SquareCheck as CheckSquare, Image, Mic, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Note, ViewMode, NOTE_COLORS } from '@/types/note';
import { useUpdateNote, useDeleteNote } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
}

export function NoteCard({ note, viewMode }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colorConfig = NOTE_COLORS[note.color];
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const handlePin = async () => {
    try {
      await updateNoteMutation.mutateAsync({
        id: note.id,
        pinned: !note.pinned,
      });
      toast.success(note.pinned ? 'Note unpinned' : 'Note pinned');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleArchive = async () => {
    try {
      await updateNoteMutation.mutateAsync({
        id: note.id,
        archived: !note.archived,
      });
      toast.success(note.archived ? 'Note unarchived' : 'Note archived');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteMutation.mutateAsync(note.id);
        toast.success('Note deleted');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const renderContent = () => {
    switch (note.type) {
      case 'checklist':
        return (
          <div className="space-y-2">
            {note.checklist?.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    item.completed ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}
                >
                  {item.completed && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className={cn(
                  item.completed && "line-through text-muted-foreground"
                )}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklist && note.checklist.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{note.checklist.length - 5} more items
              </p>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {note.images && note.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {note.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Note image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
            {note.content && (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {note.content}
              </p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Mic className="h-4 w-4 text-primary" />
              <span className="text-sm">Audio recording</span>
            </div>
            {note.content && (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {note.content}
              </p>
            )}
          </div>
        );
      default:
        return (
          <p className="text-sm text-foreground/80 line-clamp-6 whitespace-pre-wrap">
            {note.content}
          </p>
        );
    }
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'checklist':
        return <CheckSquare className="h-3 w-3" />;
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'audio':
        return <Mic className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative rounded-lg border transition-all duration-200 cursor-pointer group",
        colorConfig.bg,
        colorConfig.border,
        colorConfig.hover,
        "hover:shadow-md",
        viewMode === 'list' && "p-4",
        viewMode === 'grid' && "p-3"
      )}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <Pin className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h3 className="font-medium text-sm line-clamp-2 mb-1">
              {note.title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handlePin}
            disabled={updateNoteMutation.isPending}
          >
            <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Clock className="h-4 w-4 mr-2" />
                Add reminder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="h-4 w-4 mr-2" />
                Add label
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Change color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Collaborate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                {note.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <span>
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </span>
        </div>

        {note.reminder && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Reminder set</span>
          </div>
        )}
      </div>

      {/* Labels */}
      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.labels.slice(0, 3).map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="text-xs px-2 py-0 h-5"
            >
              {label}
            </Badge>
          ))}
          {note.labels.length > 3 && (
            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
              +{note.labels.length - 3}
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}