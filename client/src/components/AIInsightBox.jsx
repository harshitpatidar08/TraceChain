import React from 'react';
import { Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AIInsightBox = ({ product, events, gapAnalysis }) => {
  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-orange-400">
        <Bot className="w-5 h-5" /> 🤖 AI Insights
      </h3>
      
      <div className="space-y-3 mb-6">
        {gapAnalysis.insights.map((insight, idx) => {
          let bgColor = 'bg-slate-800 text-slate-300';
          let icon = <Info className="w-4 h-4" />;
          
          if (insight.severity === 'high') {
            bgColor = 'bg-red-500/20 text-red-300 border border-red-500/30';
            icon = <AlertTriangle className="w-4 h-4" />;
          } else if (insight.severity === 'medium') {
            bgColor = 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
            icon = <AlertTriangle className="w-4 h-4" />;
          } else if (insight.severity === 'safe') {
            bgColor = 'bg-green-500/20 text-green-300 border border-green-500/30';
            icon = <CheckCircle className="w-4 h-4" />;
          }

          return (
            <div key={idx} className={`p-3 rounded-lg flex items-start gap-3 text-sm ${bgColor}`}>
              <div className="mt-0.5">{icon}</div>
              <p className="font-medium">{insight.message}</p>
            </div>
          );
        })}
      </div>

      {gapAnalysis.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Recommendations</h4>
          <div className="flex flex-wrap gap-2">
            {gapAnalysis.recommendations.map((rec, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700 shadow-sm">
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