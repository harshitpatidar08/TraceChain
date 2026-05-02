import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { AlertTriangle, CheckCircle, ShieldAlert, Thermometer, Info, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AlertsCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('http://localhost:5000/api/alerts', {
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
      const res = await fetch(`http://localhost:5000/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        toast.success("Alert resolved!");
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
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-orange-500 w-6 h-6" /> Alerts Center
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manage network anomalies, AI insights, and supply chain integrity issues.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-px">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-6 py-3 font-bold text-sm transition-all relative ${
              activeFilter === f 
                ? 'text-orange-400' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            {f}
            {activeFilter === f && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_-2px_10px_rgba(249,115,22,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-slate-800 p-16 rounded-xl border border-slate-700 text-center shadow-sm">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">All clear!</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              {activeFilter === 'Resolved' 
                ? 'No resolved alerts found.' 
                : `There are no ${activeFilter !== 'All' ? activeFilter.toLowerCase() + ' severity' : 'active'} alerts at this time.`}
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isResolved = alert.resolved;
            let borderColor = 'border-blue-500';
            let iconColor = 'text-blue-500';
            let bgLight = 'bg-blue-500/10';
            
            if (alert.severity === 'high') {
              borderColor = 'border-red-500';
              iconColor = 'text-red-500';
              bgLight = 'bg-red-500/10';
            } else if (alert.severity === 'medium') {
              borderColor = 'border-orange-500';
              iconColor = 'text-orange-500';
              bgLight = 'bg-orange-500/10';
            }

            if (isResolved) {
              borderColor = 'border-slate-600';
              iconColor = 'text-slate-500';
              bgLight = 'bg-slate-700/30';
            }

            return (
              <div 
                key={alert.id} 
                className={`bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col sm:flex-row transition-all
                  ${isResolved ? 'opacity-60 grayscale-[0.5]' : ''} 
                  hover:shadow-md border-l-4 ${borderColor}`}
              >
                {/* Alert Info Section */}
                <div className="flex-1 p-5 md:p-6 flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgLight} ${iconColor}`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                        ${isResolved ? 'bg-slate-700 text-slate-400' : bgLight + ' ' + iconColor}`}>
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      {isResolved && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">Resolved</span>}
                      
                      <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto sm:ml-0 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {timeAgo(alert.created_at)}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-1 pr-4">
                      {alert.product ? (
                        <Link to={`/dashboard/product/${alert.product_id}`} className="hover:text-orange-400 transition-colors">
                          {alert.product.name}
                        </Link>
                      ) : (
                        <span className="font-mono text-sm">{alert.product_id}</span>
                      )}
                    </h4>
                    
                    <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                      {alert.message}
                    </p>
                  </div>
                </div>

                {/* Actions Section */}
                {!isResolved && (
                  <div className="p-5 md:p-6 bg-slate-900/30 border-t sm:border-t-0 sm:border-l border-slate-700 flex items-center justify-end sm:justify-center sm:min-w-[160px]">
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" /> Resolve
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
