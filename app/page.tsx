'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { NoteGrid } from '@/components/notes/note-grid';
import { CreateNoteModal } from '@/components/notes/create-note-modal';
import { SearchOverlay } from '@/components/search/search-overlay';
import { LabelsModal } from '@/components/labels/labels-modal';
import { SettingsModal } from '@/components/settings/settings-modal';
import { useNotes } from '@/hooks/use-notes';
import { useLabels } from '@/hooks/use-labels';
import { Note, ViewMode } from '@/types/note';
import { cn } from '@/lib/utils';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [labelsModalOpen, setLabelsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notes = [], isLoading } = useNotes();
  const { data: labels = [] } = useLabels();

  // Filter notes based on current view and search
  const filteredNotes = notes.filter((note: Note) => {
    if (searchQuery && !note.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !note.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedLabel && !note.labels.includes(selectedLabel)) {
      return false;
    }
    return !note.archived;
  });

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setSearchOpen(true);
            break;
          case 'n':
            e.preventDefault();
            setCreateModalOpen(true);
            break;
          case ',':
            e.preventDefault();
            setSettingsModalOpen(true);
            break;
        }
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCreateModalOpen(false);
        setLabelsModalOpen(false);
        setSettingsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="flex">
        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          labels={labels}
          selectedLabel={selectedLabel}
          onLabelSelect={setSelectedLabel}
          onLabelsClick={() => setLabelsModalOpen(true)}
        />

        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "p-4 md:p-6 lg:p-8",
          sidebarOpen ? "lg:ml-72" : "lg:ml-16"
        )}>
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-20"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <NoteGrid
                    notes={sortedNotes}
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCreateModalOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.button>

      {/* Modals */}
      <CreateNoteModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSearch={setSearchQuery}
        notes={notes}
      />

      <LabelsModal
        open={labelsModalOpen}
        onOpenChange={setLabelsModalOpen}
        labels={labels}
      />

      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
      />
    </div>
  );
}