import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, Package, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Farmer = () => {
  const { user, role, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('registered_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusBadge = (status) => {
    const map = { active: 'bg-green-500/20 text-green-400', recalled: 'bg-red-500/20 text-red-400', expired: 'bg-yellow-500/20 text-yellow-400' };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${map[status] || map.active}`}>{status}</span>;
  };

  const getExpiryInfo = (expDate) => {
    if (!expDate) return { label: 'No expiry', color: 'gray' };
    const today = new Date();
    const expiry = new Date(expDate);
    const diffMs = expiry - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { 
      label: `Expired ${Math.abs(diffDays)} days ago`, 
      color: 'red' 
    };
    if (diffDays <= 3) return { 
      label: `Expiring in ${diffDays} days`, 
      color: 'orange' 
    };
    return { 
      label: `Expires in ${diffDays} days`, 
      color: 'green' 
    };
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-orange-500"><Package className="w-6 h-6" /> TraceChain</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard/farmer" className="block px-4 py-3 bg-orange-500/10 text-orange-500 rounded-lg font-medium">My Products</Link>
          <Link to="/register" className="block px-4 py-3 text-slate-300 hover:bg-slate-700/50 rounded-lg font-medium">Register Product</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 border-b border-slate-700 px-8 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Farmer Dashboard</h1>
            <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-mono text-slate-300 uppercase">{role}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-300">{user?.email}</span>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">My Products</h2>
            <Link to="/register" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Register New
            </Link>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-orange-500" /></div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No products registered yet.</div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Trace ID</th>
                    <th className="px-6 py-4">Current Stage</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Trust Score</th>
                    <th className="px-6 py-4">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {products.map(product => (
                    <tr 
                      key={product.id} 
                      onClick={() => navigate(`/trace/${product.id}`)}
                      className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">{product.name} <span className="text-slate-500 text-xs ml-2">{product.weight}</span></td>
                      <td className="px-6 py-4 font-mono text-orange-400">{product.id}</td>
                      <td className="px-6 py-4 capitalize">{product.current_stage}</td>
                      <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono">{product.trust_score}</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-24">
                            <div 
                              className={`h-full ${product.trust_score > 80 ? 'bg-green-500' : product.trust_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                              style={{ width: `${product.trust_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const info = getExpiryInfo(product.exp_date);
                          return <span className={`text-${info.color}-400 font-medium`}>{new Date(product.exp_date).toLocaleDateString()}</span>;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Farmer;