import { API_BASE_URL } from '../../config.js';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { LayoutDashboard, Package, AlertTriangle, BarChart3, LogOut, CheckCircle, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const Admin = () => {
  const { user, role, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ productsCount: 0, eventsToday: 0, activeAlerts: 0, avgTrust: 0 });
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({ stageData: [], lineData: [], pieData: [] });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'overview' || activeTab === 'analytics') {
        // Fetch products
        const { data: prods } = await supabase.from('products').select('*');
        if (prods) {
          const avgTrust = prods.reduce((acc, p) => acc + (p.trust_score || 0), 0) / (prods.length || 1);
          setStats(s => ({ ...s, productsCount: prods.length, avgTrust: Math.round(avgTrust) }));
          
          // Analytics calculations
          const foodCount = prods.filter(p => p.category === 'food').length;
          const retailCount = prods.filter(p => p.category === 'retail').length;
          setAnalytics(a => ({ 
            ...a, 
            pieData: [
              { name: 'Food', value: foodCount, color: '#10b981' }, 
              { name: 'Retail', value: retailCount, color: '#3b82f6' }
            ] 
          }));
        }

        // Fetch alerts
        const { data: actAlerts } = await supabase.from('alerts').select('*').eq('resolved', false);
        if (actAlerts) {
          setStats(s => ({ ...s, activeAlerts: actAlerts.length }));
        }

        // Fetch events today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: evts } = await supabase.from('supply_chain_events').select('*').gte('created_at', today.toISOString());
        if (evts) {
          setStats(s => ({ ...s, eventsToday: evts.length }));
        }

        if (activeTab === 'analytics') {
          // Compute stage data
          const { data: allEvts } = await supabase.from('supply_chain_events').select('stage');
          if (allEvts) {
            const counts = allEvts.reduce((acc, curr) => {
              acc[curr.stage] = (acc[curr.stage] || 0) + 1;
              return acc;
            }, {});
            const stageData = Object.keys(counts).map(k => ({ name: k, count: counts[k] }));
            setAnalytics(a => ({ ...a, stageData }));
          }
        }
      }

      if (activeTab === 'alerts') {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${API_BASE_URL}/api/alerts`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        setAlerts(data);
      }

      if (activeTab === 'products') {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        toast.success("Alert resolved!");
        fetchData();
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Product marked as ${status}`);
        fetchData();
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const navTabs = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' }
  ];

  const statCards = [
    { label: 'Total Products', value: stats.productsCount, icon: Package, color: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { label: 'Events Today', value: stats.eventsToday, icon: BarChart3, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Active Alerts', value: stats.activeAlerts, icon: AlertTriangle, color: 'red', bg: 'bg-red-100', text: 'text-red-600' },
    { label: 'Avg Trust Score', value: `${stats.avgTrust}/100`, icon: LayoutDashboard, color: 'orange', bg: 'bg-orange-100', text: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Background Glows */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Admin Header */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[36px] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-52 h-52 bg-red-100 rounded-full blur-3xl opacity-20" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-red-600" />
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-widest">System Admin</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage products, resolve alerts, and monitor analytics.</p>
            </div>
            <button onClick={logout} className="self-start sm:self-center p-3 bg-[#F8FAFC] border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all duration-300">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3">
          {navTabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {statCards.map((card, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-28 h-28 ${card.bg} rounded-full blur-2xl opacity-30`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.text}`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-black text-slate-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Unresolved Incident Alerts</h2>
                <p className="text-slate-500 text-sm">{alerts.length} active alerts require attention</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Product', 'Issue Type', 'Severity', 'Details', 'Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {alerts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{a.product?.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">{a.alert_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${a.severity==='high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{a.message}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleResolveAlert(a.id)} className="bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ml-auto">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">All Products</h2>
                  <p className="text-slate-500 text-sm">{products.length} products in network</p>
                </div>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search products..." className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl py-2.5 pl-9 pr-4 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 outline-none transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Product Name', 'Stage', 'Status', 'Trust Score', 'Admin Actions'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs font-mono text-emerald-600">{p.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold capitalize">{p.current_stage}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${p.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{p.trust_score}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                            <div className={`h-full ${p.trust_score > 80 ? 'bg-emerald-500' : p.trust_score > 50 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${p.trust_score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {p.status === 'active' && (
                          <>
                            <button onClick={() => handleStatusChange(p.id, 'recalled')} className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 hover:border-red-500 transition-all duration-300">Recall</button>
                            <button onClick={() => handleStatusChange(p.id, 'expired')} className="bg-slate-100 hover:bg-slate-700 text-slate-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300">Expire</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Events by Stage</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.stageData}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 24px rgba(15,23,42,0.08)'}} />
                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Product Categories Split</h3>
              <div className="h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                      {analytics.pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 24px rgba(15,23,42,0.08)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dummy icon for admin header
const ShieldCheckIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;

export default Admin;