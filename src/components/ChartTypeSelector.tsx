import React from 'react';
import { BarChart2, PieChart, Grid } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartTypeSelectorProps {
  currentType: 'pie' | 'bar' | 'treemap';
  onTypeChange: (type: 'pie' | 'bar' | 'treemap') => void;
}

const chartTypes = [
  { id: 'pie', label: 'Pie Chart', icon: PieChart },
  { id: 'bar', label: 'Bar Chart', icon: BarChart2 },
  { id: 'treemap', label: 'Treemap', icon: Grid },
];

export function ChartTypeSelector({ currentType, onTypeChange }: ChartTypeSelectorProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type:</span>
      <div className="flex space-x-2">
        {chartTypes.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTypeChange(id as 'pie' | 'bar' | 'treemap')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
              currentType === id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
            }`}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}