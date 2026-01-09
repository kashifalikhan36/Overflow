'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, NoteType, NoteColor } from '@/types/note';
import { getLocalUserId } from '@/lib/current-user';
import { supabase } from '@/lib/supabase';
import { getAllLocalNotes, addLocalNote, updateLocalNote, deleteLocalNote } from '@/lib/local-db';

// Helper to map Supabase rows to the Note type
function mapRowToNote(row: any): Note {
  return {
    id: row.id,
    title: row.title ?? 'Untitled',
    content: row.content ?? '',
    type: (row.type as NoteType) ?? 'text',
    color: (row.color as NoteColor) ?? 'default',
    labels: row.labels || [],
    pinned: row.pinned ?? false,
    archived: row.archived ?? false,
    deleted: row.deleted ?? false,
    reminder: row.reminder_date ? { id: row.id + '-reminder', type: 'time', time: row.reminder_date, notified: false, title: row.title ?? '', createdAt: row.reminder_date } : undefined,
    checklist: row.checklist ?? undefined,
    images: row.images ?? undefined,
    audioUrl: row.audio_url ?? undefined,
    audioTranscription: row.audio_transcription ?? undefined,
    drawingData: row.drawings ?? undefined,
    collaborators: row.collaborators ?? undefined,
    permissions: row.is_shared ? 'edit' : 'private',
    metadata: row.metadata ?? {
      wordCount: (row.content || '').split(' ').filter(Boolean).length,
      characterCount: (row.content || '').length,
      readingTime: Math.ceil(((row.content || '').split(' ').length || 0) / 200),
      viewCount: 0,
      exportCount: 0,
      shareCount: 0,
      duplicateCount: 0,
      tags: [],
      source: 'web',
    },
    syncStatus: 'synced',
    version: row.version ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  } as Note;
}

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async (): Promise<Note[]> => {
      if (supabase) {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', getLocalUserId())
          .order('updated_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(mapRowToNote);
      }

      // Fallback to local IndexedDB storage
      await new Promise(resolve => setTimeout(resolve, 200));
      return await getAllLocalNotes();
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
      // If Supabase is configured, insert the note
      if (supabase) {
        const insertData: any = {
          user_id: note.userId || getLocalUserId(),
          title: note.title || null,
          content: note.content || '',
          type: note.type,
          color: note.color,
          pinned: note.pinned,
          archived: note.archived,
          deleted: note.deleted,
          checklist: note.checklist || null,
          drawings: note.drawingData || null,
          images: note.images || null,
          audio_url: note.audioUrl || null,
          audio_transcription: note.audioTranscription || null,
          metadata: note.metadata || {},
          version: note.version || 1,
        };

        const { data, error } = await supabase.from('notes').insert(insertData).select().single();
        if (error) throw error;

        const created = mapRowToNote(data);
        // If using local db fallback, also persist the record locally
        try { await addLocalNote(created); } catch { /* ignore */ }
        return created;
      }

      // Simulate API call and persist locally
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: (note as any).userId || getLocalUserId(),
      };
      await addLocalNote(newNote);
      return newNote;
    },
    onSuccess: (createdNote: Note | unknown) => {
      const newNote = createdNote as Note;
      console.log('Note created (onSuccess):', newNote);
      // Update cache immediately so UI reflects new note
      queryClient.setQueryData<Note[] | undefined>(['notes'], (old) => {
        return old ? [newNote, ...old] : [newNote];
      });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }): Promise<Note> => {
      // If Supabase is configured, update DB
      if (supabase) {
        const updatePayload: any = {
          title: (updates as any).title,
          content: (updates as any).content,
          type: (updates as any).type,
          color: (updates as any).color,
          pinned: (updates as any).pinned,
          archived: (updates as any).archived,
          deleted: (updates as any).deleted,
          checklist: (updates as any).checklist ?? null,
          drawings: (updates as any).drawingData ?? null,
          images: (updates as any).images ?? null,
          audio_url: (updates as any).audioUrl ?? null,
          audio_transcription: (updates as any).audioTranscription ?? null,
          metadata: (updates as any).metadata ?? {},
          version: (updates as any).version ?? 1,
        };

        const { data, error } = await supabase.from('notes').update(updatePayload).eq('id', id).select().single();
        if (error) throw error;

        const mapped = mapRowToNote(data);
        await updateLocalNote(mapped);
        return mapped;
      }

      // Simulate API call and update local DB
      await new Promise(resolve => setTimeout(resolve, 300));
      const updatedNote = { ...updates, id, updatedAt: new Date().toISOString() } as Note;
      await updateLocalNote(updatedNote);
      return updatedNote;
    },
    onSuccess: (updatedNote: Note | unknown) => {
      const note = updatedNote as Note;
      queryClient.setQueryData<Note[] | undefined>(['notes'], (old) => {
        if (!old) return [note];
        return old.map(n => n.id === note.id ? note : n);
      });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // If Supabase is configured, delete from DB
      if (supabase) {
        const { error } = await supabase.from('notes').delete().eq('id', id);
        if (error) throw error;
        try { await deleteLocalNote(id); } catch (err) { /* ignore */ }
        return;
      }
      
      // Simulate API call and delete locally
      await new Promise(resolve => setTimeout(resolve, 300));
      await deleteLocalNote(id);
    },
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Note[] | undefined>(['notes'], (old) => (old ? old.filter(n => n.id !== id) : []));
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}