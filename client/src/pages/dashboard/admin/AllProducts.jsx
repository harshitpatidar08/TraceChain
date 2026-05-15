import { API_BASE_URL } from '../../../config.js';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../config/supabase';
import { Search, Package, AlertTriangle, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: 'all', stage: 'all' });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProducts();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'recalled') {
      const confirm = window.confirm("WARNING: Are you sure you want to RECALL this product? This action will mark it as unsafe across the network.");
      if (!confirm) return;
    } else {
      const confirm = window.confirm(`Mark this product as ${newStatus}?`);
      if (!confirm) return;
    }

    setUpdatingId(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success(`Product marked as ${newStatus}`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    }
    setUpdatingId(null);
  };

  // Unique values for filters
  const stages = [...new Set(products.map(p => p.current_stage))].filter(Boolean);
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === 'all' || p.status === filters.status;
    const matchesCategory = filters.category === 'all' || p.category === filters.category;
    const matchesStage = filters.stage === 'all' || p.current_stage === filters.stage;
    return matchesSearch && matchesStatus && matchesCategory && matchesStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 font-poppins">
            <Package className="text-emerald-500 w-6 h-6" /> All Products
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Manage global product registry and status.</p>
        </div>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, brand, or Trace ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl py-3 pl-11 pr-4 outline-none text-slate-900 transition-all placeholder:text-slate-300 font-medium"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="bg-gray-50 border border-slate-100 rounded-xl py-3 px-4 outline-none text-gray-700 min-w-[130px] font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="recalled">Recalled</option>
            <option value="expired">Expired</option>
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="bg-gray-50 border border-slate-100 rounded-xl py-3 px-4 outline-none text-gray-700 min-w-[130px] capitalize font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.stage}
            onChange={(e) => setFilters({...filters, stage: e.target.value})}
            className="bg-gray-50 border border-slate-100 rounded-xl py-3 px-4 outline-none text-gray-700 min-w-[130px] capitalize font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-all"
          >
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="w-full">
            <div className="bg-gray-50/50 border-b border-slate-100 h-12 w-full flex items-center px-6 gap-4">
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-50 flex items-center gap-4 animate-pulse">
                <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="h-3 bg-slate-100 rounded w-1/2"></div></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
                <div className="h-5 bg-slate-100 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <p className="font-bold text-gray-900 mb-1">No products found</p>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900 mb-0.5">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        {p.brand ? `by ${p.brand}` : 'No brand'} | <span className="font-mono text-emerald-600 font-bold">TC-{p.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize font-bold text-xs text-gray-600">{p.current_stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                        ${p.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : p.status === 'recalled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-xs min-w-[24px] ${p.trust_score > 80 ? 'text-green-600' : p.trust_score > 50 ? 'text-orange-600' : 'text-red-600'}`}>{p.trust_score}</span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${p.trust_score > 80 ? 'bg-green-500' : p.trust_score > 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{width: `${p.trust_score}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-xs text-gray-700">{p.exp_date ? new Date(p.exp_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/dashboard/product/${p.id}`}
                        className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-gray-50 text-gray-700 p-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {p.status === 'active' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(p.id, 'expired')}
                            disabled={updatingId === p.id}
                            className="inline-flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                          >
                            {updatingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Expire'}
                          </button>
                          
                          <button 
                            onClick={() => handleStatusChange(p.id, 'recalled')}
                            disabled={updatingId === p.id}
                            className="inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 gap-1.5 active:scale-95 shadow-sm"
                          >
                            {updatingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><AlertTriangle className="w-3.5 h-3.5" /> Recall</>}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
