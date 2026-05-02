import React, { useState } from 'react';
import { Check, ShieldAlert, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const STAGES = [
  { id: 'farm', label: 'Farm Origin' },
  { id: 'processing', label: 'Processing' },
  { id: 'distribution', label: 'Distribution' },
  { id: 'retail', label: 'Retail' },
  { id: 'consumer', label: 'Consumer' }
];

const SupplyChainTimeline = ({ events, currentStage, gapAnalysis }) => {
  const [expandedStage, setExpandedStage] = useState(null);
  
  const actualStages = events.map(e => e.stage);
  const currentStageIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full py-8 overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center min-w-[700px] relative px-4">
        
        {/* Background Line */}
        <div className="absolute top-[28px] left-[40px] right-[40px] h-1 bg-slate-700 hidden md:block z-0"></div>

        {STAGES.map((stage, index) => {
          const event = events.find(e => e.stage === stage.id);
          const isCompleted = !!event;
          const isCurrent = stage.id === currentStage;
          const isPending = !isCompleted && !isCurrent && index > currentStageIndex;
          const isMissing = gapAnalysis?.missingStages?.includes(stage.id);
          const isDelayed = gapAnalysis?.delayedStages?.includes(stage.id);

          // Status colors logic
          let circleClasses = "w-14 h-14 rounded-full flex items-center justify-center z-10 border-4 transition-all ";
          let lineClasses = "hidden md:block absolute top-[28px] left-0 h-1 z-0 transition-all ";
          let textClasses = "text-sm font-bold mt-4 text-center w-full ";

          if (isCompleted) {
            circleClasses += "bg-green-500 border-green-900 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
            textClasses += "text-green-400";
            if (index > 0) lineClasses += "bg-green-500";
          } else if (isCurrent) {
            circleClasses += "bg-orange-500 border-orange-900 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.6)]";
            textClasses += "text-orange-400";
            if (index > 0) lineClasses += "bg-orange-500/50 dashed";
          } else if (isMissing) {
            circleClasses += "bg-slate-800 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
            textClasses += "text-red-500";
          } else {
            circleClasses += "bg-slate-800 border-slate-700";
            textClasses += "text-slate-500";
          }

          // Positioning logic for connecting lines (simplified visual trick for web)
          const lineStyle = {
            width: '100%',
            left: index === 0 ? '50%' : '-50%'
          };

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center relative min-h-[100px] mb-8 md:mb-0">
              {/* Connector line (desktop) */}
              {index > 0 && (
                <div 
                  className={`absolute top-[28px] -left-1/2 w-full h-1 -z-10 ${isCompleted || isCurrent ? 'bg-orange-500' : 'bg-slate-700'}`} 
                  style={{ background: isCompleted ? '#22c55e' : isCurrent ? 'linear-gradient(90deg, #22c55e 50%, #334155 50%)' : '#334155' }}
                />
              )}

              {/* Warning Tags above circles */}
              <div className="h-10 w-full flex justify-center items-end pb-2 absolute -top-12">
                {isDelayed && <span className="bg-orange-500/20 text-orange-400 text-[10px] uppercase px-2 py-1 rounded border border-orange-500/30 flex items-center gap-1 font-bold"><Clock className="w-3 h-3"/> Delayed</span>}
                {isMissing && <span className="bg-red-500/20 text-red-500 text-[10px] uppercase px-2 py-1 rounded border border-red-500/30 flex items-center gap-1 font-bold"><ShieldAlert className="w-3 h-3"/> Missing</span>}
              </div>

              {/* Stage Circle */}
              <div 
                className={`${circleClasses} cursor-pointer hover:scale-105`}
                onClick={() => event && setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              >
                {isCompleted ? <Check className="w-6 h-6 text-white" /> : <div className="w-4 h-4 rounded-full bg-current opacity-50" />}
              </div>

              <div className={textClasses}>{stage.label}</div>

              {/* Expanded Card Details (Absolutely positioned below for desktop, relative for mobile) */}
              {expandedStage === stage.id && event && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-64 bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl z-20 text-left">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{event.role}</span>
                    <span className="text-xs text-slate-400">{new Date(event.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">{event.actor}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mb-3"><MapPin className="w-3 h-3 text-orange-500" /> {event.location}</div>
                  
                  {(event.temperature || event.humidity) && (
                    <div className="bg-slate-900 rounded p-2 mb-3 flex justify-between text-xs font-mono">
                      {event.temperature && <div>T: <span className="text-orange-400">{event.temperature}°C</span></div>}
                      {event.humidity && <div>H: <span className="text-blue-400">{event.humidity}%</span></div>}
                    </div>
                  )}

                  {event.notes && <p className="text-xs text-slate-400 mb-3 bg-slate-900/50 p-2 rounded italic">"{event.notes}"</p>}

                  <div className="text-[10px] text-slate-500 font-mono break-all group relative cursor-help">
                    <span className="font-bold">HASH:</span> {event.event_hash.substring(0, 16)}...
                    <div className="hidden group-hover:block absolute bottom-full mb-2 -left-4 w-48 bg-black text-white p-2 rounded text-[10px] z-30">
                      This cryptographic hash ensures event data was not tampered with.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplyChainTimeline;