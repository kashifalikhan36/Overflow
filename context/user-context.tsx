'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession, getUser } from '@/lib/supabase';
import { getLocalUserId, getLocalUserProfile } from '@/lib/current-user';

interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load session from Supabase if configured
    let mounted = true;

    async function init() {
      if (supabase) {
        try {
          const session = await getSession();
          const u = session?.user ?? null;
          if (mounted && u) {
            setUser({ id: u.id, name: (u.user_metadata as any)?.full_name || u.email || null, email: u.email || null, avatar_url: (u.user_metadata as any)?.avatar_url || null });
          } else if (mounted && !u) {
            // fallback local user
            const local = getLocalUserProfile();
            setUser({ id: local.id, name: local.name });
          }
        } catch (err) {
          const local = getLocalUserProfile();
          if (mounted) setUser({ id: local.id, name: local.name });
        }

        // Subscribe to auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          const u = (session as any)?.user || null;
          if (u) {
            setUser({ id: u.id, name: (u.user_metadata as any)?.full_name || u.email || null, email: u.email || null, avatar_url: (u.user_metadata as any)?.avatar_url || null });
          } else {
            const local = getLocalUserProfile();
            setUser({ id: local.id, name: local.name });
          }
        });

        setLoading(false);

        return () => {
          mounted = false;
          listener?.subscription.unsubscribe();
        };
      } else {
        // No Supabase configured, use local user
        const local = getLocalUserProfile();
        setUser({ id: local.id, name: local.name });
        setLoading(false);
      }
    }

    init();

    return () => { mounted = false; };
  }, []);

  const signIn = async () => {
    if (supabase) {
      // For simplicity, use GitHub OAuth if available
      await supabase.auth.signInWithOAuth({ provider: 'github' });
    } else {
      // Local fallback: prompt for a name and store as local user
      const name = prompt('Enter a display name for your local account (development only):') || 'Guest';
      localStorage.setItem('overflow-user-name', name);
      const id = getLocalUserId();
      setUser({ id, name });
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      const local = getLocalUserProfile();
      setUser({ id: local.id, name: local.name });
    } else {
      // Local logout clears local name and regenerates id
      localStorage.removeItem('overflow-user-name');
      localStorage.removeItem('overflow-user-id');
      const id = getLocalUserId();
      const local = getLocalUserProfile();
      setUser({ id: local.id, name: local.name });
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
