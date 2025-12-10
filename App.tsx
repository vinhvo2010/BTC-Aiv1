import React, { useState, useCallback } from 'react';
import { VN30_LIST } from './constants';
import { analyzeStockWithGemini } from './services/geminiService';
import { AnalysisResult } from './types';
import MarketDashboard from './components/MarketDashboard';
import { Search, Loader2, CheckCircle2, BarChart3, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleTicker = (ticker: string) => {
    setSelectedTickers(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker) 
        : [...prev, ticker]
    );
  };

  const selectAll = () => {
    if (selectedTickers.length === VN30_LIST.length) {
      setSelectedTickers([]);
    } else {
      setSelectedTickers(VN30_LIST.map(s => s.ticker));
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (selectedTickers.length === 0) return;

    setIsAnalyzing(true);
    setResults([]); // Clear previous results
    setProgress(0);

    const newResults: AnalysisResult[] = [];
    
    // Process in batches of 3 to avoid hitting rate limits too hard/fast, 
    // although Gemini has decent limits, sequential is safer for "live" feel and visual progress.
    // For a better UX, we'll do them one by one but quickly.
    
    for (let i = 0; i < selectedTickers.length; i++) {
      const ticker = selectedTickers[i];
      const result = await analyzeStockWithGemini(ticker);
      newResults.push(result);
      
      // Update results incrementally so user sees cards popping in
      setResults(prev => [...prev, result]);
      setProgress(((i + 1) / selectedTickers.length) * 100);
    }

    setIsAnalyzing(false);
  }, [selectedTickers]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                VN30 Sentinel
              </h1>
              <p className="text-xs text-gray-400">AI-Powered Market Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             {isAnalyzing ? (
               <div className="flex items-center gap-3 px-6 py-2.5 bg-gray-800 rounded-full border border-gray-700 w-full md:w-auto">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <div className="flex flex-col w-full md:w-48">
                    <span className="text-xs text-gray-400">Đang phân tích... {Math.round(progress)}%</span>
                    <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
               </div>
             ) : (
               <button
                onClick={handleAnalyze}
                disabled={selectedTickers.length === 0}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-blue-900/20 ${
                  selectedTickers.length === 0 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Phân tích ({selectedTickers.length})</span>
              </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Selection Area */}
        <section className={`transition-all duration-500 ${isAnalyzing || results.length > 0 ? 'opacity-100' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Chọn mã cổ phiếu
            </h2>
            <button 
              onClick={selectAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {selectedTickers.length === VN30_LIST.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {VN30_LIST.map((stock) => {
              const isSelected = selectedTickers.includes(stock.ticker);
              return (
                <button
                  key={stock.ticker}
                  onClick={() => !isAnalyzing && toggleTicker(stock.ticker)}
                  disabled={isAnalyzing}
                  className={`
                    group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-900/30 border-blue-500/50 text-white shadow-lg shadow-blue-900/10' 
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                    }
                    ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className={`font-bold text-sm ${isSelected ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'}`}>
                    {stock.ticker}
                  </span>
                  <span className="text-[10px] truncate w-full text-center opacity-0 group-hover:opacity-100 absolute -bottom-6 bg-gray-800 px-2 py-1 rounded border border-gray-700 z-10 whitespace-nowrap">
                    {stock.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Area */}
        {results.length > 0 && (
          <section className="animate-fade-in-up">
             <div className="flex items-center gap-2 mb-6">
               <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
               <h2 className="text-2xl font-bold text-white">Kết quả phân tích</h2>
             </div>
             <MarketDashboard results={results} />
          </section>
        )}

        {/* Empty State */}
        {results.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
             <div className="bg-gray-800/50 p-6 rounded-full mb-4">
               <AlertCircle className="w-12 h-12 text-gray-500" />
             </div>
             <h3 className="text-xl font-semibold text-gray-300">Chưa có dữ liệu</h3>
             <p className="text-gray-500 max-w-md mt-2">
               Vui lòng chọn các mã cổ phiếu ở trên và nhấn nút "Phân tích" để AI quét tin tức và đánh giá thị trường.
             </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;