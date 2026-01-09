import Dexie from 'dexie';
import { Note, Label } from '@/types/note';

class OverflowDB extends Dexie {
  notes!: Dexie.Table<Note, string>;
  labels!: Dexie.Table<Label, string>;

  constructor() {
    super('OverflowDB');
    this.version(1).stores({
      notes: 'id, userId, updatedAt, createdAt',
      labels: 'id, userId, updatedAt, createdAt'
    });
  }
}

export const db = new OverflowDB();

export async function getAllLocalNotes(): Promise<Note[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray();
}

export async function addLocalNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function updateLocalNote(note: Note): Promise<void> {
  await db.notes.put(note);
}

export async function deleteLocalNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getAllLocalLabels(): Promise<Label[]> {
  return db.labels.orderBy('updatedAt').reverse().toArray();
}

export async function addLocalLabel(label: Label): Promise<void> {
  await db.labels.put(label);
}

export async function updateLocalLabel(label: Label): Promise<void> {
  await db.labels.put(label);
}

export async function deleteLocalLabel(id: string): Promise<void> {
  await db.labels.delete(id);
}
