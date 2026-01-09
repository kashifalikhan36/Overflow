'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Settings, Grid2x2 as Grid, List, Palette, Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/note';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/user-context';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({
  onMenuClick,
  onSearchClick,
  onSettingsClick,
  onExportClick,
  viewMode,
  onViewModeChange,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, signIn, signOut } = useUser();

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
            <div className="rounded-md p-2 flex items-center justify-center bg-gradient-to-br from-primary/90 to-accent/70">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" fill="white" fillOpacity="0.06" />
                <path d="M7 12c1.2-4 6-4 7 0 0 0 1 4-3 6-4-2-4-6-4-6z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Overflow</h1>
          </motion.div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSearchClick}
            className="hidden sm:flex w-full bg-muted/50 hover:bg-muted/80 rounded-full px-6 py-3 text-left text-muted-foreground transition-all duration-200 border border-transparent hover:border-border/50"
            aria-label="Open search"
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5" />
              <span>Search notes... (Ctrl+K)</span>
            </div>
          </motion.button>

          {/* Small-screen search icon */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="sm:hidden h-9 w-9"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </Button>
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
            onClick={onExportClick}
            className="h-9 w-9"
            title="Export Notes"
          >
            <Download className="h-4 w-4" />
          </Button>

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

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label={user?.name ? `Open menu for ${user.name}` : 'Open user menu'}
              >
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-3 py-2">
                <div className="text-sm font-medium">{user?.name ?? 'Guest'}</div>
                {user?.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
              </div>
              <DropdownMenuItem onClick={() => signIn()}>Sign in / Switch</DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}