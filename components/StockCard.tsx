import React from 'react';
import { AnalysisResult, Sentiment, Recommendation } from '../types';
import { ExternalLink, TrendingUp, TrendingDown, Minus, ArrowUpCircle, ArrowDownCircle, PauseCircle, Eye, Activity } from 'lucide-react';

interface StockCardProps {
  data: AnalysisResult;
}

const StockCard: React.FC<StockCardProps> = ({ data }) => {
  const getRecommendationStyle = (rec: Recommendation) => {
    switch (rec) {
      case Recommendation.BUY: return { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500', icon: <ArrowUpCircle className="w-5 h-5" /> };
      case Recommendation.SELL: return { bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500', icon: <ArrowDownCircle className="w-5 h-5" /> };
      case Recommendation.HOLD: return { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500', icon: <PauseCircle className="w-5 h-5" /> };
      default: return { bg: 'bg-gray-600', text: 'text-gray-400', border: 'border-gray-500', icon: <Eye className="w-5 h-5" /> };
    }
  };

  const getSentimentIcon = (s: Sentiment) => {
    switch (s) {
      case Sentiment.POSITIVE: return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case Sentiment.NEGATIVE: return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case Sentiment.NEUTRAL: return <Minus className="w-4 h-4 text-amber-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const recStyle = getRecommendationStyle(data.recommendation);

  return (
    <div className={`relative flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:border-gray-700`}>
      
      {/* Header Banner */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/30">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white tracking-tight">{data.ticker}</h3>
            <span className="text-xl font-medium text-blue-300">{data.currentPrice}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            {data.lastUpdated.toLocaleTimeString('vi-VN')} • Xu hướng: <span className="text-white font-semibold">{data.trend}</span>
          </p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${recStyle.border} bg-opacity-20 ${recStyle.bg} bg-opacity-10`}>
          <div className={recStyle.text}>{recStyle.icon}</div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-semibold uppercase">Khuyến nghị</span>
            <span className={`text-sm font-bold ${recStyle.text} uppercase`}>
              {data.recommendation === Recommendation.WATCH ? 'QUAN SÁT' : 
               data.recommendation === Recommendation.HOLD ? 'NẮM GIỮ' : 
               data.recommendation === Recommendation.BUY ? 'MUA' : 'BÁN'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Indicators Bar */}
      <div className="grid grid-cols-3 divide-x divide-gray-800 border-b border-gray-800 bg-gray-900/60">
        <div className="px-3 py-2 text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">P/E</span>
          <div className="text-sm font-mono text-gray-300 font-medium">{data.pe}</div>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">EPS</span>
          <div className="text-sm font-mono text-gray-300 font-medium">{data.eps}</div>
        </div>
        <div className="px-3 py-2 text-center">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">ROE</span>
          <div className="text-sm font-mono text-gray-300 font-medium">{data.roe}</div>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {/* Technical Section (Price Action) */}
        <div className="p-4 bg-gray-800/20 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
               <Activity className="w-3 h-3 text-blue-400" />
               <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Phân tích Kỹ thuật</h4>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-3 leading-relaxed italic border-l-2 border-blue-500 pl-3">
            "{data.technicalAnalysis}"
          </p>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-emerald-950/30 border border-emerald-900/50 rounded px-3 py-2">
                <span className="text-[10px] text-emerald-500 uppercase font-bold block">Hỗ trợ (Support)</span>
                <span className="text-sm text-gray-200 font-mono">{data.support}</span>
             </div>
             <div className="bg-rose-950/30 border border-rose-900/50 rounded px-3 py-2">
                <span className="text-[10px] text-rose-500 uppercase font-bold block">Kháng cự (Resistance)</span>
                <span className="text-sm text-gray-200 font-mono">{data.resistance}</span>
             </div>
          </div>
        </div>

        {/* Fundamental/Sentiment Section */}
        <div className="p-4 flex-grow">
           <div className="flex items-center gap-2 mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Cơ bản & Tin tức</h4>
            <div className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded-full">
              {getSentimentIcon(data.sentiment)}
              <span className={`text-[10px] font-bold ${
                data.sentiment === Sentiment.POSITIVE ? 'text-emerald-400' : 
                data.sentiment === Sentiment.NEGATIVE ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {data.sentiment}
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 hover:line-clamp-none transition-all cursor-default">
            {data.summary}
          </p>
          
          {data.keyPoints.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {data.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="mt-1 w-1 h-1 rounded-full bg-gray-500 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Sources */}
        <div className="p-3 bg-gray-900/80 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {data.sources.slice(0, 3).map((source, idx) => (
              <a 
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span className="truncate max-w-[120px]">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;