'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/types/note';
import { useLabels } from '@/hooks/use-labels';
import { 
  Plus, 
  Tag, 
  Edit3, 
  Trash2, 
  Search, 
  MoreHorizontal,
  Hash,
  X,
  Save,
  Palette,
  Filter,
  SortAsc,
  Star,
  Pin,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getLocalUserId } from '@/lib/current-user';

interface LabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Label[];
  selectedLabels?: string[];
  onLabelSelect?: (labelId: string) => void;
  mode?: 'manage' | 'select';
}

const labelColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
  '#14B8A6', // teal
  '#84CC16', // lime
  '#6366F1', // indigo
  '#F43F5E', // rose
];

export function LabelsModal({ 
  open, 
  onOpenChange, 
  labels = [], 
  selectedLabels = [],
  onLabelSelect,
  mode = 'manage'
}: LabelsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[0]);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'notes'>('name');
  
  const { toast } = useToast();

  // Filter and sort labels
  const filteredLabels = labels
    .filter(label => 
      label.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      label.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'notes':
          return b.noteCount - a.noteCount;
        default:
          return 0;
      }
    });

  const handleCreateLabel = useCallback(async () => {
    if (!newLabelName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the label",
        variant: "destructive",
      });
      return;
    }

    if (labels.some(label => label.name.toLowerCase() === newLabelName.toLowerCase())) {
      toast({
        title: "Label exists",
        description: "A label with this name already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock API call - in real app, would call actual API
      const newLabel: Label = {
        id: Date.now().toString(),
        name: newLabelName.trim(),
        color: newLabelColor,
        description: '',
        userId: getLocalUserId(),
        noteCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Reset form
      setNewLabelName('');
      setNewLabelColor(labelColors[0]);
      setIsCreating(false);

      toast({
        title: "Label created",
        description: `"${newLabel.name}" has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Failed to create label",
        description: "There was an error creating the label",
        variant: "destructive",
      });
    }
  }, [newLabelName, newLabelColor, labels, toast]);

  const handleUpdateLabel = useCallback(async (labelId: string, updates: Partial<Label>) => {
    try {
      // Mock API call
      toast({
        title: "Label updated",
        description: "Label has been updated successfully",
      });
      setEditingLabel(null);
    } catch (error) {
      toast({
        title: "Failed to update label",
        description: "There was an error updating the label",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDeleteLabel = useCallback(async (labelId: string) => {
    try {
      // Mock API call
      toast({
        title: "Label deleted",
        description: "Label has been deleted successfully",
      });
      setDeletingLabel(null);
    } catch (error) {
      toast({
        title: "Failed to delete label",
        description: "There was an error deleting the label",
        variant: "destructive",
      });
    }
  }, [toast]);

  const LabelCard = ({ label }: { label: Label }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => mode === 'select' && onLabelSelect?.(label.id)}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: label.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{label.name}</h4>
                {label.isDefault && (
                  <Badge variant="outline" className="text-xs">Default</Badge>
                )}
              </div>
              {label.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {label.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{label.noteCount} notes</span>
                <span>Created {new Date(label.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {mode === 'select' ? (
            <div className="flex items-center">
              {selectedLabels.includes(label.id) && (
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingLabel(label)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit label
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin to sidebar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Add to favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive label
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeletingLabel(label)}
                  disabled={label.isDefault}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {mode === 'select' ? 'Select Labels' : 'Manage Labels'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search and Controls */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search labels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Sort by name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')}>
                    Sort by date created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('notes')}>
                    Sort by note count
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {mode === 'manage' && (
                <Button
                  onClick={() => setIsCreating(true)}
                  size="sm"
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Label
                </Button>
              )}
            </div>

            {/* Create Label Form */}
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Create New Label</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setIsCreating(false);
                            setNewLabelName('');
                            setNewLabelColor(labelColors[0]);
                          }}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <UILabel htmlFor="label-name">Name</UILabel>
                          <Input
                            id="label-name"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            placeholder="Enter label name..."
                            autoFocus
                          />
                        </div>
                        
                        <div>
                          <UILabel>Color</UILabel>
                          <div className="flex gap-2 mt-2">
                            {labelColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => setNewLabelColor(color)}
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 transition-all",
                                  newLabelColor === color
                                    ? "border-foreground scale-110"
                                    : "border-muted-foreground/30 hover:border-muted-foreground/60"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCreating(false);
                            setNewLabelName('');
                            setNewLabelColor(labelColors[0]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateLabel}>
                          <Save className="h-4 w-4 mr-2" />
                          Create Label
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Labels List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredLabels.map((label) => (
                    <LabelCard key={label.id} label={label} />
                  ))}
                </AnimatePresence>
                
                {filteredLabels.length === 0 && (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No labels found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? `No labels match "${searchQuery}"`
                        : "You haven't created any labels yet"
                      }
                    </p>
                    {!searchQuery && mode === 'manage' && (
                      <Button onClick={() => setIsCreating(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first label
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {mode === 'select' && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Apply Labels
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Label Dialog */}
      {editingLabel && (
        <Dialog open={!!editingLabel} onOpenChange={() => setEditingLabel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Label</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <UILabel htmlFor="edit-label-name">Name</UILabel>
                <Input
                  id="edit-label-name"
                  defaultValue={editingLabel.name}
                  placeholder="Enter label name..."
                />
              </div>
              <div>
                <UILabel htmlFor="edit-label-description">Description (Optional)</UILabel>
                <Input
                  id="edit-label-description"
                  defaultValue={editingLabel.description}
                  placeholder="Enter description..."
                />
              </div>
              <div>
                <UILabel>Color</UILabel>
                <div className="flex gap-2 mt-2">
                  {labelColors.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editingLabel.color === color
                          ? "border-foreground scale-110"
                          : "border-muted-foreground/30 hover:border-muted-foreground/60"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingLabel(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateLabel(editingLabel.id, {})}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLabel} onOpenChange={() => setDeletingLabel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingLabel?.name}</strong>? This action cannot be undone.
              The label will be removed from all notes that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLabel && handleDeleteLabel(deletingLabel.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Label
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
