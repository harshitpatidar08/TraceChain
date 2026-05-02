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
        const res = await fetch('http://localhost:5000/api/alerts', {
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
      const res = await fetch(`http://localhost:5000/api/alerts/${id}/resolve`, {
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
      const res = await fetch(`http://localhost:5000/api/products/${id}/status`, {
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

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500"><ShieldCheckIcon /> TraceChain</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-orange-500/10 text-orange-500' : 'text-slate-300 hover:bg-slate-700/50'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 border-b border-slate-700 px-8 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-mono uppercase">System Admin</span>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
             <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <main className="p-8 flex-1 overflow-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-slate-800 border border-emerald-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Package className="w-16 h-16 text-emerald-500" /></div>
                <h3 className="text-emerald-400 font-medium mb-2 relative">Total Products</h3>
                <p className="text-4xl font-bold text-white relative">{stats.productsCount}</p>
              </div>
              <div className="bg-slate-800 border border-blue-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-16 h-16 text-blue-500" /></div>
                <h3 className="text-blue-400 font-medium mb-2 relative">Events Today</h3>
                <p className="text-4xl font-bold text-white relative">{stats.eventsToday}</p>
              </div>
              <div className="bg-slate-800 border border-red-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-red-500" /></div>
                <h3 className="text-red-400 font-medium mb-2 relative">Active Alerts</h3>
                <p className="text-4xl font-bold text-white relative">{stats.activeAlerts}</p>
              </div>
              <div className="bg-slate-800 border border-orange-500/30 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><LayoutDashboard className="w-16 h-16 text-orange-500" /></div>
                <h3 className="text-orange-400 font-medium mb-2 relative">Avg Trust Score</h3>
                <p className="text-4xl font-bold text-white relative">{stats.avgTrust}/100</p>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-700 font-bold text-lg flex items-center justify-between">
                <span>Unresolved Incident Alerts</span>
              </div>
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Issue Type</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {alerts.map(a => (
                    <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{a.product?.name}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-700 rounded text-xs uppercase">{a.alert_type}</span></td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${a.severity==='high'?'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{a.message}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleResolveAlert(a.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 inline-flex">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Search products..." className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-orange-500 outline-none" />
                </div>
              </div>
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Trust Score</th>
                    <th className="px-6 py-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs font-mono text-orange-400/80">{p.id}</div>
                      </td>
                      <td className="px-6 py-4 capitalize">{p.current_stage}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${p.status==='active'?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-white">{p.trust_score}/100</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {p.status === 'active' && (
                          <>
                            <button onClick={()=>handleStatusChange(p.id, 'recalled')} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium border border-red-500/20 transition-colors">Recall</button>
                            <button onClick={()=>handleStatusChange(p.id, 'expired')} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">Expire</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold mb-6">Events by Stage</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.stageData}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} />
                      <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                      <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold mb-6">Product Categories Split</h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {analytics.pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Dummy icon for admin header
const ShieldCheckIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;

export default Admin;