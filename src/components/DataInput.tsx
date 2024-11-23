import React, { useState, useCallback } from 'react';
import { Send, RefreshCw, Sparkles, Share2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { InputSelector } from './InputSelector';
import { enhancePrompt } from '../utils/promptEnhancer';

interface DataInputProps {
  onSubmit: (data: string) => void;
  isProcessing: boolean;
}

export function DataInput({ onSubmit, isProcessing }: DataInputProps) {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setInput(text);
      toast.success('File content loaded successfully!');
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt', '.csv'] },
    multiple: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  const enhanceUserPrompt = () => {
    const { enhancedText, suggestedCharts } = enhancePrompt(input);
    setInput(enhancedText);
    setSuggestions(suggestedCharts);
    toast.success('Prompt enhanced with analysis suggestions!', {
      duration: 4000,
      icon: '✨'
    });
  };

  const shareData = async () => {
    try {
      await navigator.clipboard.writeText(input);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <InputSelector activeInput={inputType} onInputChange={setInputType} />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputType === 'text' ? (
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your data here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={isProcessing}
            />
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={enhanceUserPrompt}
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
                title="Enhance prompt with analysis suggestions"
              >
                <Sparkles className="h-5 w-5" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareData}
                className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'dark:border-gray-700'}
              hover:border-purple-500 dark:hover:border-purple-500`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">
              {isDragActive ? 
                'Drop the file here...' : 
                'Drag & drop a CSV or text file here, or click to select'}
            </p>
            {input && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">File loaded: {input.slice(0, 50)}...</p>
              </div>
            )}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Suggested visualizations: {suggestions.join(', ')}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing || !input.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Generate</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}