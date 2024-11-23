import React from 'react';
import { FileText, Type } from 'lucide-react';
import { motion } from 'framer-motion';

interface InputSelectorProps {
  activeInput: 'text' | 'file';
  onInputChange: (type: 'text' | 'file') => void;
}

export function InputSelector({ activeInput, onInputChange }: InputSelectorProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onInputChange('text')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          activeInput === 'text'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        <Type className="h-4 w-4" />
        <span>Text Input</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onInputChange('file')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          activeInput === 'file'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>File Upload</span>
      </motion.button>
    </div>
  );
}