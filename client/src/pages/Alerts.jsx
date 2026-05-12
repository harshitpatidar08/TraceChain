import React from 'react';
import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="max-w-4xl mx-auto py-8 text-center">
      <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-orange-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Alerts Center</h2>
      <p className="text-slate-500">View system alerts from the Admin panel.</p>
    </div>
  );
}