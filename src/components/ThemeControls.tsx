import React from 'react';
import { Palette, Sun, Moon, FileText, Type } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeControlsProps {
  colorMode: 'light' | 'dark';
  onColorModeChange: () => void;
}

export function ThemeControls({ colorMode, onColorModeChange }: ThemeControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onColorModeChange}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        aria-label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {colorMode === 'dark' ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700" />
        )}
      </motion.button>
    </div>
  );
}