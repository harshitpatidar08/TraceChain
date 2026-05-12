import React from 'react';

import {
  Bot,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const AIInsightBox = ({
  product,
  events,
  gapAnalysis
}) => {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[36px] p-6 md:p-8 shadow-sm">

      {/* Background Glow */}

      <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-52 h-52 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Header */}

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-[24px] bg-emerald-100 flex items-center justify-center shadow-sm">

            <Bot className="w-8 h-8 text-emerald-600" />

          </div>

          <div>

            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-2">

              <Sparkles className="w-3 h-3" />

              AI Powered Analysis

            </div>

            <h3 className="text-3xl font-black tracking-tight text-slate-900">

              AI Insights

            </h3>

            <p className="text-slate-500 mt-1">

              Intelligent product monitoring and anomaly detection

            </p>

          </div>
        </div>

        {/* Status Card */}

        <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl px-5 py-4 min-w-[180px]">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">

              <ShieldAlert className="w-6 h-6 text-orange-500" />

            </div>

            <div>

              <p className="text-xs uppercase tracking-widest font-bold text-slate-400">

                Total Insights

              </p>

              <h4 className="text-2xl font-black text-slate-900">

                {gapAnalysis.insights.length}

              </h4>

            </div>
          </div>
        </div>
      </div>

      {/* Insight Cards */}

      <div className="relative space-y-5 mb-10">

        {gapAnalysis.insights.map(
          (insight, idx) => {
            let style =
              'bg-[#F8FAFC] border border-slate-200';

            let icon = (
              <Info className="w-5 h-5 text-blue-500" />
            );

            let label =
              'Information';

            if (
              insight.severity === 'high'
            ) {
              style =
                'bg-red-50 border border-red-100';

              icon = (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              );

              label = 'Critical Alert';
            } else if (
              insight.severity === 'medium'
            ) {
              style =
                'bg-orange-50 border border-orange-100';

              icon = (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              );

              label = 'Warning';
            } else if (
              insight.severity === 'safe'
            ) {
              style =
                'bg-emerald-50 border border-emerald-100';

              icon = (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              );

              label = 'Safe Status';
            }

            return (
              <div
                key={idx}
                className={`rounded-[28px] p-5 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${style}`}
              >

                <div className="flex gap-4">

                  {/* Icon */}

                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">

                    {icon}

                  </div>

                  {/* Content */}

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3 mb-3">

                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">

                        {label}

                      </span>

                      <div className="w-1 h-1 rounded-full bg-slate-300" />

                      <span className="text-xs font-medium text-slate-400">

                        AI Generated Insight

                      </span>

                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium text-[15px]">

                      {insight.message}

                    </p>

                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Recommendations */}

      {gapAnalysis.recommendations.length >
        0 && (
        <div className="relative">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Sparkles className="w-6 h-6 text-orange-500" />

            </div>

            <div>

              <h4 className="text-xl font-black text-slate-900">

                Recommended Actions

              </h4>

              <p className="text-slate-500 text-sm mt-1">

                AI suggestions for improving product safety

              </p>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {gapAnalysis.recommendations.map(
              (rec, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-300"
                >

                  <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0">

                      <span className="text-lg">
                        💡
                      </span>

                    </div>

                    <div>

                      <p className="text-sm font-bold text-slate-900 mb-1">

                        Suggestion {idx + 1}

                      </p>

                      <p className="text-slate-600 leading-relaxed text-sm">

                        {rec}

                      </p>

                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightBox;