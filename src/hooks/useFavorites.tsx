import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const FAVORITES_KEY = "utils-page-favorites";
const DEFAULT_FAVORITES = ["homepage"];

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem(FAVORITES_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse favorites", e);
                return DEFAULT_FAVORITES;
            }
        }
        return DEFAULT_FAVORITES;
    });

    useEffect(() => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const isFavorite = (id: string) => favorites.includes(id);

    const toggleFavorite = (id: string) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
