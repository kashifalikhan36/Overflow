'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Preferences {
  showImages: boolean;
  setShowImages: (v: boolean) => void;
}

const PreferencesContext = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [showImages, setShowImages] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('overflow-show-images');
    if (stored !== null) setShowImages(stored === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('overflow-show-images', showImages ? 'true' : 'false');
  }, [showImages]);

  return (
    <PreferencesContext.Provider value={{ showImages, setShowImages }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
