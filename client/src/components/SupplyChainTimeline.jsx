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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center min-w-[700px] relative px-8">
        
        {/* Background Line */}
        <div className="absolute top-[32px] left-[60px] right-[60px] h-[3px] bg-slate-100 hidden md:block z-0 rounded-full"></div>

        {STAGES.map((stage, index) => {
          const event = events.find(e => e.stage === stage.id);
          const isCompleted = !!event;
          const isCurrent = stage.id === currentStage;
          const isPending = !isCompleted && !isCurrent && index > currentStageIndex;
          const isMissing = gapAnalysis?.missingStages?.includes(stage.id);
          const isDelayed = gapAnalysis?.delayedStages?.includes(stage.id);

          // Status colors logic
          let circleClasses = "w-16 h-16 rounded-full flex items-center justify-center z-10 border-[6px] transition-all duration-300 ";
          let textClasses = "text-xs font-black mt-5 text-center w-full uppercase tracking-widest ";

          if (isCompleted) {
            circleClasses += "bg-green-500 border-green-50 shadow-lg shadow-green-500/20";
            textClasses += "text-green-600";
          } else if (isCurrent) {
            circleClasses += "bg-orange-500 border-orange-50 animate-pulse shadow-xl shadow-orange-500/30 scale-110";
            textClasses += "text-orange-600";
          } else if (isMissing) {
            circleClasses += "bg-white border-red-100 shadow-md";
            textClasses += "text-red-500";
          } else {
            circleClasses += "bg-white border-slate-100";
            textClasses += "text-gray-300";
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
                  className={`absolute top-[32px] -left-1/2 w-full h-[3px] -z-10 rounded-full`} 
                  style={{ background: isCompleted ? '#22c55e' : isCurrent ? 'linear-gradient(90deg, #22c55e 50%, #f1f5f9 50%)' : '#f1f5f9' }}
                />
              )}

              {/* Warning Tags above circles */}
              <div className="h-10 w-full flex justify-center items-end pb-3 absolute -top-14">
                {isDelayed && <span className="bg-amber-50 text-amber-600 text-[9px] uppercase px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1 font-black shadow-sm tracking-widest animate-bounce"><Clock className="w-3 h-3"/> Delayed</span>}
                {isMissing && <span className="bg-red-50 text-red-600 text-[9px] uppercase px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1 font-black shadow-sm tracking-widest"><ShieldAlert className="w-3 h-3"/> Missing</span>}
              </div>

              {/* Stage Circle */}
              <div 
                className={`${circleClasses} cursor-pointer group/circle`}
                onClick={() => event && setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              >
                {isCompleted ? <Check className="w-6 h-6 text-white" /> : <div className="w-4 h-4 rounded-full bg-current opacity-20 group-hover/circle:opacity-50 transition-opacity" />}
              </div>

              <div className={textClasses}>{stage.label}</div>

              {/* Expanded Card Details */}
              {expandedStage === stage.id && event && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 w-72 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-2xl z-20 text-left animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                    <span className="text-[9px] bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-slate-100 uppercase font-black tracking-widest">{event.role}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(event.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-black text-gray-900 mb-1 text-sm font-poppins">{event.actor}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-4 font-bold tracking-tight"><MapPin className="w-3.5 h-3.5 text-orange-500" /> {event.location}</div>
                  
                  {(event.temperature || event.humidity) && (
                    <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex justify-between text-[11px] font-mono border border-slate-100">
                      {event.temperature && <div>T: <span className="text-orange-600 font-black">{event.temperature}°C</span></div>}
                      {event.humidity && <div>H: <span className="text-blue-600 font-black">{event.humidity}%</span></div>}
                    </div>
                  )}
                  {event.notes && <p className="text-[11px] text-gray-500 mb-4 bg-gray-50/80 p-3 rounded-2xl italic border border-slate-100/50 leading-relaxed">"{event.notes}"</p>}
                  <div className="text-[9px] text-gray-400 font-mono break-all group/hash relative cursor-help bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-black text-gray-400 uppercase mr-1">Hash:</span> {event.event_hash.substring(0, 24)}...
                    <div className="hidden group-hover/hash:block absolute bottom-full mb-3 -left-4 w-56 bg-gray-900 text-white p-3 rounded-2xl text-[10px] z-30 shadow-2xl leading-relaxed">
                      This cryptographic hash ensures event data was not tampered with on the immutable ledger.
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