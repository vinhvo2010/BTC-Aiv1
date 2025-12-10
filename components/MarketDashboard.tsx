import React from 'react';
import { AnalysisResult, Sentiment, Recommendation } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StockCard from './StockCard';

interface MarketDashboardProps {
  results: AnalysisResult[];
}

const MarketDashboard: React.FC<MarketDashboardProps> = ({ results }) => {
  // Calculate Sentiment stats
  const sentStats = results.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentChartData = [
    { name: 'Tích cực', value: sentStats[Sentiment.POSITIVE] || 0, color: '#10b981' }, 
    { name: 'Tiêu cực', value: sentStats[Sentiment.NEGATIVE] || 0, color: '#f43f5e' }, 
    { name: 'Trung lập', value: sentStats[Sentiment.NEUTRAL] || 0, color: '#f59e0b' }, 
  ].filter(d => d.value > 0);

  // Calculate Recommendation stats
  const recStats = results.reduce((acc, curr) => {
    acc[curr.recommendation] = (acc[curr.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recChartData = [
    { name: 'Mua', value: recStats[Recommendation.BUY] || 0, color: '#059669' }, // Emerald-600
    { name: 'Bán', value: recStats[Recommendation.SELL] || 0, color: '#e11d48' }, // Rose-600
    { name: 'Nắm giữ', value: recStats[Recommendation.HOLD] || 0, color: '#d97706' }, // Amber-600
    { name: 'Quan sát', value: recStats[Recommendation.WATCH] || 0, color: '#4b5563' }, // Gray-600
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Overview Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sentiment Chart */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-col min-h-[250px]">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">Tâm lý Thị trường</h2>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation Chart */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-col min-h-[250px]">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">Khuyến nghị Giao dịch</h2>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {recChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={24} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
           <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-6 flex flex-col justify-center items-center">
             <span className="text-emerald-500 font-bold text-4xl mb-2">{recStats[Recommendation.BUY] || 0}</span>
             <span className="text-gray-400 text-sm uppercase tracking-widest text-center">Khuyến nghị MUA</span>
           </div>
           <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 flex flex-col justify-center items-center">
             <span className="text-rose-500 font-bold text-4xl mb-2">{recStats[Recommendation.SELL] || 0}</span>
             <span className="text-gray-400 text-sm uppercase tracking-widest text-center">Khuyến nghị BÁN</span>
           </div>
           <div className="col-span-2 bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between px-8">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs">Nắm giữ</span>
                <span className="text-2xl font-bold text-amber-500">{recStats[Recommendation.HOLD] || 0}</span>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="flex flex-col text-right">
                <span className="text-gray-400 text-xs">Quan sát</span>
                <span className="text-2xl font-bold text-gray-300">{recStats[Recommendation.WATCH] || 0}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {results.map((result) => (
          <StockCard key={result.ticker} data={result} />
        ))}
      </div>
    </div>
  );
};

export default MarketDashboard;