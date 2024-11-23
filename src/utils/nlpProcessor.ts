import nlp from 'compromise';
import natural from 'natural';
import { DataType } from '../types';

const tokenizer = new natural.WordTokenizer();

interface ProcessedData {
  type: DataType;
  entities: Array<{ name: string; value: number }>;
  relationships: string[];
  suggestedVisualization: string;
}

export function processText(text: string): ProcessedData {
  const doc = nlp(text);
  
  // Extract percentages and numbers
  const percentages = doc.match('#Percentage').out('array');
  const numbers = doc.numbers().out('array');
  
  // Extract entities and their values
  const entities = extractEntities(text, percentages, numbers);
  
  // Determine relationships between entities
  const relationships = findRelationships(doc);
  
  // Determine best visualization type
  const suggestedVisualization = suggestVisualization(text, entities, relationships);
  
  return {
    type: determineDataType(text),
    entities,
    relationships,
    suggestedVisualization
  };
}

function extractEntities(text: string, percentages: string[], numbers: string[]): Array<{ name: string; value: number }> {
  const doc = nlp(text);
  const entities: Array<{ name: string; value: number }> = [];
  
  // Match patterns like "X% of users..."
  const patterns = doc.match('[#Percentage] of [.+]');
  
  patterns.forEach((match, i) => {
    const value = parseFloat(percentages[i]);
    const name = match.after('of').before(['and', ',', '.']).out('text').trim();
    if (name && !isNaN(value)) {
      entities.push({ name, value });
    }
  });
  
  // Handle remaining/rest cases
  const total = entities.reduce((sum, entity) => sum + entity.value, 0);
  if (total < 100) {
    const restPattern = doc.match('(rest|remaining|others)').out('text');
    if (restPattern) {
      entities.push({ name: 'Others', value: 100 - total });
    }
  }
  
  return entities;
}

function findRelationships(doc: any): string[] {
  const relationships: string[] = [];
  
  // Find comparison words
  const comparisons = doc.match('(more than|less than|compared to|versus|vs)').out('array');
  if (comparisons.length > 0) {
    relationships.push('comparison');
  }
  
  // Find temporal relationships
  const temporal = doc.match('(over time|yearly|monthly|weekly|daily)').out('array');
  if (temporal.length > 0) {
    relationships.push('temporal');
  }
  
  // Find hierarchical relationships
  const hierarchical = doc.match('(within|inside|containing|comprises)').out('array');
  if (hierarchical.length > 0) {
    relationships.push('hierarchical');
  }
  
  return relationships;
}

function determineDataType(text: string): DataType {
  if (text.includes('%')) return 'percentage';
  if (text.match(/\d{4}/)) return 'temporal';
  if (text.match(/\d+(\.\d+)?/)) return 'numerical';
  return 'categorical';
}

function suggestVisualization(
  text: string, 
  entities: Array<{ name: string; value: number }>, 
  relationships: string[]
): string {
  if (relationships.includes('temporal')) {
    return 'line';
  }
  
  if (relationships.includes('hierarchical')) {
    return 'treemap';
  }
  
  if (relationships.includes('comparison')) {
    return entities.length > 4 ? 'bar' : 'pie';
  }
  
  // Default cases
  if (entities.length <= 5) return 'pie';
  if (entities.length <= 10) return 'bar';
  return 'treemap';
}