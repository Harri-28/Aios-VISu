import React from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { theme, setTheme, colorMode, setColorMode, themes } = useTheme();

  return (
    <header className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-8 w-8" />
          <h1 className="text-2xl font-bold">AEOS Visualizer</h1>
        </div>
        
        <ThemeSelector
          currentTheme={theme.name}
          themes={themes}
          onThemeChange={(newTheme) => setTheme(themes.find(t => t.name === newTheme) || themes[0])}
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />
      </div>
    </header>
  );
}