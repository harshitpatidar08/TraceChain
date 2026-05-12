import React from 'react';

import {
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const TrustScore = ({ score }) => {
  const radius = 42;

  const circumference =
    2 * Math.PI * radius;

  const strokeDashoffset =
    circumference -
    (score / 100) * circumference;

  let color = '#ef4444';

  let bg = 'bg-red-100';

  let text = 'text-red-600';

  let label = 'Low Trust';

  let icon = (
    <AlertTriangle className="w-5 h-5 text-red-500" />
  );

  if (score >= 80) {
    color = '#10b981';

    bg = 'bg-emerald-100';

    text = 'text-emerald-600';

    label = 'Highly Trusted';

    icon = (
      <ShieldCheck className="w-5 h-5 text-emerald-600" />
    );
  } else if (score >= 50) {
    color = '#f97316';

    bg = 'bg-orange-100';

    text = 'text-orange-500';

    label = 'Moderate Trust';

    icon = (
      <Sparkles className="w-5 h-5 text-orange-500" />
    );
  }

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[36px] p-6 shadow-sm w-full max-w-[280px]">

      {/* Glow */}

      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <div className="relative flex flex-col items-center text-center">

        {/* Badge */}

        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border mb-6 ${
            score >= 80
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : score >= 50
              ? 'bg-orange-50 border-orange-100 text-orange-600'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >

          {icon}

          {label}

        </div>

        {/* Progress */}

        <div className="relative flex items-center justify-center w-40 h-40 mb-5">

          {/* Background */}

          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 120 120"
          >

            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="10"
            />

            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={
                circumference
              }
              strokeDashoffset={
                strokeDashoffset
              }
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />

          </svg>

          {/* Center */}

          <div className="w-28 h-28 rounded-full bg-[#F8FAFC] border border-slate-200 flex flex-col items-center justify-center shadow-sm">

            <span
              className={`text-4xl font-black ${text}`}
            >

              {score}

            </span>

            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">

              SCORE

            </span>

          </div>

        </div>

        {/* Footer */}

        <h3 className="text-2xl font-black text-slate-900 mb-2">

          Trust Score

        </h3>

        <p className="text-slate-500 text-sm leading-relaxed max-w-[220px]">

          AI-generated trust verification
          based on blockchain supply chain
          authenticity.

        </p>

      </div>
    </div>
  );
};

export default TrustScore;