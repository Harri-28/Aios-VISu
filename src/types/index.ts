export type DataType = 'percentage' | 'temporal' | 'numerical' | 'categorical';

export interface EnhancedPrompt {
  enhancedText: string;
  suggestedCharts: string[];
  dataType: DataType;
}

export interface VisualizationData {
  name: string;
  value: number;
}