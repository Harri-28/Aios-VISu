import { DataType, EnhancedPrompt } from '../types';

export function detectDataType(input: string): DataType {
  if (input.includes('%') || input.match(/\d+(\.\d+)?%/g)) {
    return 'percentage';
  } else if (input.match(/\d{4}/g)) {
    return 'temporal';
  } else if (input.match(/\d+(\.\d+)?/g)) {
    return 'numerical';
  }
  return 'categorical';
}

export function enhancePrompt(input: string): EnhancedPrompt {
  const dataType = detectDataType(input);
  let enhancedText = input;
  let suggestedCharts: string[] = [];

  // Analyze input pattern
  if (dataType === 'percentage') {
    if (input.toLowerCase().includes('like') || input.toLowerCase().includes('prefer')) {
      enhancedText += '\nAnalyzing preference distribution. Recommended visualizations: Pie Chart for overall distribution, Bar Chart for comparison.';
      suggestedCharts = ['pie', 'bar'];
    } else if (input.toLowerCase().includes('both')) {
      enhancedText += '\nDetected overlapping categories. Recommended visualization: Treemap for hierarchical representation.';
      suggestedCharts = ['treemap'];
    }
  }

  // Add data insights
  const percentages = input.match(/\d+%/g);
  if (percentages) {
    const values = percentages.map(p => parseInt(p));
    const total = values.reduce((a, b) => a + b, 0);
    if (total < 100) {
      enhancedText += `\nNote: Total percentage is ${total}%. The remaining ${100 - total}% will be calculated as "Others".`;
    }
  }

  return {
    enhancedText,
    suggestedCharts: suggestedCharts.length > 0 ? suggestedCharts : ['pie', 'bar', 'treemap'],
    dataType
  };
}