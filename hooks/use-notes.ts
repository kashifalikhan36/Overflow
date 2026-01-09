'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, NoteType, NoteColor } from '@/types/note';
import { getLocalUserId } from '@/lib/current-user';
import { supabase } from '@/lib/supabase';

// Mock data for development
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Overflow',
    content: 'Welcome! Create your first note with the + button (or press Ctrl+N). Use Ctrl+K to search your notes.',
    type: 'text',
    color: 'blue',
    labels: ['welcome', 'getting-started'],
    pinned: true,
    archived: false,
    deleted: false,
    permissions: 'private',
    syncStatus: 'synced',
    version: 1,
    metadata: {
      wordCount: 12,
      characterCount: 84,
      readingTime: 1,
      viewCount: 5,
      exportCount: 0,
      shareCount: 0,
      duplicateCount: 0,
      tags: [],
      source: 'web',
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    userId: getLocalUserId(),
  },
  {
    id: '2',
    title: 'Shopping List',
    content: '',
    type: 'checklist',
    color: 'green',
    labels: ['shopping', 'personal'],
    pinned: false,
    archived: false,
    deleted: false,
    permissions: 'private',
    syncStatus: 'synced',
    version: 1,
    checklist: [
      { id: '1', text: 'Milk', completed: false, order: 0, createdAt: '2024-01-02T14:30:00Z' },
      { id: '2', text: 'Bread', completed: true, order: 1, createdAt: '2024-01-02T14:31:00Z', completedAt: '2024-01-02T15:00:00Z' },
      { id: '3', text: 'Eggs', completed: false, order: 2, createdAt: '2024-01-02T14:32:00Z' },
      { id: '4', text: 'Apples', completed: false, order: 3, createdAt: '2024-01-02T14:33:00Z' },
    ],
    metadata: {
      wordCount: 4,
      characterCount: 20,
      readingTime: 1,
      viewCount: 3,
      exportCount: 0,
      shareCount: 0,
      duplicateCount: 0,
      tags: [],
      source: 'web',
    },
    createdAt: '2024-01-02T14:30:00Z',
    updatedAt: '2024-01-02T15:00:00Z',
    userId: getLocalUserId(),
  },
  {
    id: '3',
    title: 'Project Ideas',
    content: `Some exciting project ideas to work on:

• AI-powered note-taking app with voice transcription
• Collaborative whiteboard with real-time sync
• Smart calendar that learns from your habits
• Personal finance tracker with insights
• Recipe manager with meal planning

These could be great for the portfolio!`,
    type: 'text',
    color: 'purple',
    labels: ['projects', 'ideas', 'development'],
    pinned: false,
    archived: false,
    deleted: false,
    permissions: 'private',
    syncStatus: 'synced',
    version: 1,
    metadata: {
      wordCount: 45,
      characterCount: 312,
      readingTime: 1,
      viewCount: 2,
      exportCount: 0,
      shareCount: 0,
      duplicateCount: 0,
      tags: [],
      source: 'web',
    },
    createdAt: '2024-01-03T09:15:00Z',
    updatedAt: '2024-01-03T09:15:00Z',
    userId: getLocalUserId(),
  },
  {
    id: '4',
    title: 'Meeting Notes - Q1 Planning',
    content: `Team meeting notes from Q1 planning session:

Key Points:
- Launch new feature by March
- Increase user engagement by 20%
- Focus on mobile experience
- Weekly sprint reviews

Action Items:
- Research competitor analysis
- Design mockups for new UI
- Set up user testing sessions
- Plan marketing strategy`,
    type: 'text',
    color: 'orange',
    labels: ['work', 'meetings', 'planning'],
    pinned: false,
    archived: false,
    deleted: false,
    permissions: 'edit',
    syncStatus: 'synced',
    version: 1,
    collaborators: [
      {
        userId: 'user-2',
        email: 'colleague@example.com',
        name: 'John Doe',
        permission: 'view',
        invitedAt: '2024-01-04T10:00:00Z',
        status: 'accepted',
      }
    ],
    metadata: {
      wordCount: 52,
      characterCount: 341,
      readingTime: 1,
      viewCount: 4,
      exportCount: 1,
      shareCount: 1,
      duplicateCount: 0,
      tags: [],
      source: 'web',
    },
    createdAt: '2024-01-04T11:00:00Z',
    updatedAt: '2024-01-04T11:30:00Z',
    userId: getLocalUserId(),
  },
];

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockNotes;
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

        return mapRowToNote(data);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: (note as any).userId || getLocalUserId(),
      };
      
      return newNote;
    },
    onSuccess: () => {
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

        return mapRowToNote(data);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, this would update the note in the database
      const updatedNote = { ...updates, id, updatedAt: new Date().toISOString() } as Note;
      return updatedNote;
    },
    onSuccess: () => {
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
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, this would delete the note from the database
      console.log('Deleting note:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}