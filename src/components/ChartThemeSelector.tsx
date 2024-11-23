import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

interface ChartThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ChartThemeSelector({ currentTheme, onThemeChange }: ChartThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { themes } = useTheme();
  const currentThemeData = themes.find(t => t.name === currentTheme) || themes[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
      >
        <Palette className="h-5 w-5 text-[var(--primary)]" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
        <div className="flex gap-1">
          {[
            currentThemeData.colors.light.primary,
            currentThemeData.colors.light.secondary,
            currentThemeData.colors.light.accent
          ].map((color, i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {themes.map((theme) => (
                <motion.button
                  key={theme.name}
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => {
                    onThemeChange(theme.name);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-center space-x-3 text-left transition-colors
                    ${currentTheme === theme.name
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <div className="flex gap-1">
                    {[
                      theme.colors.light.primary,
                      theme.colors.light.secondary,
                      theme.colors.light.accent
                    ].map((color, i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{theme.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}