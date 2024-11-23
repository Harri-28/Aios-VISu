import React, { useState } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTheme } from '../hooks/useTheme';

interface ThemeSelectorProps {
  currentTheme: string;
  themes: AppTheme[];
  onThemeChange: (themeName: string) => void;
  colorMode: 'light' | 'dark';
  onColorModeChange: (mode: 'light' | 'dark') => void;
}

export function ThemeSelector({ currentTheme, themes, onThemeChange, colorMode, onColorModeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentThemeData = themes.find(t => t.name === currentTheme) || themes[0];

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onColorModeChange(colorMode === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {colorMode === 'dark' ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-blue-200" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Palette className="h-4 w-4" />
          <span className="flex items-center gap-2">
            <span className="flex gap-1">
              {[
                currentThemeData.colors[colorMode].primary,
                currentThemeData.colors[colorMode].secondary,
                currentThemeData.colors[colorMode].accent
              ].map((color, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            <span>{currentThemeData.name}</span>
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
            >
              <div className="py-2">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      onThemeChange(theme.name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                      ${currentTheme === theme.name
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span className="flex gap-1">
                      {[
                        theme.colors[colorMode].primary,
                        theme.colors[colorMode].secondary,
                        theme.colors[colorMode].accent
                      ].map((color, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}