import React, {
  useState
} from 'react';

import {
  Check,
  ShieldAlert,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

const STAGES = [
  {
    id: 'farm',
    label: 'Farm Origin'
  },
  {
    id: 'processing',
    label: 'Processing'
  },
  {
    id: 'distribution',
    label: 'Distribution'
  },
  {
    id: 'retail',
    label: 'Retail'
  },
  {
    id: 'consumer',
    label: 'Consumer'
  }
];

const SupplyChainTimeline = ({
  events,
  currentStage,
  gapAnalysis
}) => {
  const [expandedStage, setExpandedStage] =
    useState(null);

  const actualStages =
    events.map((e) => e.stage);

  const currentStageIndex =
    STAGES.findIndex(
      (s) =>
        s.id === currentStage
    );

  return (
    <div className="w-full py-10 overflow-x-auto">

      <div className="min-w-[850px] relative px-10">

        {/* Background Line */}

        <div className="absolute top-[62px] left-[100px] right-[100px] h-[6px] bg-slate-100 rounded-full z-0" />

        <div className="flex justify-between items-start relative z-10">

          {STAGES.map(
            (stage, index) => {
              const event =
                events.find(
                  (e) =>
                    e.stage ===
                    stage.id
                );

              const isCompleted =
                !!event;

              const isCurrent =
                stage.id ===
                currentStage;

              const isMissing =
                gapAnalysis?.missingStages?.includes(
                  stage.id
                );

              const isDelayed =
                gapAnalysis?.delayedStages?.includes(
                  stage.id
                );

              let circleClasses =
                'w-24 h-24 rounded-[32px] flex items-center justify-center border-[6px] transition-all duration-300 relative';

              let textClasses =
                'text-sm font-black mt-5 text-center uppercase tracking-widest';

              if (isCompleted) {
                circleClasses +=
                  ' bg-emerald-500 border-emerald-50 shadow-xl shadow-emerald-500/20';

                textClasses +=
                  ' text-emerald-600';
              } else if (
                isCurrent
              ) {
                circleClasses +=
                  ' bg-orange-500 border-orange-50 shadow-2xl shadow-orange-500/20 animate-pulse scale-110';

                textClasses +=
                  ' text-orange-500';
              } else if (
                isMissing
              ) {
                circleClasses +=
                  ' bg-white border-red-100';

                textClasses +=
                  ' text-red-500';
              } else {
                circleClasses +=
                  ' bg-white border-slate-200';

                textClasses +=
                  ' text-slate-300';
              }

              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center relative w-[160px]"
                >

                  {/* Progress Line */}

                  {index > 0 && (
                    <div
                      className="absolute top-[58px] -left-[80px] w-[160px] h-[6px] rounded-full -z-10"
                      style={{
                        background:
                          isCompleted
                            ? '#10b981'
                            : isCurrent
                            ? 'linear-gradient(90deg, #10b981 50%, #e2e8f0 50%)'
                            : '#e2e8f0'
                      }}
                    />
                  )}

                  {/* Tags */}

                  <div className="h-12 flex items-end mb-4">

                    {isDelayed && (
                      <div className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">

                        <Clock className="w-3 h-3" />

                        Delayed

                      </div>
                    )}

                    {isMissing && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">

                        <ShieldAlert className="w-3 h-3" />

                        Missing

                      </div>
                    )}

                  </div>

                  {/* Circle */}

                  <button
                    onClick={() =>
                      event &&
                      setExpandedStage(
                        expandedStage ===
                          stage.id
                          ? null
                          : stage.id
                      )
                    }
                    className={`${circleClasses} group`}
                  >

                    {isCompleted ? (
                      <Check className="w-9 h-9 text-white" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-current opacity-20 group-hover:opacity-50 transition-all" />
                    )}

                  </button>

                  {/* Label */}

                  <div
                    className={
                      textClasses
                    }
                  >

                    {stage.label}

                  </div>

                  {/* Card */}

                  {expandedStage ===
                    stage.id &&
                    event && (
                      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-slate-200 rounded-[36px] p-6 shadow-2xl z-30 animate-in fade-in zoom-in duration-200">

                        {/* Header */}

                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">

                          <div className="bg-[#F8FAFC] border border-slate-200 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">

                            {event.role}

                          </div>

                          <div className="text-[11px] font-semibold text-slate-400">

                            {new Date(
                              event.created_at
                            ).toLocaleDateString()}

                          </div>

                        </div>

                        {/* Actor */}

                        <h3 className="text-2xl font-black text-slate-900 mb-2">

                          {event.actor}

                        </h3>

                        {/* Location */}

                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-5">

                          <MapPin className="w-4 h-4 text-orange-500" />

                          {event.location}

                        </div>

                        {/* Metrics */}

                        {(event.temperature ||
                          event.humidity) && (
                          <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-4 flex justify-between text-sm font-mono mb-5">

                            {event.temperature && (
                              <div>

                                T:{' '}

                                <span className="font-black text-orange-500">

                                  {
                                    event.temperature
                                  }
                                  °C

                                </span>

                              </div>
                            )}

                            {event.humidity && (
                              <div>

                                H:{' '}

                                <span className="font-black text-blue-500">

                                  {
                                    event.humidity
                                  }
                                  %

                                </span>

                              </div>
                            )}

                          </div>
                        )}

                        {/* Notes */}

                        {event.notes && (
                          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 text-sm text-slate-600 italic leading-relaxed mb-5">

                            "{event.notes}"

                          </div>
                        )}

                        {/* Hash */}

                        <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">

                          <div className="flex items-center gap-2 mb-2">

                            <Sparkles className="w-4 h-4 text-emerald-500" />

                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">

                              Blockchain Hash

                            </span>

                          </div>

                          <p className="text-[11px] font-mono text-slate-500 break-all leading-relaxed">

                            {event.event_hash.substring(
                              0,
                              40
                            )}
                            ...

                          </p>

                        </div>

                      </div>
                    )}

                </div>
              );
            }
          )}

        </div>
      </div>
    </div>
  );
};

export default SupplyChainTimeline;