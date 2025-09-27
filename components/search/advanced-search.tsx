'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Note, 
  SearchFilters, 
  NoteType, 
  NoteColor, 
  NOTE_COLORS 
} from '@/types/note';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Tag,
  Palette,
  FileText,
  CheckSquare,
  Image,
  Mic,
  Brush,
  Clock,
  Users,
  MapPin,
  Star,
  Archive,
  Pin,
  SortAsc,
  SortDesc,
  Zap,
  Eye,
  Download
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';

interface AdvancedSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  onSearch: (query: string) => void;
  onFilter: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const noteTypeOptions = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
  { value: 'drawing', label: 'Drawing', icon: Brush },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'audio', label: 'Audio', icon: Mic },
  { value: 'mixed', label: 'Mixed', icon: FileText },
];

const colorOptions: { value: NoteColor; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
  { value: 'teal', label: 'Teal' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'brown', label: 'Brown' },
  { value: 'gray', label: 'Gray' },
  { value: 'dark', label: 'Dark' },
];

const sortOptions = [
  { value: 'updatedAt', label: 'Last Modified' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'relevance', label: 'Relevance' },
];

const dateRangePresets = [
  { label: 'Today', getValue: () => ({ start: format(new Date(), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 7 days', getValue: () => ({ start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 30 days', getValue: () => ({ start: format(subDays(new Date(), 30), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last 3 months', getValue: () => ({ start: format(subMonths(new Date(), 3), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Last year', getValue: () => ({ start: format(subYears(new Date(), 1), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
];

export function AdvancedSearch({ 
  open, 
  onOpenChange, 
  notes, 
  onSearch, 
  onFilter,
  initialFilters 
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    labels: [],
    colors: [],
    types: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    ...initialFilters
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Extract all unique labels from notes
  const availableLabels = useMemo(() => {
    const labelSet = new Set<string>();
    notes.forEach(note => {
      note.labels.forEach(label => labelSet.add(label));
    });
    return Array.from(labelSet).sort();
  }, [notes]);

  // Generate search suggestions based on content
  const generateSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = new Set<string>();
    const lowercaseQuery = query.toLowerCase();

    // Add matches from note titles and content
    notes.forEach(note => {
      // Title matches
      if (note.title.toLowerCase().includes(lowercaseQuery)) {
        const words = note.title.split(' ').filter(word => 
          word.toLowerCase().includes(lowercaseQuery) && word.length > 2
        );
        words.forEach(word => suggestions.add(word));
      }

      // Content matches
      const contentWords = note.content.split(' ').filter(word => 
        word.toLowerCase().includes(lowercaseQuery) && word.length > 2
      );
      contentWords.slice(0, 5).forEach(word => suggestions.add(word));

      // OCR text matches
      note.images?.forEach(image => {
        if (image.ocrText) {
          const ocrWords = image.ocrText.split(' ').filter(word => 
            word.toLowerCase().includes(lowercaseQuery) && word.length > 2
          );
          ocrWords.slice(0, 3).forEach(word => suggestions.add(word));
        }
      });

      // Audio transcription matches
      if (note.audioTranscription) {
        const transcriptionWords = note.audioTranscription.split(' ').filter(word => 
          word.toLowerCase().includes(lowercaseQuery) && word.length > 2
        );
        transcriptionWords.slice(0, 3).forEach(word => suggestions.add(word));
      }
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 8));
  }, [notes]);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, generateSuggestions]);

  const handleSearch = useCallback((query: string = searchQuery) => {
    if (query.trim()) {
      // Add to recent searches
      const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('overflow-recent-searches', JSON.stringify(updatedRecent));
    }

    const searchFilters: SearchFilters = {
      ...filters,
      query: query.trim(),
    };

    onSearch(query);
    onFilter(searchFilters);
  }, [searchQuery, filters, onSearch, onFilter, recentSearches]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilter(updatedFilters);
  }, [filters, onFilter]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      labels: [],
      colors: [],
      types: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onSearch('');
    onFilter(clearedFilters);
  }, [onSearch, onFilter]);

  // Load recent searches on mount
  useEffect(() => {
    const stored = localStorage.getItem('overflow-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const filteredNotesCount = useMemo(() => {
    return notes.filter(note => {
      // Query filter
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableContent = [
          note.title,
          note.content,
          note.audioTranscription,
          ...(note.images?.map(img => img.ocrText).filter(Boolean) || []),
          ...note.labels
        ].join(' ').toLowerCase();
        
        if (!searchableContent.includes(query)) return false;
      }

      // Type filter
      if (filters.types && filters.types.length > 0 && !filters.types.includes(note.type)) {
        return false;
      }

      // Color filter
      if (filters.colors && filters.colors.length > 0 && !filters.colors.includes(note.color)) {
        return false;
      }

      // Label filter
      if (filters.labels && filters.labels.length > 0) {
        const hasMatchingLabel = filters.labels.some(label => note.labels.includes(label));
        if (!hasMatchingLabel) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const noteDate = new Date(note.updatedAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (noteDate < startDate || noteDate > endDate) return false;
      }

      // Special filters
      if (filters.hasReminder && !note.reminder) return false;
      if (filters.hasImages && (!note.images || note.images.length === 0)) return false;
      if (filters.hasAudio && !note.audioUrl) return false;
      if (filters.isShared && (!note.collaborators || note.collaborators.length === 0)) return false;

      return true;
    }).length;
  }, [notes, filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes, transcriptions, extracted text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10 pr-10 text-base"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => {
                  setSearchQuery('');
                  handleSearch('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {(searchSuggestions.length > 0 || recentSearches.length > 0) && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {searchSuggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Suggestions</div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded text-sm"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                        >
                          <Search className="h-3 w-3 inline mr-2 text-muted-foreground" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {recentSearches.length > 0 && searchSuggestions.length === 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Recent</div>
                      {recentSearches.slice(0, 5).map((recent, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded text-sm"
                          onClick={() => {
                            setSearchQuery(recent);
                            handleSearch(recent);
                          }}
                        >
                          <Clock className="h-3 w-3 inline mr-2 text-muted-foreground" />
                          {recent}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(showAdvancedFilters && "bg-accent")}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Type filters */}
            {noteTypeOptions.map(type => (
              <Button
                key={type.value}
                variant={filters.types?.includes(type.value as NoteType) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentTypes = filters.types || [];
                  const updatedTypes = currentTypes.includes(type.value as NoteType)
                    ? currentTypes.filter(t => t !== type.value)
                    : [...currentTypes, type.value as NoteType];
                  handleFilterChange('types', updatedTypes);
                }}
                className="shrink-0"
              >
                <type.icon className="h-4 w-4 mr-1" />
                {type.label}
              </Button>
            ))}

            <Separator orientation="vertical" className="h-6" />

            {/* Special filters */}
            <Button
              variant={filters.hasReminder ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('hasReminder', !filters.hasReminder)}
              className="shrink-0"
            >
              <Clock className="h-4 w-4 mr-1" />
              Has Reminder
            </Button>

            <Button
              variant={filters.isShared ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('isShared', !filters.isShared)}
              className="shrink-0"
            >
              <Users className="h-4 w-4 mr-1" />
              Shared
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Labels Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Labels</label>
                      <ScrollArea className="h-32 border rounded-lg p-2">
                        <div className="space-y-1">
                          {availableLabels.map(label => (
                            <div key={label} className="flex items-center space-x-2">
                              <Checkbox
                                id={`label-${label}`}
                                checked={filters.labels?.includes(label)}
                                onCheckedChange={(checked) => {
                                  const currentLabels = filters.labels || [];
                                  const updatedLabels = checked
                                    ? [...currentLabels, label]
                                    : currentLabels.filter(l => l !== label);
                                  handleFilterChange('labels', updatedLabels);
                                }}
                              />
                              <label htmlFor={`label-${label}`} className="text-sm cursor-pointer">
                                {label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Colors Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Colors</label>
                      <div className="grid grid-cols-3 gap-2">
                        {colorOptions.map(color => (
                          <button
                            key={color.value}
                            onClick={() => {
                              const currentColors = filters.colors || [];
                              const updatedColors = currentColors.includes(color.value)
                                ? currentColors.filter(c => c !== color.value)
                                : [...currentColors, color.value];
                              handleFilterChange('colors', updatedColors);
                            }}
                            className={cn(
                              "h-8 rounded border-2 transition-all flex items-center justify-center text-xs",
                              NOTE_COLORS[color.value].bg,
                              filters.colors?.includes(color.value)
                                ? "border-primary scale-95"
                                : "border-transparent hover:border-muted-foreground/30"
                            )}
                          >
                            {filters.colors?.includes(color.value) && "✓"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <div className="space-y-2">
                        {dateRangePresets.map(preset => (
                          <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleFilterChange('dateRange', preset.getValue())}
                          >
                            {preset.label}
                          </Button>
                        ))}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              Custom Range
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              numberOfMonths={2}
                              onSelect={(range) => {
                                if (range?.from && range?.to) {
                                  handleFilterChange('dateRange', {
                                    start: format(range.from, 'yyyy-MM-dd'),
                                    end: format(range.to, 'yyyy-MM-dd')
                                  });
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <Separator className="my-4" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Sort by:</label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value) => handleFilterChange('sortBy', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {filters.sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters & Results */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {filters.query && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  "{filters.query}"
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      handleFilterChange('query', '');
                    }}
                    className="ml-1 hover:bg-accent rounded-full p-0.5"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              )}
              
              {filters.types?.map(type => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {noteTypeOptions.find(opt => opt.value === type)?.label}
                  <button
                    onClick={() => {
                      const updatedTypes = filters.types?.filter(t => t !== type) || [];
                      handleFilterChange('types', updatedTypes);
                    }}
                    className="ml-1 hover:bg-accent rounded-full p-0.5"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}

              {filters.labels?.map(label => (
                <Badge key={label} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {label}
                  <button
                    onClick={() => {
                      const updatedLabels = filters.labels?.filter(l => l !== label) || [];
                      handleFilterChange('labels', updatedLabels);
                    }}
                    className="ml-1 hover:bg-accent rounded-full p-0.5"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}

              {(filters.types?.length || filters.labels?.length || filters.colors?.length || filters.hasReminder || filters.hasImages || filters.hasAudio || filters.isShared) ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              ) : null}
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredNotesCount} of {notes.length} notes
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Save Search
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => handleSearch()}>
                <Search className="h-4 w-4 mr-2" />
                Search ({filteredNotesCount})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
