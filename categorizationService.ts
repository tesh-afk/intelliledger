
import { categorizeTransactionAI } from './geminiService';
import { MOCK_CATEGORIZATION_RULES } from './mockDataService';

export interface CategorizationResult {
  category: string;
  confidence: number;
  source: 'RULE' | 'AI' | 'MANUAL';
  reasoning: string;
}

/**
 * Runs the categorization pipeline:
 * 1. Checks deterministic Rules Engine (Keyword matching).
 * 2. If no rule match, calls Gemini AI.
 */
export const runCategorizationPipeline = async (
  description: string,
  amount: number
): Promise<CategorizationResult> => {
  
  // Layer 1: Rules Engine
  const matchedRule = MOCK_CATEGORIZATION_RULES.find(rule => 
    description.toLowerCase().includes(rule.keyword.toLowerCase())
  );

  if (matchedRule) {
    return {
      category: matchedRule.category,
      confidence: 1.0,
      source: 'RULE',
      reasoning: `Matched keyword "${matchedRule.keyword}" in description.`
    };
  }

  // Layer 2: AI Engine
  try {
    const aiResult = await categorizeTransactionAI(description, amount);
    return {
      category: aiResult.category,
      confidence: aiResult.confidence,
      source: 'AI',
      reasoning: aiResult.reasoning
    };
  } catch (error) {
    // Fallback
    return {
      category: 'Uncategorized',
      confidence: 0,
      source: 'MANUAL',
      reasoning: 'Automated categorization failed.'
    };
  }
};
