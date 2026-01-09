'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/types/note';

// Mock data for development
const mockLabels: Label[] = [
  {
    id: '1',
    name: 'personal',
    color: '#10b981',
    userId: 'current-user',
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'work',
    color: '#3b82f6',
    userId: 'current-user',
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'ideas',
    color: '#8b5cf6',
    userId: 'current-user',
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    name: 'shopping',
    color: '#f59e0b',
    userId: 'current-user',
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async (): Promise<Label[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockLabels;
    },
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'noteCount' | 'isDefault'>): Promise<Label> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newLabel: Label = {
        ...label,
        id: Date.now().toString(),
        noteCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Label;
      
      return newLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Label> & { id: string }): Promise<Label> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedLabel = {
        id,
        noteCount: typeof updates.noteCount === 'number' ? updates.noteCount : 0,
        isDefault: updates.isDefault ?? false,
        updatedAt: new Date().toISOString(),
        ...updates,
      } as Label;
      return updatedLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Deleting label:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}