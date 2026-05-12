import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, Package, RefreshCw, Leaf, ArrowRight } from 'lucide-react';
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
    const map = { 
      active: 'bg-emerald-100 text-emerald-700', 
      recalled: 'bg-red-100 text-red-700', 
      expired: 'bg-orange-100 text-orange-700' 
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${map[status] || map.active}`}>{status}</span>;
  };

  const getExpiryInfo = (prod) => {
    const expDate = prod?.exp_date;
    if (!expDate) return { label: 'No expiry', color: 'gray' };
    const [year, month, day] = expDate.split('T')[0].split('-');
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const keywords = ['milk', 'dairy', 'meat', 'fish', 'seafood', 'frozen', 'ice cream', 'yogurt', 'cheese', 'medicine', 'vaccine'];
    const nameDesc = `${prod.name || ''} ${prod.description || ''}`.toLowerCase();
    const isSensitive = keywords.some(kw => nameDesc.includes(kw));

    if (isSensitive) {
      if (diffDays < 0) return { label: `Expired ${Math.abs(diffDays)} days ago`, color: 'red' };
      if (diffDays <= 3) return { label: `Expiring soon`, color: 'red' };
      return { label: `Expires in ${diffDays} days`, color: 'green' };
    } else {
      if (diffDays < 0) return { label: `Expired`, color: 'gray' };
      if (diffDays <= 3) return { label: `Expiring soon`, color: 'orange' };
      if (diffDays <= 30) return { label: `Expires in ${diffDays} days`, color: 'slate' };
      return { label: `Expires in ${diffDays} days`, color: 'green' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Background Glows */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Farmer Header */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[36px] p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-100 rounded-full blur-3xl opacity-30" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">Farmer</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">My Products</h1>
              <p className="text-slate-500 mt-1">Manage and track all your registered products on the blockchain.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard/farmer/register" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Register New
              </Link>
              <button onClick={logout} className="p-3 bg-[#F8FAFC] border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-2xl transition-all duration-300">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
              <p className="text-slate-400 font-medium">Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-emerald-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products yet</h3>
              <p className="text-slate-500 mb-6">Register your first product to start tracking it on the blockchain.</p>
              <Link 
                to="/dashboard/farmer/register" 
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
              >
                Register First Product <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Name', 'Trace ID', 'Current Stage', 'Status', 'Trust Score', 'Expiry'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(product => (
                    <tr 
                      key={product.id} 
                      onClick={() => navigate(`/trace/${product.id}`)}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                        {product.weight && <div className="text-slate-400 text-xs mt-0.5">{product.weight}</div>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-600">{product.id}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold capitalize">{product.current_stage}</span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{product.trust_score}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
                            <div 
                              className={`h-full ${product.trust_score > 80 ? 'bg-emerald-500' : product.trust_score > 50 ? 'bg-orange-400' : 'bg-red-500'}`} 
                              style={{ width: `${product.trust_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const info = getExpiryInfo(product);
                          const colorMap = { green: 'text-emerald-600', red: 'text-red-600', orange: 'text-orange-600', gray: 'text-slate-400', slate: 'text-slate-500' };
                          return <span className={`font-medium ${colorMap[info.color] || 'text-slate-500'}`}>{new Date(product.exp_date).toLocaleDateString()}</span>;
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Farmer;