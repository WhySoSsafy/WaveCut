"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LS_KEY = "wavecut:favorites";

interface FavoritesCtx {
  favorites: string[];
  toggle(id: string): void;
  isFavorite(id: string): boolean;
}

const FavoritesContext = createContext<FavoritesCtx | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  // Start with empty array on both server and first client render (avoids hydration mismatch)
  const [favorites, setFavorites] = useState<string[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const next = parsed.filter((x): x is string => typeof x === "string");
          requestAnimationFrame(() => setFavorites(next));
        }
      }
    } catch {
      // localStorage unavailable — keep in-memory state
    }
  }, []);

  // Persist to localStorage on every change (try/catch = graceful in-memory fallback)
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favorites));
    } catch {
      // Storage full or blocked — app continues with in-memory state
    }
  }, [favorites]);

  function toggle(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function isFavorite(id: string) {
    return favorites.includes(id);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesCtx {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside <FavoritesProvider>");
  return ctx;
}
