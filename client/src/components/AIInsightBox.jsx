import React from 'react';
import { Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AIInsightBox = ({ product, events, gapAnalysis }) => {
  return (
    <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-8 shadow-sm">
      <h3 className="text-xl font-black flex items-center gap-3 mb-6 text-orange-600 font-poppins">
        <Bot className="w-6 h-6" /> AI Insights
      </h3>
      
      <div className="space-y-4 mb-8">
        {gapAnalysis.insights.map((insight, idx) => {
          let bgColor = 'bg-white text-gray-700 shadow-sm border border-slate-100';
          let icon = <Info className="w-4 h-4 text-gray-400" />;
          
          if (insight.severity === 'high') {
            bgColor = 'bg-white text-red-700 border border-red-100 shadow-sm';
            icon = <AlertTriangle className="w-4 h-4 text-red-500" />;
          } else if (insight.severity === 'medium') {
            bgColor = 'bg-white text-orange-700 border border-orange-100 shadow-sm';
            icon = <AlertTriangle className="w-4 h-4 text-orange-500" />;
          } else if (insight.severity === 'safe') {
            bgColor = 'bg-white text-green-700 border border-green-100 shadow-sm';
            icon = <CheckCircle className="w-4 h-4 text-green-500" />;
          }

          return (
            <div key={idx} className={`p-4 rounded-2xl flex items-start gap-4 text-sm font-medium transition-transform hover:scale-[1.01] ${bgColor}`}>
              <div className="mt-0.5 shrink-0">{icon}</div>
              <p>{insight.message}</p>
            </div>
          );
        })}
      </div>

      {gapAnalysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Recommended Actions</h4>
          <div className="flex flex-wrap gap-2">
            {gapAnalysis.recommendations.map((rec, idx) => (
              <span key={idx} className="px-4 py-2 bg-white text-gray-800 rounded-full text-xs font-bold border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default">
                💡 {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightBox;