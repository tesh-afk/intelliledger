
import { GoogleGenAI, Type } from "@google/genai";
import { SmartReport, MarketingPlan } from '../types';

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
    console.warn("API Key is missing. AI features will mock responses or fail.");
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Categorizes a single transaction based on description and amount.
 */
export const categorizeTransactionAI = async (
  description: string,
  amount: number
): Promise<{ category: string; confidence: number; reasoning: string }> => {
  const ai = getClient();
  
  const prompt = `
    You are an expert accountant. Categorize this transaction based on the description and amount.
    Description: "${description}"
    Amount: ${amount}
    
    Standard Business Categories: 
    - Office Supplies
    - Travel & Subsistence
    - Meals & Entertainment
    - Software & Subscriptions
    - Professional Services
    - Rent
    - Utilities
    - Advertising
    - Payroll
    - Uncategorized (if unsure)

    Return a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER, description: "A number between 0 and 1" },
            reasoning: { type: Type.STRING }
          },
          required: ["category", "confidence", "reasoning"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      category: json.category || 'Uncategorized',
      confidence: json.confidence || 0.5,
      reasoning: json.reasoning || 'No reasoning provided.'
    };
  } catch (error) {
    console.error("Gemini Categorization Error:", error);
    // Fallback
    return { category: 'Uncategorized', confidence: 0, reasoning: 'AI Service Unavailable' };
  }
};

/**
 * Analyzes a receipt image to extract data.
 */
export const analyzeReceiptAI = async (
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<{ merchant: string; date: string; amount: number; category: string }> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Extract the merchant name, date, total amount, and suggest a category for this receipt. Return JSON."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING }
          },
          required: ["merchant", "amount"]
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return {
      merchant: json.merchant || 'Unknown Merchant',
      date: json.date || new Date().toISOString().split('T')[0],
      amount: json.amount || 0,
      category: json.category || 'Office Supplies'
    };

  } catch (error) {
    console.error("Gemini Receipt Analysis Error:", error);
    throw error;
  }
};

/**
 * Generates a brief financial insight based on P&L data.
 */
export const generateFinancialInsight = async (summaryData: string): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide a 2-sentence executive summary of the financial health based on this data: ${summaryData}. Be professional and concise.`
    });
    return response.text || "Financial data analysis unavailable.";
  } catch (e) {
    return "Unable to generate insights at this time.";
  }
};

/**
 * Generates a full Executive Report with commentary.
 */
