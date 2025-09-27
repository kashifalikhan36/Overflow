'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Settings, Grid2x2 as Grid, List, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/note';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({
  onMenuClick,
  onSearchClick,
  onSettingsClick,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2">
              <div className="text-white font-bold text-lg leading-none">O</div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Overflow
            </h1>
          </motion.div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSearchClick}
            className="w-full bg-muted/50 hover:bg-muted/80 rounded-full px-6 py-3 text-left text-muted-foreground transition-all duration-200 border border-transparent hover:border-border/50"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5" />
              <span>Search notes... (Ctrl+K)</span>
            </div>
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                viewMode === 'grid' && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                viewMode === 'list' && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            <Palette className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}