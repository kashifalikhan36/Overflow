export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: NoteColor;
  labels: string[];
  pinned: boolean;
  archived: boolean;
  deleted: boolean;
  reminder?: Reminder;
  checklist?: ChecklistItem[];
  images?: NoteImage[];
  audioUrl?: string;
  audioTranscription?: string;
  drawingData?: DrawingData;
  collaborators?: Collaborator[];
  permissions: NotePermission;
  formatting?: TextFormatting;
  attachments?: Attachment[];
  location?: Location;
  metadata: NoteMetadata;
  syncStatus: SyncStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type NoteType = 'text' | 'checklist' | 'drawing' | 'image' | 'audio' | 'mixed';
export type NoteColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'brown' | 'gray' | 'dark';
export type ViewMode = 'grid' | 'list' | 'masonry';
export type SyncStatus = 'synced' | 'pending' | 'error' | 'offline';
export type NotePermission = 'private' | 'view' | 'edit' | 'full';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
  completedAt?: string;
}

export interface NoteImage {
  id: string;
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  mimeType: string;
  ocrText?: string;
  alt?: string;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface DrawingData {
  canvas: string; // base64 encoded canvas data
  strokes: DrawingStroke[];
  dimensions: {
    width: number;
    height: number;
  };
  tools: DrawingTool[];
}

export interface DrawingStroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: string;
  timestamp: number;
}

export interface DrawingTool {
  type: 'pen' | 'brush' | 'eraser' | 'highlighter' | 'shape';
  color: string;
  width: number;
  opacity: number;
}

export interface Collaborator {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  permission: NotePermission;
  invitedAt: string;
  lastSeenAt?: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Reminder {
  id: string;
  type: 'time' | 'location';
  time?: string;
  location?: Location;
  notified: boolean;
  recurring?: RecurringPattern;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  radius?: number; // for location-based reminders
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[]; // for weekly recurring
  dayOfMonth?: number; // for monthly recurring
}

export interface TextFormatting {
  bold?: number[][];
  italic?: number[][];
  underline?: number[][];
  strikethrough?: number[][];
  highlight?: Array<{ start: number; end: number; color: string }>;
  links?: Array<{ start: number; end: number; url: string }>;
  headings?: Array<{ start: number; end: number; level: 1 | 2 | 3 | 4 | 5 | 6 }>;
}

export interface Attachment {
  id: string;
  type: 'file' | 'link' | 'voice' | 'image';
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  metadata?: any;
  uploadedAt: string;
}

export interface NoteMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number; // in minutes
  lastViewedAt?: string;
  viewCount: number;
  exportCount: number;
  shareCount: number;
  duplicateCount: number;
  tags: string[];
  source?: 'web' | 'mobile' | 'desktop' | 'import' | 'voice' | 'ocr';
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  userId: string;
  noteCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  labels?: string[];
  colors?: NoteColor[];
  types?: NoteType[];
  dateRange?: {
    start: string;
    end: string;
  };
  hasReminder?: boolean;
  hasImages?: boolean;
  hasAudio?: boolean;
  isShared?: boolean;
  sortBy: 'updatedAt' | 'createdAt' | 'title' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

export interface NoteExport {
  format: 'json' | 'markdown' | 'html' | 'pdf' | 'docx' | 'txt';
  includeImages: boolean;
  includeAudio: boolean;
  includeDrawings: boolean;
  includeMetadata: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  reminderMinutes: number[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: ViewMode;
  defaultColor: NoteColor;
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  spellCheck: boolean;
  wordWrap: boolean;
  showLineNumbers: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: NotificationSettings;
  shortcuts: Record<string, string>;
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete' | 'archive' | 'pin';
  noteId: string;
  data: any;
  timestamp: string;
  synced: boolean;
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