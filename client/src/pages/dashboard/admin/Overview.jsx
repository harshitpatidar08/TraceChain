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
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent shadow-lg shadow-orange-500/20"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">Platform Overview</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">High-level view of the entire TraceChain network.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Package className="w-16 h-16 text-emerald-600" /></div>
          <h3 className="text-gray-400 font-bold mb-1 relative text-[10px] uppercase tracking-widest">Total Products</h3>
          <p className="text-4xl font-black text-gray-900 relative">{stats.productsCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity className="w-16 h-16 text-blue-600" /></div>
          <h3 className="text-gray-400 font-bold mb-1 relative text-[10px] uppercase tracking-widest">Events Today</h3>
          <p className="text-4xl font-black text-gray-900 relative">{stats.eventsToday}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle className="w-16 h-16 text-red-600" /></div>
          <h3 className="text-gray-400 font-bold mb-1 relative text-[10px] uppercase tracking-widest">Active Alerts</h3>
          <p className="text-4xl font-black text-red-600 relative">{stats.activeAlerts}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 className="w-16 h-16 text-orange-600" /></div>
          <h3 className="text-gray-400 font-bold mb-1 relative text-[10px] uppercase tracking-widest">Avg Trust Score</h3>
          <p className="text-4xl font-black text-orange-600 relative">{stats.avgTrust}<span className="text-lg text-gray-400 ml-1 font-bold">/100</span></p>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider text-xs font-poppins"><AlertTriangle className="w-4 h-4 text-red-600" /> Recent Alerts</h3>
            <Link to="/dashboard/admin/alerts" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-all uppercase tracking-widest">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 p-5 overflow-auto min-h-[300px]">
            {recentAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-bold text-sm text-gray-600">No active alerts. All clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map(alert => {
                  const colors = {
                    high: 'border-red-200 bg-red-50/30',
                    medium: 'border-orange-200 bg-orange-50/30',
                    low: 'border-blue-200 bg-blue-50/30'
                  };
                  return (
                    <div key={alert.id} className={`p-4 rounded-xl border flex justify-between items-center gap-4 transition-all hover:shadow-md ${colors[alert.severity] || colors.low}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border
                            ${alert.severity === 'high' ? 'bg-red-100 text-red-700 border-red-200' : alert.severity === 'medium' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                            {alert.severity}
                          </span>
                          <span className="font-bold text-gray-900 truncate text-sm">{alert.product?.name || 'Unknown Product'}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate font-medium">{alert.message}</p>
                      </div>
                      <button onClick={() => handleResolveAlert(alert.id)} className="shrink-0 bg-white hover:bg-gray-50 border border-slate-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95">
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gray-50/50">
            <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider text-xs font-poppins"><BarChart3 className="w-4 h-4 text-orange-600" /> Events per Stage</h3>
          </div>
          <div className="flex-1 p-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#111827', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f8fafc', opacity: 1 }} />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider text-xs font-poppins"><Package className="w-4 h-4 text-emerald-600" /> Recent Products</h3>
          <Link to="/dashboard/admin/products" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Trust Score</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/dashboard/product/${p.id}`} className="font-black text-gray-900 hover:text-orange-500 transition-colors block text-sm">{p.name}</Link>
                    <span className="text-[10px] text-gray-400 font-mono font-bold tracking-tight">{p.id.substring(0, 16)}...</span>
                  </td>
                  <td className="px-6 py-4 capitalize font-bold text-gray-600 text-xs">{p.current_stage}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                      ${p.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : p.status === 'recalled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-[10px] border-2
                      ${p.trust_score > 80 ? 'border-green-500 text-green-600 bg-green-50' : p.trust_score > 50 ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-red-500 text-red-600 bg-red-50'}`}>
                      {p.trust_score}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700 text-xs">{p.exp_date ? new Date(p.exp_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-gray-400 font-medium text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
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
