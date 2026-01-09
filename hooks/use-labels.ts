'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/types/note';
import { getLocalUserId } from '@/lib/current-user';
import { supabase } from '@/lib/supabase';
import { getAllLocalLabels, addLocalLabel, updateLocalLabel, deleteLocalLabel } from '@/lib/local-db';

// Mock data for development
const mockLabels: Label[] = [
  {
    id: '1',
    name: 'personal',
    color: '#10b981',
    userId: getLocalUserId(),
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'work',
    color: '#3b82f6',
    userId: getLocalUserId(),
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'ideas',
    color: '#8b5cf6',
    userId: getLocalUserId(),
    noteCount: 0,
    isDefault: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '4',
    name: 'shopping',
    color: '#f59e0b',
    userId: getLocalUserId(),
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
      // If Supabase is configured, fetch real data
      if (supabase) {
        const { data, error } = await supabase
          .from('labels')
          .select('*')
          .eq('user_id', getLocalUserId())
          .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          color: d.color,
          description: d.description || undefined,
          userId: d.user_id,
          noteCount: d.note_count ?? 0,
          isDefault: d.is_default ?? false,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }

      // Fallback to local IndexedDB storage
      await new Promise(resolve => setTimeout(resolve, 200));
      return await getAllLocalLabels();
    },
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (label: Omit<Label, 'id' | 'createdAt' | 'updatedAt' | 'noteCount' | 'isDefault'>): Promise<Label> => {
      // If Supabase is configured, insert into DB
      if (supabase) {
        const { data, error } = await supabase.from('labels').insert({
          user_id: label.userId || getLocalUserId(),
          name: label.name,
          color: label.color,
          description: (label as any).description || null,
        }).select().single();

        if (error) throw error;

        const created = {
          id: data.id,
          name: data.name,
          color: data.color,
          description: data.description ?? undefined,
          userId: data.user_id,
          noteCount: 0,
          isDefault: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        try { await addLocalLabel(created as Label); } catch {};
        return created as Label;
      }

      // Fallback to mock behavior + local DB
      await new Promise(resolve => setTimeout(resolve, 300));
      const newLabel: Label = {
        ...label,
        id: Date.now().toString(),
        userId: (label as any).userId || getLocalUserId(),
        noteCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Label;
      try { await addLocalLabel(newLabel); } catch {}
      return newLabel;
    },
    onSuccess: (createdLabel: Label | unknown) => {
      const label = createdLabel as Label;
      queryClient.setQueryData<Label[] | undefined>(['labels'], (old) => (old ? [label, ...old] : [label]));
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Label> & { id: string }): Promise<Label> => {
      // If Supabase is configured, update DB
      if (supabase) {
        const { data, error } = await supabase.from('labels').update({
          name: (updates as any).name,
          color: (updates as any).color,
          description: (updates as any).description ?? null,
        }).eq('id', id).select().single();

        if (error) throw error;

        const updated = {
          id: data.id,
          name: data.name,
          color: data.color,
          description: data.description ?? undefined,
          userId: data.user_id,
          noteCount: 0,
          isDefault: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as Label;
        try { await updateLocalLabel(updated); } catch {}
        return updated as Label;
      }

      // Fallback to mock update + DB
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedLabel = {
        id,
        noteCount: typeof updates.noteCount === 'number' ? updates.noteCount : 0,
        isDefault: updates.isDefault ?? false,
        updatedAt: new Date().toISOString(),
        ...updates,
      } as Label;
      try { await updateLocalLabel(updatedLabel); } catch {}
      return updatedLabel;
    },
    onSuccess: (updatedLabel: Label | unknown) => {
      const label = updatedLabel as Label;
      queryClient.setQueryData<Label[] | undefined>(['labels'], (old) => (old ? old.map(l => l.id === label.id ? label : l) : [label]));
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // If Supabase is configured, delete from DB
      if (supabase) {
        const { error } = await supabase.from('labels').delete().eq('id', id);
        if (error) throw error;
        try { await deleteLocalLabel(id); } catch {};
        return;
      }

      // Fallback to mock behavior + DB
      await new Promise(resolve => setTimeout(resolve, 300));
      try { await deleteLocalLabel(id); } catch {}
    },
    onSuccess: (_res, id) => {
      queryClient.setQueryData<Label[] | undefined>(['labels'], (old) => (old ? old.filter(l => l.id !== (id as string)) : []));
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}