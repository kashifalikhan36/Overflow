'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/note';

// Mock data for development
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Overflow',
    content: 'This is your first note in Overflow! You can create text notes, checklists, add images, record audio, and much more. Try creating a new note using the + button.',
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
      wordCount: 32,
      characterCount: 188,
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
    userId: 'current-user',
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
    userId: 'current-user',
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
    userId: 'current-user',
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
    userId: 'current-user',
  },
];

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: async (): Promise<Note[]> => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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