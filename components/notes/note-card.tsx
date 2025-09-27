'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pin, 
  Archive, 
  MoveHorizontal as MoreHorizontal, 
  Copy, 
  Share2, 
  Trash2, 
  Clock, 
  Tag, 
  SquareCheck as CheckSquare, 
  Image, 
  Mic, 
  Palette,
  Brush,
  FileText,
  Play,
  Pause,
  Volume2,
  Users,
  Eye,
  Download,
  Edit3,
  Star,
  Bell,
  MapPin,
  Globe,
  Lock,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Note, ViewMode, NOTE_COLORS } from '@/types/note';
import { useUpdateNote, useDeleteNote } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

interface NoteCardProps {
  note: Note;
  viewMode: ViewMode;
  onEdit?: (note: Note) => void;
  searchQuery?: string;
}

export function NoteCard({ note, viewMode, onEdit, searchQuery }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
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

  const handleCopy = async () => {
    let textToCopy = note.title ? `${note.title}\n\n` : '';
    textToCopy += note.content;
    
    if (note.checklist) {
      textToCopy += '\n\n' + note.checklist.map(item => 
        `${item.completed ? '✓' : '☐'} ${item.text}`
      ).join('\n');
    }

    if (note.audioTranscription) {
      textToCopy += '\n\nAudio Transcription:\n' + note.audioTranscription;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Note copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy note');
    }
  };

  const playAudio = () => {
    if (note.audioUrl) {
      const audio = new Audio(note.audioUrl);
      if (audioPlaying) {
        audio.pause();
        setAudioPlaying(false);
      } else {
        audio.play();
        setAudioPlaying(true);
        audio.onended = () => setAudioPlaying(false);
      }
    }
  };

  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/50">{part}</mark> : 
        part
    );
  };

  const renderContent = () => {
    const maxLines = viewMode === 'list' ? 3 : 6;
    
    switch (note.type) {
      case 'checklist':
        const completedCount = note.checklist?.filter(item => item.completed).length || 0;
        const totalCount = note.checklist?.length || 0;
        
        return (
          <div className="space-y-3">
            {/* Progress indicator for checklist */}
            {totalCount > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completedCount} of {totalCount} completed</span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <Progress value={(completedCount / totalCount) * 100} className="h-1" />
              </div>
            )}
            
            <div className="space-y-2">
              {note.checklist?.slice(0, showFullContent ? undefined : 5).map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
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
                    "flex-1",
                    item.completed && "line-through text-muted-foreground"
                  )}>
                    {highlightText(item.text, searchQuery)}
                  </span>
                </div>
              ))}
              
              {note.checklist && note.checklist.length > 5 && !showFullContent && (
                <button
                  onClick={() => setShowFullContent(true)}
                  className="text-xs text-primary hover:underline"
                >
                  +{note.checklist.length - 5} more items
                </button>
              )}
            </div>
            
            {note.content && (
              <p className="text-sm text-foreground/80 line-clamp-2">
                {highlightText(note.content, searchQuery)}
              </p>
            )}
          </div>
        );

      case 'drawing':
        return (
          <div className="space-y-2">
            {note.drawingData?.canvas && (
              <div className="relative">
                <img
                  src={note.drawingData.canvas}
                  alt="Drawing"
                  className="w-full h-32 object-cover rounded border"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded flex items-center justify-center opacity-0 hover:opacity-100">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            {note.content && (
              <p className="text-sm text-foreground/80 line-clamp-2">
                {highlightText(note.content, searchQuery)}
              </p>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {note.images && note.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {note.images.slice(0, 4).map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.filename}
                      className="w-full h-20 object-cover rounded border"
                    />
                    {image.ocrText && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                        <FileText className="h-2 w-2" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ))}
                {note.images.length > 4 && (
                  <div className="flex items-center justify-center bg-muted rounded border text-xs text-muted-foreground">
                    +{note.images.length - 4} more
                  </div>
                )}
              </div>
            )}
            
            {(note.content || note.images?.some(img => img.ocrText)) && (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {highlightText(note.content, searchQuery)}
                {!note.content && note.images?.some(img => img.ocrText) && (
                  <span className="text-muted-foreground italic">
                    Text extracted from images
                  </span>
                )}
              </p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={playAudio}
              >
                {audioPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Audio Recording</span>
                </div>
                {note.audioTranscription && (
                  <p className="text-xs text-muted-foreground">Transcription available</p>
                )}
              </div>
            </div>
            
            {note.audioTranscription && (
              <p className="text-sm text-foreground/80 line-clamp-3">
                {highlightText(note.audioTranscription, searchQuery)}
              </p>
            )}
            
            {note.content && note.content !== note.audioTranscription && (
              <p className="text-sm text-foreground/80 line-clamp-2">
                {highlightText(note.content, searchQuery)}
              </p>
            )}
          </div>
        );

      case 'mixed':
        return (
          <div className="space-y-3">
            {/* Show mixed content indicators */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {note.content && <FileText className="h-3 w-3" />}
              {note.checklist && note.checklist.length > 0 && <CheckSquare className="h-3 w-3" />}
              {note.images && note.images.length > 0 && <Image className="h-3 w-3" />}
              {note.audioUrl && <Mic className="h-3 w-3" />}
              {note.drawingData && <Brush className="h-3 w-3" />}
              <span>Mixed content</span>
            </div>
            
            {note.content && (
              <p className="text-sm text-foreground/80 line-clamp-4">
                {highlightText(note.content, searchQuery)}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {note.content && (
              <p className={cn(
                "text-sm text-foreground/80 whitespace-pre-wrap",
                showFullContent ? "" : `line-clamp-${maxLines}`
              )}>
                {highlightText(note.content, searchQuery)}
              </p>
            )}
            
            {note.content && note.content.length > 200 && !showFullContent && (
              <button
                onClick={() => setShowFullContent(true)}
                className="text-xs text-primary hover:underline"
              >
                Show more
              </button>
            )}
          </div>
        );
    }
  };

  const getTypeIcon = () => {
    switch (note.type) {
      case 'checklist':
        return <CheckSquare className="h-3 w-3" />;
      case 'drawing':
        return <Brush className="h-3 w-3" />;
      case 'image':
        return <Image className="h-3 w-3" />;
      case 'audio':
        return <Mic className="h-3 w-3" />;
      case 'mixed':
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getSyncStatusIcon = () => {
    switch (note.syncStatus) {
      case 'pending':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      case 'error':
        return <WifiOff className="h-3 w-3 text-red-500" />;
      case 'offline':
        return <WifiOff className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Wifi className="h-3 w-3 text-green-500" />;
    }
  };

  const getPermissionIcon = () => {
    switch (note.permissions) {
      case 'private':
        return <Lock className="h-3 w-3" />;
      case 'view':
      case 'edit':
      case 'full':
        return <Globe className="h-3 w-3" />;
      default:
        return <Lock className="h-3 w-3" />;
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => onEdit?.(note)}
        className={cn(
          "relative rounded-xl border transition-all duration-300 cursor-pointer group overflow-hidden",
          colorConfig.bg,
          colorConfig.border,
          colorConfig.hover,
          "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
          viewMode === 'list' && "p-5",
          viewMode === 'grid' && "p-4",
          viewMode === 'masonry' && "p-4",
          note.syncStatus === 'error' && "border-red-200 dark:border-red-800",
          note.syncStatus === 'pending' && "border-yellow-200 dark:border-yellow-800"
        )}
      >
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
          {note.pinned && (
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
                  <Pin className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Pinned</TooltipContent>
            </Tooltip>
          )}
          
          {note.reminder && (
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-blue-500 text-white rounded-full p-1.5 shadow-sm">
                  {note.reminder.type === 'location' ? (
                    <MapPin className="h-3 w-3" />
                  ) : (
                    <Bell className="h-3 w-3" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {note.reminder.type === 'location' 
                  ? `Location reminder: ${note.reminder.location?.address}`
                  : `Time reminder: ${note.reminder.time ? format(new Date(note.reminder.time), 'PPp') : ''}`
                }
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Collaboration indicators */}
        {note.collaborators && note.collaborators.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex -space-x-1">
              {note.collaborators.slice(0, 3).map((collaborator, index) => (
                <Tooltip key={collaborator.userId}>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback className="text-xs">
                        {collaborator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    {collaborator.name} ({collaborator.permission})
                  </TooltipContent>
                </Tooltip>
              ))}
              {note.collaborators.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{note.collaborators.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePin();
                }}
                disabled={updateNoteMutation.isPending}
              >
                <Pin className={cn("h-3 w-3", note.pinned && "fill-current")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{note.pinned ? 'Unpin' : 'Pin'}</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Download className="h-4 w-4 mr-2" />
                Export note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Clock className="h-4 w-4 mr-2" />
                {note.reminder ? 'Edit reminder' : 'Add reminder'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Tag className="h-4 w-4 mr-2" />
                Edit labels
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Palette className="h-4 w-4 mr-2" />
                Change color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Share2 className="h-4 w-4 mr-2" />
                Share & collaborate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                <Star className="h-4 w-4 mr-2" />
                Add to favorites
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(); }}>
                <Archive className="h-4 w-4 mr-2" />
                {note.archived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="mb-3 mt-8">
          {note.title && (
            <h3 className="font-semibold text-base line-clamp-2 mb-2 pr-16">
              {highlightText(note.title, searchQuery)}
            </h3>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          {renderContent()}
        </div>

        {/* Labels */}
        {note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.labels.slice(0, 4).map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="text-xs px-2 py-1 h-auto rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {label}
              </Badge>
            ))}
            {note.labels.length > 4 && (
              <Badge variant="outline" className="text-xs px-2 py-1 h-auto rounded-full">
                +{note.labels.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                {getTypeIcon()}
                <span>{note.type.charAt(0).toUpperCase() + note.type.slice(1)}</span>
              </TooltipTrigger>
              <TooltipContent>Note type: {note.type}</TooltipContent>
            </Tooltip>
            
            <span>•</span>
            
            <Tooltip>
              <TooltipTrigger>
                <span>
                  {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Last updated: {format(new Date(note.updatedAt), 'PPpp')}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            {/* Word count for text notes */}
            {note.metadata && note.metadata.wordCount > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <span>{note.metadata.wordCount} words</span>
                </TooltipTrigger>
                <TooltipContent>
                  {note.metadata.wordCount} words, {note.metadata.characterCount} characters
                  <br />
                  ~{note.metadata.readingTime} min read
                </TooltipContent>
              </Tooltip>
            )}

            {/* Permission indicator */}
            <Tooltip>
              <TooltipTrigger>
                {getPermissionIcon()}
              </TooltipTrigger>
              <TooltipContent>
                {note.permissions === 'private' ? 'Private note' : 'Shared note'}
              </TooltipContent>
            </Tooltip>

            {/* Sync status */}
            <Tooltip>
              <TooltipTrigger>
                {getSyncStatusIcon()}
              </TooltipTrigger>
              <TooltipContent>
                {note.syncStatus === 'synced' && 'Synced'}
                {note.syncStatus === 'pending' && 'Sync pending'}
                {note.syncStatus === 'error' && 'Sync error'}
                {note.syncStatus === 'offline' && 'Offline'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Subtle gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />
      </motion.div>
    </TooltipProvider>
  );
}