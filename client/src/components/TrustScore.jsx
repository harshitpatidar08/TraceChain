import React from 'react';

const TrustScore = ({ score }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = '#dc2626'; // red
  if (score >= 80) color = '#16a34a'; // green
  else if (score >= 50) color = '#f97316'; // orange

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#334155"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        <span className="absolute text-2xl font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-slate-400 text-sm mt-2 font-medium">Trust Score</span>
    </div>
  );
};

export default TrustScore;