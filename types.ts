export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  UNKNOWN = 'UNKNOWN'
}

export enum Recommendation {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
  WATCH = 'WATCH' // Quan sát thêm
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AnalysisResult {
  ticker: string;
  // Fundamental & Sentiment
  summary: string;
  sentiment: Sentiment;
  keyPoints: string[];
  
  // Financial Metrics
  pe: string;   // Price to Earning
  eps: string;  // Earning Per Share
  roe: string;  // Return on Equity

  // Technical & Price Action
  currentPrice: string;
  trend: string; // e.g., "Tăng ngắn hạn"
  support: string;
  resistance: string;
  technicalAnalysis: string; // Price Action summary
  recommendation: Recommendation;

  // Metadata
  sources: { title: string; url: string }[];
  lastUpdated: Date;
}

export interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
}