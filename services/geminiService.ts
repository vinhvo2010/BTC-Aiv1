import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Sentiment, Recommendation, GroundingChunk } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

const extractSentiment = (text: string): Sentiment => {
  if (text.includes("SENTIMENT: POSITIVE")) return Sentiment.POSITIVE;
  if (text.includes("SENTIMENT: NEGATIVE")) return Sentiment.NEGATIVE;
  if (text.includes("SENTIMENT: NEUTRAL")) return Sentiment.NEUTRAL;
  return Sentiment.UNKNOWN;
};

const extractRecommendation = (text: string): Recommendation => {
  if (text.includes("RECOMMENDATION: BUY")) return Recommendation.BUY;
  if (text.includes("RECOMMENDATION: SELL")) return Recommendation.SELL;
  if (text.includes("RECOMMENDATION: HOLD")) return Recommendation.HOLD;
  return Recommendation.WATCH;
};

const extractTagValue = (text: string, tag: string): string => {
  const regex = new RegExp(`\\[${tag}\\](.*?)(?=\\[|$)`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : "N/A";
};

const extractKeyPoints = (text: string): string[] => {
  const points: string[] = [];
  // Look for the specific section first to avoid grabbing bullets from other sections
  const keyPointsSection = extractTagValue(text, 'KEY_POINTS');
  const lines = keyPointsSection.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      points.push(line.trim().substring(1).trim());
    }
  }
  return points.slice(0, 3);
};

export const analyzeStockWithGemini = async (ticker: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Bạn là chuyên gia phân tích tài chính và giao dịch chứng khoán cấp cao (CFA/CMT) chuyên về thị trường Việt Nam (VN30).
      Hãy phân tích mã cổ phiếu ${ticker} thật chuyên sâu.
      
      Sử dụng Google Search để tìm dữ liệu MỚI NHẤT (trong vòng 7 ngày qua) về:
      1. Sức khỏe tài chính: Tìm các chỉ số P/E, EPS, ROE hiện tại hoặc gần nhất.
      2. Phân tích kỹ thuật (Technical): Dữ liệu giá, Volume, và các chỉ báo.
      
      Yêu cầu phân tích:
      - CƠ BẢN: Đánh giá định giá cổ phiếu đắt hay rẻ dựa trên P/E và tiềm năng tăng trưởng.
      - KỸ THUẬT: Không chỉ nhìn xu hướng, hãy tìm các MẪU HÌNH GIÁ (Chart Patterns) như Vai-Đầu-Vai, Cốc-Tay-Cầm, Hai Đáy/Đỉnh, Wyckoff accumulation/distribution, hoặc tín hiệu từ RSI (Phân kỳ), MACD, Bollinger Bands.

      Trả về định dạng văn bản với các thẻ dữ liệu chính xác sau:

      [SUMMARY]
      Viết 2-3 câu tổng hợp ngắn gọn về câu chuyện cơ bản (Catalyst) và tâm lý thị trường hiện tại.

      [PRICE]
      Giá hiện tại (VND).

      [PE]
      Chỉ số P/E (ví dụ: 12.5). Nếu không tìm thấy chính xác, hãy ước lượng dựa trên báo cáo gần nhất.

      [EPS]
      Chỉ số EPS (ví dụ: 3,500).

      [ROE]
      Chỉ số ROE (ví dụ: 18%).

      [TREND]
      Xu hướng chính (ví dụ: Tăng ngắn hạn, Sideway tích lũy, Down trend).

      [SUPPORT]
      Vùng hỗ trợ cứng (Key Level).

      [RESISTANCE]
      Vùng kháng cự cứng (Key Level).

      [TECH_ANALYSIS]
      Phân tích hành động giá (Price Action) chuyên sâu. Nhận diện mẫu hình nến hoặc mẫu hình giá (Chart Pattern) đang hình thành. Nhận xét về Volume (Dòng tiền).

      [KEY_POINTS]
      • Điểm nhấn 1 (Về cơ bản/Tin tức)
      • Điểm nhấn 2 (Về kỹ thuật/Dòng tiền)
      • Điểm nhấn 3 (Rủi ro hoặc Cơ hội)

      [VERDICT]
      SENTIMENT: [POSITIVE hoặc NEGATIVE hoặc NEUTRAL]
      RECOMMENDATION: [BUY hoặc SELL hoặc HOLD hoặc WATCH]
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2, 
      },
    });

    const text = response.text || "Không thể lấy dữ liệu phân tích.";
    
    // Extract Sources
    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[];
    const sources = chunks
      .filter(c => c.web)
      .map(c => ({
        title: c.web!.title,
        url: c.web!.uri
      }))
      .filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i)
      .slice(0, 5);

    return {
      ticker,
      summary: extractTagValue(text, 'SUMMARY'),
      currentPrice: extractTagValue(text, 'PRICE'),
      pe: extractTagValue(text, 'PE'),
      eps: extractTagValue(text, 'EPS'),
      roe: extractTagValue(text, 'ROE'),
      trend: extractTagValue(text, 'TREND'),
      support: extractTagValue(text, 'SUPPORT'),
      resistance: extractTagValue(text, 'RESISTANCE'),
      technicalAnalysis: extractTagValue(text, 'TECH_ANALYSIS'),
      keyPoints: extractKeyPoints(text),
      sentiment: extractSentiment(text),
      recommendation: extractRecommendation(text),
      sources,
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error(`Error analyzing ${ticker}:`, error);
    return {
      ticker,
      summary: "Lỗi phân tích.",
      currentPrice: "N/A",
      pe: "N/A", eps: "N/A", roe: "N/A",
      trend: "Unknown",
      support: "N/A",
      resistance: "N/A",
      technicalAnalysis: "Không thể lấy dữ liệu kỹ thuật.",
      keyPoints: [],
      sentiment: Sentiment.UNKNOWN,
      recommendation: Recommendation.WATCH,
      sources: [],
      lastUpdated: new Date()
    };
  }
};