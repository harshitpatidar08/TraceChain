import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { Package, AlertTriangle, BarChart3, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Overview = () => {
  const [stats, setStats] = useState({ productsCount: 0, eventsToday: 0, activeAlerts: 0, avgTrust: 0 });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Products stats & Recent products
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (prods) {
        const avgTrust = prods.reduce((acc, p) => acc + (p.trust_score || 0), 0) / (prods.length || 1);
        setStats(s => ({ ...s, productsCount: prods.length, avgTrust: Math.round(avgTrust) }));
        setRecentProducts(prods.slice(0, 10));
      }

      // Alerts
      const { data: acts } = await supabase.from('alerts').select('*, product:products(name)').eq('resolved', false).order('created_at', { ascending: false });
      if (acts) {
        setStats(s => ({ ...s, activeAlerts: acts.length }));
        setRecentAlerts(acts.slice(0, 5));
      }

      // Events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: allEvts } = await supabase.from('supply_chain_events').select('*');
      if (allEvts) {
        const todayEvts = allEvts.filter(e => new Date(e.created_at) >= today);
        setStats(s => ({ ...s, eventsToday: todayEvts.length }));

        // Chart data
        const counts = allEvts.reduce((acc, curr) => {
          acc[curr.stage] = (acc[curr.stage] || 0) + 1;
          return acc;
        }, {});
        const stageData = Object.keys(counts).map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), count: counts[k] }));
        setChartData(stageData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load overview data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveAlert = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`http://localhost:5000/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        toast.success("Alert resolved!");
        fetchData();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to resolve');
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
        <p className="text-slate-400 text-sm mt-1">High-level view of the entire TraceChain network.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Package className="w-16 h-16 text-emerald-500" /></div>
          <h3 className="text-slate-400 font-medium mb-1 relative text-sm uppercase tracking-wider">Total Products</h3>
          <p className="text-4xl font-black text-white relative">{stats.productsCount}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Activity className="w-16 h-16 text-blue-500" /></div>
          <h3 className="text-slate-400 font-medium mb-1 relative text-sm uppercase tracking-wider">Events Today</h3>
          <p className="text-4xl font-black text-white relative">{stats.eventsToday}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><AlertTriangle className="w-16 h-16 text-red-500" /></div>
          <h3 className="text-slate-400 font-medium mb-1 relative text-sm uppercase tracking-wider">Active Alerts</h3>
          <p className="text-4xl font-black text-red-400 relative">{stats.activeAlerts}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><BarChart3 className="w-16 h-16 text-orange-500" /></div>
          <h3 className="text-slate-400 font-medium mb-1 relative text-sm uppercase tracking-wider">Avg Trust Score</h3>
          <p className="text-4xl font-black text-orange-400 relative">{stats.avgTrust}<span className="text-lg text-slate-500 ml-1">/100</span></p>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
            <h3 className="font-bold text-white flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Recent Alerts</h3>
            <Link to="/dashboard/admin/alerts" className="text-sm font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 p-5 overflow-auto">
            {recentAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <CheckCircle className="w-10 h-10 text-green-500/50 mb-2" />
                <p>No active alerts. All clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map(alert => {
                  const colors = {
                    high: 'border-red-500 bg-red-500/5',
                    medium: 'border-orange-500 bg-orange-500/5',
                    low: 'border-blue-500 bg-blue-500/5'
                  };
                  return (
                    <div key={alert.id} className={`p-4 rounded-lg border-l-4 border-r border-t border-b border-r-slate-700 border-t-slate-700 border-b-slate-700 flex justify-between items-center gap-4 ${colors[alert.severity] || colors.low}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded
                            ${alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : alert.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {alert.severity}
                          </span>
                          <span className="font-medium text-white truncate">{alert.product?.name || 'Unknown Product'}</span>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{alert.message}</p>
                      </div>
                      <button onClick={() => handleResolveAlert(alert.id)} className="shrink-0 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors">
                        Resolve
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-700 bg-slate-900/30">
            <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-500" /> Events per Stage</h3>
          </div>
          <div className="flex-1 p-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-emerald-500" /> Recent Products</h3>
          <Link to="/dashboard/admin/products" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Trust Score</th>
                <th className="px-5 py-3">Expiry</th>
                <th className="px-5 py-3">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-5 py-4">
                    <Link to={`/dashboard/product/${p.id}`} className="font-bold text-white hover:text-orange-400 transition-colors block">{p.name}</Link>
                    <span className="text-xs text-slate-500 font-mono">{p.id.substring(0, 16)}...</span>
                  </td>
                  <td className="px-5 py-4 capitalize font-medium">{p.current_stage}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${p.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : p.status === 'recalled' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs
                      ${p.trust_score > 80 ? 'bg-green-500/20 text-green-400' : p.trust_score > 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.trust_score}
                    </div>
                  </td>
                  <td className="px-5 py-4">{p.exp_date ? new Date(p.exp_date).toLocaleDateString() : '-'}</td>
                  <td className="px-5 py-4 text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
