import React, { useState } from 'react';
import { Check, ShieldAlert, Clock, MapPin, Sparkles, ShieldCheck, ChevronDown, ChevronUp, Thermometer, Droplets, X } from 'lucide-react';

const STAGES = [
  { id: 'farm', label: 'Farm Origin', icon: '🌱' },
  { id: 'processing', label: 'Processing', icon: '⚙️' },
  { id: 'distribution', label: 'Distribution', icon: '🚚' },
  { id: 'retail', label: 'Retail', icon: '🏪' },
  { id: 'consumer', label: 'Consumer', icon: '👤' },
];

const SupplyChainTimeline = ({ events, currentStage, gapAnalysis }) => {
  const [expandedStage, setExpandedStage] = useState(null);

  return (
    <div className="w-full">
      {/* Stage Steps */}
      <div className="relative flex items-start justify-between gap-0">
        {/* Connector Line */}
        <div className="absolute top-[22px] left-[36px] right-[36px] h-[2px] bg-slate-100 z-0" />

        {STAGES.map((stage, index) => {
          const event = events.find((e) => e.stage === stage.id);
          const isCompleted = !!event;
          const isCurrent = stage.id === currentStage;
          const isMissing = gapAnalysis?.missingStages?.includes(stage.id);
          const isDelayed = gapAnalysis?.delayedStages?.includes(stage.id);
          const isExpanded = expandedStage === stage.id;

          // Determine progress fill for this connector
          const prevStage = STAGES[index - 1];
          const prevCompleted = prevStage ? !!events.find((e) => e.stage === prevStage.id) : false;

          let dotBg, dotBorder, dotText, labelColor;

          if (isCompleted) {
            dotBg = 'bg-emerald-500';
            dotBorder = 'ring-4 ring-emerald-100';
            dotText = 'text-white';
            labelColor = 'text-emerald-600';
          } else if (isCurrent && !isCompleted) {
            dotBg = 'bg-orange-500';
            dotBorder = 'ring-4 ring-orange-100';
            dotText = 'text-white';
            labelColor = 'text-orange-500';
          } else if (isMissing) {
            dotBg = 'bg-red-100';
            dotBorder = 'ring-4 ring-red-50';
            dotText = 'text-red-500';
            labelColor = 'text-red-500';
          } else {
            dotBg = 'bg-slate-100';
            dotBorder = 'ring-4 ring-slate-50';
            dotText = 'text-slate-400';
            labelColor = 'text-slate-400';
          }

          return (
            <div key={stage.id} className="flex flex-col items-center flex-1 relative z-10">
              {/* Dot */}
              <button
                onClick={() =>
                  event && setExpandedStage(isExpanded ? null : stage.id)
                }
                title={event ? `View ${stage.label} details` : stage.label}
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 ${dotBg} ${dotBorder} ${event ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-md' : 'cursor-default'} ${isCurrent && !isCompleted ? 'animate-pulse' : ''}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                ) : isMissing ? (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                ) : (
                  <span className={`text-sm ${dotText}`}>{index + 1}</span>
                )}
              </button>

              {/* Label + badges */}
              <div className="mt-2 flex flex-col items-center gap-1">
                <span className={`text-[11px] font-bold text-center leading-tight ${labelColor}`}>
                  {stage.label}
                </span>
                {isDelayed && (
                  <span className="flex items-center gap-1 bg-orange-50 border border-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    <Clock className="w-2.5 h-2.5" /> Delayed
                  </span>
                )}
                {isMissing && (
                  <span className="flex items-center gap-1 bg-red-50 border border-red-100 text-red-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                    <ShieldAlert className="w-2.5 h-2.5" /> Missing
                  </span>
                )}
                {isCompleted && event && (
                  <span className="text-[9px] text-slate-400 font-medium">
                    {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Event Card */}
      {expandedStage && (() => {
        const event = events.find((e) => e.stage === expandedStage);
        const stageMeta = STAGES.find((s) => s.id === expandedStage);
        if (!event) return null;

        return (
          <div className="mt-8 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-200 relative">
            {/* Close */}
            <button
              onClick={() => setExpandedStage(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0">
                {stageMeta?.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                    {event.role}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(event.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">{event.actor}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            {(event.temperature || event.humidity) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {event.temperature && (
                  <div className="bg-white border border-orange-100 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Temperature</p>
                      <p className="text-sm font-black text-orange-600">{event.temperature}°C</p>
                    </div>
                  </div>
                )}
                {event.humidity && (
                  <div className="bg-white border border-blue-100 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Droplets className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Humidity</p>
                      <p className="text-sm font-black text-blue-600">{event.humidity}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 italic leading-relaxed">
                "{event.notes}"
              </div>
            )}

            {/* Blockchain Verified Badge */}
            {event.blockchain_tx_hash && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-emerald-700 mb-1">Verified on Blockchain</p>
                  <p className="text-[11px] font-mono text-emerald-600 break-all">{event.blockchain_tx_hash.substring(0, 20)}...</p>
                </div>
              </div>
            )}

            {/* Hash */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Event Hash</p>
                <p className="text-[11px] font-mono text-slate-500 break-all">{event.event_hash.substring(0, 40)}...</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Completed
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> In Progress
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" /> Pending
        </div>
        {gapAnalysis?.missingStages?.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="w-3 h-3 rounded-full bg-red-200 inline-block" /> Missing
          </div>
        )}
        <span className="ml-auto text-[10px] text-slate-300 font-medium">Click a completed step to view details</span>
      </div>
    </div>
  );
};

export default SupplyChainTimeline;