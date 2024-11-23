import Color from 'color';
import { DataType } from '../types';
import Papa from 'papaparse';

export interface ProcessedData {
  data: Array<{ name: string; value: number }>;
  insights: string[];
  suggestedCharts: string[];
  suggestedTheme: string;
}

function processCSVData(csvText: string): Array<{ name: string; value: number }> {
  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim()
  });

  if (results.errors.length > 0) {
    throw new Error('Invalid CSV format');
  }

  const headers = Object.keys(results.data[0]);
  if (headers.length !== 2) {
    throw new Error('CSV must have exactly two columns: name and value');
  }

  return results.data.map((row: any) => ({
    name: String(row[headers[0]]),
    value: parseFloat(row[headers[1]])
  })).filter(item => !isNaN(item.value));
}

export function processData(input: string): ProcessedData {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: Please provide valid text or CSV data');
  }

  let data: Array<{ name: string; value: number }>;

  // Try parsing as CSV first
  if (input.includes(',')) {
    try {
      data = processCSVData(input);
    } catch (e) {
      // If CSV parsing fails, fall back to text processing
      data = processTextData(input);
    }
  } else {
    data = processTextData(input);
  }

  if (data.length === 0) {
    return {
      data: [
        { name: 'Sample A', value: 40 },
        { name: 'Sample B', value: 30 },
        { name: 'Sample C', value: 30 }
      ],
      insights: ['Please enter valid data in text format or CSV'],
      suggestedCharts: ['pie', 'bar'],
      suggestedTheme: 'Modern'
    };
  }

  // Generate insights
  const insights = generateInsights(data);

  // Determine best visualizations
  const { suggestedCharts, suggestedTheme } = suggestVisualizations(input, data);

  return {
    data,
    insights,
    suggestedCharts,
    suggestedTheme
  };
}

function processTextData(input: string): Array<{ name: string; value: number }> {
  // Extract numbers and labels using more specific patterns
  const percentagePattern = /(\d+(?:\.\d+)?)%\s*(?:for|of|were|was|are|is)?\s*([^,.]+?)(?=\s*(?:,|\s+and|\s*$))/gi;
  const matches = Array.from(input.matchAll(percentagePattern));
  
  if (!matches.length) {
    return [];
  }

  // Parse data with improved label handling
  const data = matches.map(match => ({
    name: cleanLabel(match[2]),
    value: parseFloat(match[1])
  }));

  // Calculate total and handle remaining percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total < 100) {
    // Look for "rest" or "remaining" in the text
    const restPattern = /(?:the\s+)?(?:rest|remaining|others?)\s+(?:(?:is|are|were|was)\s+)?(\d+(?:\.\d+)?)%/i;
    const restMatch = input.match(restPattern);
    
    if (restMatch) {
      data.push({
        name: 'Others',
        value: parseFloat(restMatch[1])
      });
    } else if (total < 99.9) { // Account for floating point imprecision
      data.push({
        name: 'Others',
        value: Math.round((100 - total) * 10) / 10
      });
    }
  }

  return data;
}

function cleanLabel(label: string): string {
  return label
    .trim()
    .replace(/^(for|of|were|was|are|is)\s+/i, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function generateInsights(data: Array<{ name: string; value: number }>): string[] {
  const insights: string[] = [];
  
  // Find highest and lowest values
  const sorted = [...data].sort((a, b) => b.value - a.value);
  insights.push(`${sorted[0].name} represents the largest share at ${sorted[0].value}%`);
  
  if (sorted.length > 1) {
    insights.push(`${sorted[sorted.length - 1].name} has the smallest share at ${sorted[sorted.length - 1].value}%`);
  }
  
  // Calculate distribution
  const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const variance = data.reduce((sum, item) => sum + Math.pow(item.value - average, 2), 0) / data.length;
  
  if (variance < 100) {
    insights.push('The distribution is relatively balanced across categories');
  } else {
    insights.push('There are significant variations between categories');
  }

  // Identify patterns
  if (data.length > 2) {
    const differences = data.slice(0, -1).map((item, i) => item.value - data[i + 1].value);
    const isProgressive = differences.every(diff => Math.abs(diff - differences[0]) < 5);
    if (isProgressive) {
      insights.push('There is a consistent pattern in the distribution');
    }
  }

  return insights;
}

function suggestVisualizations(input: string, data: Array<{ name: string; value: number }>): {
  suggestedCharts: string[];
  suggestedTheme: string;
} {
  const suggestedCharts: string[] = [];
  let suggestedTheme = 'Modern';

  // Analyze input context
  const context = input.toLowerCase();
  const hasComparison = context.includes('versus') || context.includes('vs') || context.includes('compared');
  const hasPreference = context.includes('like') || context.includes('prefer');
  const hasOverlap = context.includes('both') || context.includes('also');

  // Chart suggestions based on data characteristics
  if (data.length <= 3) {
    suggestedCharts.push('pie'); // Pie charts work well for few categories
  }
  if (hasComparison || data.length > 3) {
    suggestedCharts.push('bar'); // Bar charts are good for comparisons
  }
  if (hasOverlap || data.length > 5) {
    suggestedCharts.push('treemap'); // Treemaps work well for hierarchical or nested data
  }

  // Theme suggestions based on context
  if (context.includes('nature') || context.includes('environment')) {
    suggestedTheme = 'Forest';
  } else if (context.includes('water') || context.includes('sea')) {
    suggestedTheme = 'Ocean';
  } else if (context.includes('modern') || context.includes('tech')) {
    suggestedTheme = 'Cyberpunk';
  } else if (context.includes('soft') || context.includes('gentle')) {
    suggestedTheme = 'Aurora';
  } else if (hasComparison) {
    suggestedTheme = 'Sunset';
  }

  // Ensure we have at least one chart type
  if (suggestedCharts.length === 0) {
    suggestedCharts.push('pie');
  }

  return {
    suggestedCharts,
    suggestedTheme
  };
}