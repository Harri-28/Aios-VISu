import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Treemap, Label
} from 'recharts';
import { useTheme } from '../hooks/useTheme';
import { ExportControls } from './ExportControls';

interface VisualizationProps {
  data?: Array<{
    name: string;
    value: number;
  }>;
  chartType?: 'pie' | 'bar' | 'treemap';
  theme?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
        <p className="text-[var(--primary)] dark:text-[var(--primary)] font-medium">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
    {payload?.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {entry.value}
        </span>
      </div>
    ))}
  </div>
);

export function Visualization({ data = [], chartType = 'pie', theme: themeName }: VisualizationProps) {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const { theme, colorMode } = useTheme();
  
  // Get theme colors based on current theme and color mode
  const colors = theme.colors[colorMode];
  const chartColors = React.useMemo(() => {
    const baseColors = [
      colors.primary,
      colors.secondary,
      colors.accent,
      ...colors.chart || []
    ];

    // Generate additional colors if needed
    while (baseColors.length < (data?.length || 0)) {
      baseColors.push(...colors.chart || []);
    }

    return baseColors;
  }, [colors, data?.length]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available to visualize</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="!stroke-gray-200 dark:!stroke-gray-700" />
              <XAxis 
                dataKey="name"
                tick={{ fill: 'currentColor' }}
                stroke="currentColor"
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                stroke="currentColor"
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Label
                      position="top"
                      content={({ value }) => `${value}%`}
                    />
                  </Cell>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={data}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: chartColors[index % chartColors.length],
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1 / (depth + 1),
                      }}
                    />
                    {depth === 1 && (
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 7}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                      >
                        {name}
                      </text>
                    )}
                  </g>
                );
              }}
            />
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-end mb-4">
        <ExportControls chartRef={chartRef} data={data} />
      </div>

      <div ref={chartRef} className="w-full">
        {renderChart()}
        <CustomLegend 
          payload={data.map((item, index) => ({
            value: item.name,
            color: chartColors[index % chartColors.length],
            payload: item
          }))}
        />
      </div>
      
      <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                <span 
                  className="font-medium"
                  style={{ color: chartColors[index % chartColors.length] }}
                >
                  {item.value}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}