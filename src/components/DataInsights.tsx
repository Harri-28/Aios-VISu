import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, LineChart, Brain, AlertTriangle, BarChart2, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface DataInsightsProps {
  insights?: string[];
  suggestedCharts?: string[];
}

export function DataInsights({ insights = [], suggestedCharts = [] }: DataInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-6 w-6 text-purple-500" />
            <h3 className="text-xl font-semibold">Key Insights</h3>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20"
              >
                <BarChart2 className="h-5 w-5 text-purple-500 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Suggested Charts</h3>
          </div>
          <div className="space-y-4">
            {suggestedCharts.map((chart, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
              >
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{chart}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}