'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Hash, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';
import { AdvancedSearch } from './advanced-search';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, filters?: any) => void;
  notes: Note[];
}

export function SearchOverlay({ open, onOpenChange, onSearch, notes }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [recentSearches] = useState(['project ideas', 'meeting notes', 'todo list']);
  
  const filteredNotes = query.trim()
    ? notes.filter(note =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.labels.some(label => label.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  useEffect(() => {
    if (open) {
      setQuery('');
      setShowAdvancedSearch(false);
    }
  }, [open]);

  const handleSearch = (searchQuery: string, filters?: any) => {
    onSearch(searchQuery, filters);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto px-4"
        >
          <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                autoFocus
                placeholder="Search notes, labels, or content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query);
                  }
                }}
                className="flex-1 border-0 bg-transparent px-0 focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSearch(true)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {query.trim() ? (
                // Search Results
                <div className="p-2">
                  {filteredNotes.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Search Results
                      </div>
                      {filteredNotes.map((note) => (
                        <motion.button
                          key={note.id}
                          whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                          onClick={() => handleSearch(query)}
                          className="w-full text-left p-3 rounded-lg transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">
                                {note.title || 'Untitled'}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {note.content}
                              </p>
                              {note.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {note.labels.slice(0, 3).map((label) => (
                                    <Badge
                                      key={label}
                                      variant="secondary"
                                      className="text-xs px-2 py-0 h-4"
                                    >
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={cn(
                              "w-3 h-3 rounded-full shrink-0",
                              note.color === 'default' ? 'bg-muted' : `bg-${note.color}-200`
                            )} />
                          </div>
                        </motion.button>
                      ))}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        No notes found for "{query}"
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(query)}
                      >
                        Search anyway
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Recent Searches & Quick Actions
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recent Searches
                  </div>
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                      onClick={() => handleSearch(search)}
                      className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </motion.button>
                  ))}

                  <div className="border-t border-border mt-2 pt-2">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quick Actions
                    </div>
                    <motion.button
                      whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                      className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Search by labels</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Press Enter to search</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Advanced Search Modal */}
      <AdvancedSearch
        open={showAdvancedSearch}
        onOpenChange={setShowAdvancedSearch}
        notes={notes}
        onSearch={handleSearch}
        initialQuery={query}
      />
    </AnimatePresence>
  );
}