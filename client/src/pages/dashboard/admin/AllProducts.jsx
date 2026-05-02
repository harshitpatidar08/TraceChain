import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
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
      const res = await fetch(`http://localhost:5000/api/products/${id}/status`, {
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-orange-500 w-6 h-6" /> All Products
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage global product registry and status.</p>
        </div>
      </div>

      {/* Top Bar: Search & Filters */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, brand, or Trace ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg py-2.5 pl-10 pr-4 outline-none text-white transition-colors"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 outline-none text-white min-w-[130px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="recalled">Recalled</option>
            <option value="expired">Expired</option>
          </select>

          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 outline-none text-white min-w-[130px] capitalize"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.stage}
            onChange={(e) => setFilters({...filters, stage: e.target.value})}
            className="bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 outline-none text-white min-w-[130px] capitalize"
          >
            <option value="all">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 font-semibold uppercase text-xs tracking-wider border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white mb-0.5">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.brand ? `by ${p.brand}` : 'No brand'} | <span className="font-mono text-orange-400/80">{p.id.substring(0, 14)}...</span></div>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium">{p.current_stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${p.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : p.status === 'recalled' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{p.trust_score}</span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${p.trust_score > 80 ? 'bg-green-500' : p.trust_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${p.trust_score}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.exp_date ? new Date(p.exp_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/dashboard/product/${p.id}`}
                        className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {p.status === 'active' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(p.id, 'expired')}
                            disabled={updatingId === p.id}
                            className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {updatingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Expire'}
                          </button>
                          
                          <button 
                            onClick={() => handleStatusChange(p.id, 'recalled')}
                            disabled={updatingId === p.id}
                            className="inline-flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 gap-1"
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
