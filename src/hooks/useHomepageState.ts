import { useState, useEffect } from 'react';

export interface Bookmark {
    id: string;
    title: string;
    url: string;
    icon?: string;
    folderId?: string;
}

export interface Folder {
    id: string;
    title: string;
    color?: string;
}

export interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

export interface HomepageSettings {
    theme: string;
    preset: string;
    greetingName: string;
    searchEngine: 'google' | 'duckduckgo' | 'bing';
    showWidgets: boolean;
    screensaverTimeout: number; // minutes
    location?: string;
    onboarded: boolean;
    tempUnit: 'C' | 'F';
}

export interface HomepageState {
    bookmarks: Bookmark[];
    folders: Folder[];
    quickNotes: string;
    todos: Todo[];
    settings: HomepageSettings;
}

const PRESET_BOOKMARKS: Bookmark[] = [
    { id: 'p1', title: 'GitHub', url: 'https://github.com' },
    { id: 'p2', title: 'YouTube', url: 'https://youtube.com' },
    { id: 'p3', title: 'Twitter', url: 'https://twitter.com' },
    { id: 'p4', title: 'Reddit', url: 'https://reddit.com' },
    { id: 'p5', title: 'Gmail', url: 'https://mail.google.com' },
    { id: 'p6', title: 'LinkedIn', url: 'https://linkedin.com' },
];

const DEFAULT_STATE: HomepageState = {
    bookmarks: PRESET_BOOKMARKS.slice(0, 4),
    folders: [],
    quickNotes: '',
    todos: [
        { id: 't1', text: 'Plan next big project', completed: false },
        { id: 't2', text: 'Update portfolio', completed: true },
    ],
    settings: {
        theme: 'dark',
        preset: 'glass',
        greetingName: 'User',
        searchEngine: 'google',
        showWidgets: true,
        screensaverTimeout: 5,
        onboarded: false,
        tempUnit: 'F'
    }
};

export function useHomepageState() {
    const [state, setState] = useState<HomepageState>(() => {
        const saved = localStorage.getItem('utils_homepage_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_STATE, ...parsed };
            } catch (e) {
                console.error('Failed to parse homepage state', e);
            }
        }
        return DEFAULT_STATE;
    });

    useEffect(() => {
        localStorage.setItem('utils_homepage_state', JSON.stringify(state));
    }, [state]);

    const updateSettings = (updates: Partial<HomepageSettings>) => {
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...updates }
        }));
    };

    const addBookmark = (bookmark: Omit<Bookmark, 'id'>) => {
        const newBookmark = { ...bookmark, id: crypto.randomUUID() };
        setState(prev => ({
            ...prev,
            bookmarks: [...prev.bookmarks, newBookmark]
        }));
    };

    const removeBookmark = (id: string) => {
        setState(prev => ({
            ...prev,
            bookmarks: prev.bookmarks.filter(b => b.id !== id),
        }));
    };

    const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
        setState(prev => ({
            ...prev,
            bookmarks: prev.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
    };

    const addFolder = (title: string) => {
        const newFolder = { id: crypto.randomUUID(), title };
        setState(prev => ({
            ...prev,
            folders: [...prev.folders, newFolder]
        }));
    };

    const removeFolder = (id: string) => {
        setState(prev => ({
            ...prev,
            folders: prev.folders.filter(f => f.id !== id),
            bookmarks: prev.bookmarks.map(b => b.folderId === id ? { ...b, folderId: undefined } : b)
        }));
    };

    const updateNotes = (notes: string) => {
        setState(prev => ({ ...prev, quickNotes: notes }));
    };

    const addTodo = (text: string) => {
        const newTodo = { id: crypto.randomUUID(), text, completed: false };
        setState(prev => ({
            ...prev,
            todos: [newTodo, ...(prev.todos || [])]
        }));
    };

    const toggleTodo = (id: string) => {
        setState(prev => ({
            ...prev,
            todos: prev.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        }));
    };

    const removeTodo = (id: string) => {
        setState(prev => ({
            ...prev,
            todos: prev.todos.filter(t => t.id !== id)
        }));
    };

    const resetData = () => {
        setState(DEFAULT_STATE);
    };

    const exportData = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = 'utils-homepage-backup.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importData = (jsonData: string) => {
        try {
            const parsed = JSON.parse(jsonData);
            setState(parsed);
        } catch (e) {
            console.error('Failed to import data', e);
            alert('Invalid backup file');
        }
    };

    const completeOnboarding = (name: string, location: string, usePresets: boolean) => {
        setState(prev => ({
            ...prev,
            bookmarks: usePresets ? PRESET_BOOKMARKS : prev.bookmarks,
            settings: {
                ...prev.settings,
                greetingName: name,
                location: location,
                onboarded: true
            }
        }));
    };

    return {
        state,
        updateSettings,
        addBookmark,
        removeBookmark,
        updateBookmark,
        addFolder,
        removeFolder,
        updateNotes,
        addTodo,
        toggleTodo,
        removeTodo,
        resetData,
        exportData,
        importData,
        completeOnboarding
    };
}
