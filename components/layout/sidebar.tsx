'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Chrome as Home, Bell, Tag, Archive, Trash2, Plus, X, Hash, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/types/note';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Label[];
  selectedLabel: string | null;
  onLabelSelect: (label: string | null) => void;
  onLabelsClick: () => void;
}

const navigationItems = [
  { id: 'all', label: 'All Notes', icon: Home },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'pinned', label: 'Pinned', icon: Star },
  { id: 'archived', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

export function Sidebar({
  open,
  onOpenChange,
  labels,
  selectedLabel,
  onLabelSelect,
  onLabelsClick,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : -280,
          width: open ? 280 : 64,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-16 bottom-0 bg-background border-r border-border z-50",
          "lg:relative lg:top-0 lg:z-auto",
          !open && "lg:w-16"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between mb-6"
                >
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    className="h-8 w-8 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      !open && "lg:w-10 lg:px-0 lg:justify-center"
                    )}
                    onClick={() => onLabelSelect(null)}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-4 border-t border-border">
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Labels</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onLabelsClick}
                      className="h-6 w-6"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    {labels.map((label) => (
                      <motion.div
                        key={label.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedLabel === label.name ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-3 h-9"
                          onClick={() => onLabelSelect(label.name)}
                        >
                          <Hash
                            className="h-4 w-4 shrink-0"
                            style={{ color: label.color }}
                          />
                          <span className="truncate">{label.name}</span>
                        </Button>
                      </motion.div>
                    ))}

                    {labels.length === 0 && (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No labels yet.{' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs"
                          onClick={onLabelsClick}
                        >
                          Create one
                        </Button>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!open && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLabelsClick}
                className="w-10 h-10 mx-auto"
              >
                <Tag className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}