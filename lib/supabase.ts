import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Supabase client for client-side operations
export const supabase = env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
        global: {
          headers: {
            'x-application-name': 'overflow',
          },
        },
      }
    )
  : null;

// Types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          bio: string | null;
          preferences: Record<string, any>;
          storage_used: number;
          storage_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          type: 'text' | 'checklist' | 'drawing' | 'image' | 'audio';
          color: string;
          pinned: boolean;
          archived: boolean;
          deleted: boolean;
          deleted_at: string | null;
          checklist: any | null;
          drawings: any | null;
          images: any | null;
          audio_url: string | null;
          audio_transcription: string | null;
          audio_duration: number | null;
          is_shared: boolean;
          share_settings: Record<string, any>;
          reminder_date: string | null;
          reminder_repeat: string | null;
          reminder_enabled: boolean;
          location_latitude: number | null;
          location_longitude: number | null;
          location_name: string | null;
          metadata: Record<string, any>;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      labels: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['labels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['labels']['Insert']>;
      };
    };
  };
};

// Helper functions
export const getUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};
