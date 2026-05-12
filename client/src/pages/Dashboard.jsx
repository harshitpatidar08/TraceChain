import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto py-8 text-center">
      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <LayoutDashboard className="w-8 h-8 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Dashboard</h2>
      <p className="text-slate-500">Loading your dashboard...</p>
    </div>
  );
}