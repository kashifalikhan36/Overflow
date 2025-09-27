'use client';

import { motion } from 'framer-motion';
import { NoteCard } from './note-card';
import { Note, ViewMode } from '@/types/note';
import { cn } from '@/lib/utils';

interface NoteGridProps {
  notes: Note[];
  viewMode: ViewMode;
  searchQuery: string;
}

export function NoteGrid({ notes, viewMode, searchQuery }: NoteGridProps) {
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {searchQuery ? 'No matching notes found' : 'No notes yet'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {searchQuery 
            ? 'Try adjusting your search terms or create a new note.'
            : 'Start creating your first note using the + button below or press Ctrl+N'
          }
        </p>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-full",
        viewMode === 'grid'
          ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4"
          : "space-y-4 max-w-4xl mx-auto"
      )}
    >
      {notes.map((note) => (
        <motion.div
          key={note.id}
          variants={itemVariants}
          layout
          className={cn(
            viewMode === 'grid' && "break-inside-avoid mb-4"
          )}
        >
          <NoteCard note={note} viewMode={viewMode} />
        </motion.div>
      ))}
    </motion.div>
  );
}