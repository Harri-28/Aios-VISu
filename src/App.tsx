import React, { useState } from 'react';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { Visualization } from './components/Visualization';
import { DataInsights } from './components/DataInsights';
import { ChartThemeSelector } from './components/ChartThemeSelector';
import { ChartTypeSelector } from './components/ChartTypeSelector';
import { useTheme } from './hooks/useTheme';
import { processData } from './utils/dataProcessor';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualData, setVisualData] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [suggestedCharts, setSuggestedCharts] = useState<string[]>([]);
  const { theme, setTheme, colorMode } = useTheme();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'treemap'>('pie');

  const handleDataSubmit = async (input: string) => {
    setIsProcessing(true);
    try {
      const result = processData(input);
      setVisualData(result.data);
      setInsights(result.insights);
      setSuggestedCharts(result.suggestedCharts);
      setTheme(result.suggestedTheme);
      setChartType(result.suggestedCharts[0] as 'pie' | 'bar' | 'treemap');
    } catch (error) {
      console.error('Error processing data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-200">
      <Toaster position="top-right" />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Data into Beautiful Infographics
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Simply input your data and let AI create engaging animated visualizations in seconds.
          </p>
        </motion.div>

        <DataInput onSubmit={handleDataSubmit} isProcessing={isProcessing} />
        
        {visualData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <ChartTypeSelector 
                currentType={chartType} 
                onTypeChange={setChartType}
                suggestedCharts={suggestedCharts}
              />
              <ChartThemeSelector currentTheme={theme} onThemeChange={setTheme} />
            </div>
            
            <Visualization 
              data={visualData} 
              theme={theme} 
              chartType={chartType}
            />
            
            <DataInsights 
              insights={insights}
              suggestedCharts={suggestedCharts}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;