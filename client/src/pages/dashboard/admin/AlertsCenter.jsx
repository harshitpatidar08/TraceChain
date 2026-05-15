import { API_BASE_URL } from '..\..\..\config.js';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { AlertTriangle, CheckCircle, ShieldAlert, Thermometer, Info, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotifications } from '../../../context/NotificationContext';

const AlertsCenter = () => {
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/alerts`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      setAlerts(data || []);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        addNotification("✅ Alert resolved successfully", "success");
        fetchAlerts();
      } else {
        throw new Error('Failed to resolve alert');
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHrs < 24) return `${diffHrs} hr ago`;
    return `${diffDays} days ago`;
  };

  const getAlertIcon = (type) => {
    if (type.includes('temp') || type.includes('humidity')) return <Thermometer className="w-5 h-5" />;
    if (type.includes('gap') || type.includes('missing')) return <ShieldAlert className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  // Filter logic
  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All') return !alert.resolved;
    if (activeFilter === 'Resolved') return alert.resolved;
    return !alert.resolved && alert.severity.toLowerCase() === activeFilter.toLowerCase();
  });

  const filters = ['All', 'High', 'Medium', 'Low', 'Resolved'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="text-red-500 w-6 h-6" /> Alerts Center
        </h2>
        <p className="text-slate-500 text-sm mt-1">Manage network anomalies, AI insights, and supply chain integrity issues.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-px">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-widest transition-all relative rounded-2xl ${
              activeFilter === f 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mb-3"></div>
            <p className="text-slate-400 font-medium">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-xl">
            <div className="w-24 h-24 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">All clear!</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">
              {activeFilter === 'Resolved' 
                ? 'No resolved alerts found.' 
                : `There are no ${activeFilter !== 'All' ? activeFilter.toLowerCase() + ' severity' : 'active'} alerts at this time.`}
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isResolved = alert.resolved;
            let borderColor = 'border-blue-500';
            let iconColor = 'text-blue-600';
            let bgLight = 'bg-blue-50';
            
            if (alert.severity === 'high') {
              borderColor = 'border-red-500';
              iconColor = 'text-red-600';
              bgLight = 'bg-red-50';
            } else if (alert.severity === 'medium') {
              borderColor = 'border-orange-500';
              iconColor = 'text-orange-600';
              bgLight = 'bg-orange-50';
            }

            if (isResolved) {
              borderColor = 'border-slate-200';
              iconColor = 'text-gray-400';
              bgLight = 'bg-gray-50';
            }

            return (
              <div 
                key={alert.id} 
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row transition-all
                  ${isResolved ? 'opacity-60 grayscale-[0.2]' : ''} 
                  hover:shadow-lg border-l-4 ${borderColor}`}
              >
                {/* Alert Info Section */}
                <div className="flex-1 p-5 md:p-6 flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center ${bgLight} ${iconColor} ${isResolved ? 'border-slate-100' : 'border-' + alert.severity + '-100'}`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border
                        ${isResolved ? 'bg-gray-100 text-gray-400 border-slate-200' : bgLight + ' ' + iconColor + ' border-' + alert.severity + '-100'}`}>
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      {isResolved && <span className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100">Resolved</span>}
                      
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 ml-auto sm:ml-0 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" /> {timeAgo(alert.created_at)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-black text-gray-900 mb-1 pr-4 font-poppins">
                      {alert.product ? (
                        <Link to={`/dashboard/product/${alert.product_id}`} className="hover:text-orange-500 transition-colors">
                          {alert.product.name}
                        </Link>
                      ) : (
                        <span className="font-mono text-sm font-bold text-emerald-600">ID: {alert.product_id}</span>
                      )}
                    </h4>
                    
                    <p className="text-gray-500 text-sm leading-relaxed max-w-3xl font-medium">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                {!isResolved && (
                  <div className="p-5 md:p-6 bg-gray-50/50 border-t sm:border-t-0 sm:border-l border-slate-100 flex items-center justify-end sm:justify-center sm:min-w-[180px]">
                    <button 
                      onClick={() => handleResolve(alert.id)}
                    className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 w-full sm:w-auto justify-center shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" /> Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AlertsCenter;
