'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Hash, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/types/note';
import { cn } from '@/lib/utils';

interface LabelsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Label[];
}

export function LabelsModal({ open, onOpenChange, labels }: LabelsModalProps) {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366f1');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const createLabel = () => {
    if (!newLabelName.trim()) return;
    
    const newLabel: Label = {
      id: Date.now().toString(),
      name: newLabelName,
      color: newLabelColor,
      userId: 'current-user',
      noteCount: 0,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Creating label:', newLabel);
    setNewLabelName('');
    setNewLabelColor('#6366f1');
    setShowColorPicker(false);
  };

  const deleteLabel = (labelId: string) => {
    console.log('Deleting label:', labelId);
  };

  const updateLabel = (labelId: string, updates: Partial<Label>) => {
    console.log('Updating label:', labelId, updates);
    setEditingLabel(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Manage Labels
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Label */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-sm">Create New Label</h3>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: newLabelColor }}
                />
                <Input
                  placeholder="Label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createLabel();
                  }}
                  className="flex-1"
                />
              </div>
              <Button
                onClick={createLabel}
                disabled={!newLabelName.trim()}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-background rounded-lg border"
              >
                <HexColorPicker
                  color={newLabelColor}
                  onChange={setNewLabelColor}
                  className="w-full"
                />
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(false)}
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Existing Labels */}
          <div className="space-y-2">
            {labels.length > 0 ? (
              <>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Existing Labels ({labels.length})
                </h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {labels.map((label) => (
                    <motion.div
                      key={label.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {editingLabel === label.id ? (
                          <Input
                            defaultValue={label.name}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateLabel(label.id, { name: e.currentTarget.value });
                              }
                              if (e.key === 'Escape') {
                                setEditingLabel(null);
                              }
                            }}
                            onBlur={(e) => {
                              updateLabel(label.id, { name: e.target.value });
                            }}
                            className="h-8 text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm">{label.name}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingLabel(label.id)}
                          className="h-7 w-7"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLabel(label.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No labels yet</p>
                <p className="text-xs">Create your first label above</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}