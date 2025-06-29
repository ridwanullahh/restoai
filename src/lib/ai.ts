// Chutes AI Integration
export interface ChutesAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChutesAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChutesAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ChutesAI {
  private apiKey: string;
  private baseUrl = 'https://llm.chutes.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: ChutesAIMessage[], options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}): Promise<ChutesAIResponse> {
    const {
      model = 'deepseek-ai/DeepSeek-V3-0324',
      temperature = 0.7,
      max_tokens = 1024,
      stream = false
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chutes AI API error: ${response.statusText}`);
    }

    return response.json();
  }

  async generateMenuRecommendations(restaurantData: any): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are an AI restaurant consultant specializing in menu optimization and customer experience enhancement.'
      },
      {
        role: 'user',
        content: `Based on this restaurant data: ${JSON.stringify(restaurantData)}, provide 3 specific menu recommendations to increase sales and customer satisfaction. Focus on seasonal items, pricing optimization, and customer preferences.`
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || '';
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; score: number; summary: string }> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a sentiment analysis expert. Analyze the sentiment of restaurant reviews and feedback.'
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this restaurant review/feedback: "${text}". Return a JSON response with sentiment (positive/negative/neutral), score (0-1), and a brief summary.`
      }
    ];

    try {
      const response = await this.chat(messages);
      const content = response.choices[0]?.message?.content || '';
      return JSON.parse(content);
    } catch {
      return { sentiment: 'neutral', score: 0.5, summary: 'Unable to analyze sentiment' };
    }
  }

  async generateChatbotResponse(userMessage: string, restaurantContext: any): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: `You are a friendly AI assistant for ${restaurantContext.name}. Help customers with menu information, reservations, and general inquiries. Restaurant context: ${JSON.stringify(restaurantContext)}`
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || 'I apologize, but I cannot process your request right now.';
  }

  async optimizePricing(menuItems: any[], salesData: any[]): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a pricing optimization expert for restaurants. Analyze menu items and sales data to suggest optimal pricing strategies.'
      },
      {
        role: 'user',
        content: `Menu items: ${JSON.stringify(menuItems)}. Sales data: ${JSON.stringify(salesData)}. Provide specific pricing recommendations to maximize revenue while maintaining customer satisfaction.`
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || '';
  }

  async predictDemand(historicalData: any[], factors: any): Promise<string> {
    const messages: ChutesAIMessage[] = [
      {
        role: 'system',
        content: 'You are a demand forecasting specialist for restaurants. Analyze historical data and external factors to predict future demand.'
      },
      {
        role: 'user',
        content: `Historical sales data: ${JSON.stringify(historicalData)}. External factors: ${JSON.stringify(factors)}. Predict demand for the next 7 days and provide inventory recommendations.`
      }
    ];

    const response = await this.chat(messages);
    return response.choices[0]?.message?.content || '';
  }
}

export const createChutesAI = (apiKey: string) => new ChutesAI(apiKey);