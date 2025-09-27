export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  reminder?: Reminder;
  checklist?: ChecklistItem[];
  images?: string[];
  audioUrl?: string;
  drawingData?: string;
  collaborators?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type NoteType = 'text' | 'checklist' | 'drawing' | 'image' | 'audio';
export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray' | 'dark';
export type ViewMode = 'grid' | 'list';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Reminder {
  id: string;
  type: 'time' | 'location';
  time?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  notified: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; hover: string }> = {
  default: { bg: 'bg-card', border: 'border-border', hover: 'hover:bg-accent' },
  red: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', hover: 'hover:bg-red-100 dark:hover:bg-red-950/30' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', hover: 'hover:bg-orange-100 dark:hover:bg-orange-950/30' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-950/30' },
  green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', hover: 'hover:bg-green-100 dark:hover:bg-green-950/30' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/20', border: 'border-teal-200 dark:border-teal-800', hover: 'hover:bg-teal-100 dark:hover:bg-teal-950/30' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/30' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', hover: 'hover:bg-purple-100 dark:hover:bg-purple-950/30' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800', hover: 'hover:bg-pink-100 dark:hover:bg-pink-950/30' },
  brown: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/30' },
  gray: { bg: 'bg-gray-50 dark:bg-gray-950/20', border: 'border-gray-200 dark:border-gray-800', hover: 'hover:bg-gray-100 dark:hover:bg-gray-950/30' },
  dark: { bg: 'bg-slate-800 dark:bg-slate-900', border: 'border-slate-700 dark:border-slate-600', hover: 'hover:bg-slate-700 dark:hover:bg-slate-800' }
};