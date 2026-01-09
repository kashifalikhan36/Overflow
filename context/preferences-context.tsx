'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Preferences {
  showImages: boolean;
  setShowImages: (v: boolean) => void;
  showEffects: boolean;
  setShowEffects: (v: boolean) => void;
}

const PreferencesContext = createContext<Preferences | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [showImages, setShowImages] = useState(true);
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('overflow-show-images');
    if (stored !== null) setShowImages(stored === 'true');
    const storedEffects = localStorage.getItem('overflow-show-effects');
    if (storedEffects !== null) setShowEffects(storedEffects === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('overflow-show-images', showImages ? 'true' : 'false');
  }, [showImages]);

  useEffect(() => {
    localStorage.setItem('overflow-show-effects', showEffects ? 'true' : 'false');
  }, [showEffects]);

  return (
    <PreferencesContext.Provider value={{ showImages, setShowImages, showEffects, setShowEffects }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