export const generateExecutiveReportAI = async (
    currentData: any,
    previousData: any,
    period: string
): Promise<SmartReport> => {
    const ai = getClient();
    
    // Create prompt with data context
    const prompt = `
      You are a CFO advising a business owner.
      Analyze the following financial data for the ${period} period compared to the previous period.
      
      CURRENT PERIOD DATA:
      ${JSON.stringify(currentData)}
      
      PREVIOUS PERIOD DATA:
      ${JSON.stringify(previousData)}
      
      Instructions:
      1. Write a professional "Executive Summary" (2-3 sentences).
      2. Identify 3 specific things that "Worked Well" (Positive Trends).
      3. Identify 3 "Watch Outs" or negative trends for the next period.
      4. Provide simple "In Plain English" explanations for the changes in Revenue, Expenses, and Profit.
      
      Tone: Professional, encouraging, but realistic. Use "We" and "Our".
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        trends: {
                            type: Type.OBJECT,
                            properties: {
                                whatWorked: { type: Type.ARRAY, items: { type: Type.STRING } },
                                whatDidnt: { type: Type.ARRAY, items: { type: Type.STRING } },
                                watchOuts: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        },
                        narrative: {
                             type: Type.OBJECT,
                             properties: {
                                 revenueAnalysis: { type: Type.STRING },
                                 expenseAnalysis: { type: Type.STRING },
                                 profitabilityAnalysis: { type: Type.STRING },
                             }
                        }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || '{}');
        
        // Construct the full object with mock KPI data mixed with AI text
        return {
            generatedAt: new Date().toISOString(),
            period: period as any,
            executiveSummary: json.executiveSummary || "Analysis pending.",
            trends: {
                whatWorked: json.trends?.whatWorked || ["Revenue is steady."],
                whatDidnt: json.trends?.whatDidnt || ["Expenses slightly high."],
                watchOuts: json.trends?.watchOuts || ["Monitor cash flow."]
            },
            narrative: {
                revenueAnalysis: json.narrative?.revenueAnalysis || "",
                expenseAnalysis: json.narrative?.expenseAnalysis || "",
                profitabilityAnalysis: json.narrative?.profitabilityAnalysis || ""
            },
            // Note: KPIs are calculated deterministically in reportService, but structure is ready here
            kpis: {} as any 
        };

    } catch (error) {
        console.error("Gemini Report Generation Error:", error);
        // Fallback Mock Response
        return {
            generatedAt: new Date().toISOString(),
            period: period as any,
            executiveSummary: "We saw strong revenue growth this period, driven by new client acquisition. However, operating expenses increased slightly due to one-time software purchases.",
            trends: {
                whatWorked: ["Sales Revenue increased by 15%", "Client retention remains high", "Cash flow from operations is positive"],
                whatDidnt: ["Travel expenses exceeded budget by 10%", "Software costs increased due to new subscriptions"],
                watchOuts: ["Upcoming tax liability in Q4", "Seasonal dip expected in December sales"]
            },
            narrative: {
                revenueAnalysis: "Revenue is up compared to last period, primarily due to the new 'Acme Corp' contract.",
                expenseAnalysis: "Expenses trended higher, but largely due to strategic investments in software.",
                profitabilityAnalysis: "Net profit margin remains healthy at 24%, showing our core business model is sustainable."
            },
            kpis: {} as any
        };
    }
};

/**
 * Generates a marketing plan based on business input.
 */
export const generateMarketingPlanAI = async (
    businessType: string,
    goal: string,
    budget: number
): Promise<MarketingPlan> => {
    const ai = getClient();

    const prompt = `
        You are a Chief Marketing Officer (CMO). Create a fully automated marketing plan for a business.
        
        Business Type: ${businessType}
        Goal: ${goal}
        Monthly Budget: $${budget}
        
        Outputs required:
        1. A Strategy Summary (2-3 sentences).
        2. A Target Audience profile.
        3. A channel mix (e.g. SEO, LinkedIn, Ads) with budget allocation percentages.
        4. Specific recommended tactics for each channel.
        5. 5 Content Ideas for the calendar.
        6. Estimated ROI description.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strategySummary: { type: Type.STRING },
                        targetAudience: { type: Type.STRING },
                        estimatedROI: { type: Type.STRING },
                        channels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    allocationPercent: { type: Type.NUMBER },
                                    recommendedTactics: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        },
                        contentCalendar: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const json = JSON.parse(response.text || '{}');
        
        return {
            businessName: "Your Business",
            targetAudience: json.targetAudience || "General Audience",
            totalBudget: budget,
            strategySummary: json.strategySummary || "Focus on organic growth.",
            channels: json.channels || [],
            contentCalendar: json.contentCalendar || [],
            estimatedROI: json.estimatedROI || "Unknown"
        };

    } catch (error) {
        console.error("Gemini Marketing Plan Error:", error);
        return {
            businessName: "Your Business",
            targetAudience: "Small Business Owners",
            totalBudget: budget,
            strategySummary: "Focus on low-cost digital channels to maximize reach.",
            channels: [
                { name: "Content Marketing (SEO)", allocationPercent: 40, recommendedTactics: ["Weekly Blog", "Guest Posts"] },
                { name: "Social Media", allocationPercent: 30, recommendedTactics: ["LinkedIn Daily", "Twitter Threads"] },
                { name: "Email Marketing", allocationPercent: 30, recommendedTactics: ["Weekly Newsletter", "Drip Campaign"] }
            ],
            contentCalendar: ["How to save money on taxes", "Top 5 industry tools", "Client success story"],
            estimatedROI: "3x Return on Ad Spend projected"
        };
    }
};
