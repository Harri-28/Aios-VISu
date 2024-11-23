import { useState, useEffect } from 'react';

type ThemeColor = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  chart: string[];
};

export type AppTheme = {
  name: string;
  colors: {
    light: ThemeColor;
    dark: ThemeColor;
  };
};

export const THEMES: AppTheme[] = [
  {
    name: 'Modern',
    colors: {
      light: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937',
        accent: '#f43f5e',
        chart: ['#6366f1', '#8b5cf6', '#f43f5e', '#ec4899', '#d946ef', '#a855f7']
      },
      dark: {
        primary: '#818cf8',
        secondary: '#a78bfa',
        background: '#111827',
        text: '#f3f4f6',
        accent: '#fb7185',
        chart: ['#818cf8', '#a78bfa', '#fb7185', '#f472b6', '#e879f9', '#c084fc']
      }
    }
  },
  {
    name: 'Cyberpunk',
    colors: {
      light: {
        primary: '#00ff9d',
        secondary: '#00b8ff',
        background: '#ffffff',
        text: '#1a1a1a',
        accent: '#ff00ff',
        chart: ['#00ff9d', '#00b8ff', '#ff00ff', '#ff3366', '#ffff00', '#00ffcc']
      },
      dark: {
        primary: '#00ff9d',
        secondary: '#00b8ff',
        background: '#0a0a0a',
        text: '#ffffff',
        accent: '#ff00ff',
        chart: ['#00ff9d', '#00b8ff', '#ff00ff', '#ff3366', '#ffff00', '#00ffcc']
      }
    }
  },
  {
    name: 'Ocean',
    colors: {
      light: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        background: '#f0f9ff',
        text: '#0c4a6e',
        accent: '#06b6d4',
        chart: ['#0ea5e9', '#0284c7', '#06b6d4', '#0891b2', '#0e7490', '#155e75']
      },
      dark: {
        primary: '#38bdf8',
        secondary: '#0ea5e9',
        background: '#0c4a6e',
        text: '#e0f2fe',
        accent: '#22d3ee',
        chart: ['#38bdf8', '#0ea5e9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
      }
    }
  },
  {
    name: 'Forest',
    colors: {
      light: {
        primary: '#059669',
        secondary: '#047857',
        background: '#ecfdf5',
        text: '#064e3b',
        accent: '#10b981',
        chart: ['#059669', '#047857', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
      },
      dark: {
        primary: '#34d399',
        secondary: '#10b981',
        background: '#064e3b',
        text: '#d1fae5',
        accent: '#6ee7b7',
        chart: ['#34d399', '#10b981', '#6ee7b7', '#34d399', '#10b981', '#047857']
      }
    }
  },
  {
    name: 'Sunset',
    colors: {
      light: {
        primary: '#f97316',
        secondary: '#fb923c',
        background: '#fff7ed',
        text: '#7c2d12',
        accent: '#f43f5e',
        chart: ['#f97316', '#fb923c', '#f43f5e', '#fdba74', '#fed7aa', '#ffedd5']
      },
      dark: {
        primary: '#fb923c',
        secondary: '#f97316',
        background: '#431407',
        text: '#ffedd5',
        accent: '#f43f5e',
        chart: ['#fb923c', '#f97316', '#f43f5e', '#fdba74', '#fed7aa', '#ffedd5']
      }
    }
  },
  {
    name: 'Aurora',
    colors: {
      light: {
        primary: '#8b5cf6',
        secondary: '#6366f1',
        background: '#faf5ff',
        text: '#4c1d95',
        accent: '#a855f7',
        chart: ['#8b5cf6', '#6366f1', '#a855f7', '#c084fc', '#d946ef', '#e879f9']
      },
      dark: {
        primary: '#a855f7',
        secondary: '#8b5cf6',
        background: '#2e1065',
        text: '#f5f3ff',
        accent: '#6366f1',
        chart: ['#a855f7', '#8b5cf6', '#6366f1', '#818cf8', '#c084fc', '#d946ef']
      }
    }
  }
];

const defaultTheme = THEMES[0];

export function useTheme() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved) {
        const parsedTheme = JSON.parse(saved);
        if (parsedTheme?.name && parsedTheme?.colors?.light && parsedTheme?.colors?.dark) {
          return parsedTheme;
        }
      }
    } catch (error) {
      console.warn('Failed to parse saved theme, using default');
    }
    return defaultTheme;
  });

  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    if (localStorage.getItem('color-mode')) {
      return localStorage.getItem('color-mode') as 'light' | 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', JSON.stringify(theme));
      localStorage.setItem('color-mode', colorMode);
    } catch (error) {
      console.warn('Failed to save theme preferences');
    }
  }, [theme, colorMode]);

  useEffect(() => {
    const colors = theme.colors[colorMode];
    
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--background', colors.background);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--accent', colors.accent);
    
    document.documentElement.classList.toggle('dark', colorMode === 'dark');
  }, [theme, colorMode]);

  return { 
    theme, 
    setTheme: (newTheme: AppTheme) => {
      if (newTheme?.colors?.light && newTheme?.colors?.dark) {
        setTheme(newTheme);
      } else {
        console.warn('Invalid theme structure, using default');
        setTheme(defaultTheme);
      }
    }, 
    colorMode, 
    setColorMode,
    themes: THEMES 
  };
}