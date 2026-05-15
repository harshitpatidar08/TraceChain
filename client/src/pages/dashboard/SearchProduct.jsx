import { API_BASE_URL } from '..\..\config.js';
import React, { useState } from 'react';
import { Search, Loader2, Package, MapPin, Calendar, Activity, ScanLine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SearchProduct = () => {
  const [traceId, setTraceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!traceId.trim()) return;
    
    setLoading(true);
    setProduct(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${traceId.trim()}`);
      if (!res.ok) throw new Error('Product not found. Please check the Trace ID.');
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = { 
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
      recalled: 'bg-red-100 text-red-700 border-red-200', 
      expired: 'bg-orange-100 text-orange-700 border-orange-200' 
    };
    return <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${map[status] || map.active}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">

      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
          <Search className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Global Product Search</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Look up any product on the TraceChain network using its unique Trace ID to verify its authenticity and journey.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex bg-white rounded-2xl border border-slate-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 p-2 shadow-sm transition-all">
          <div className="pl-4 flex items-center justify-center">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Enter Trace ID (e.g. TC-2026-FOOD-001)"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-mono font-bold text-base px-4 py-3.5 outline-none placeholder:text-slate-300 uppercase tracking-wider"
          />
          <button 
            type="submit" 
            disabled={loading || !traceId}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-8 rounded-xl font-semibold transition-all flex items-center justify-center min-w-[110px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {product && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Top color bar */}
            <div className={`h-1.5 w-full ${product.trust_score > 80 ? 'bg-emerald-500' : product.trust_score > 50 ? 'bg-orange-400' : 'bg-red-500'}`}></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <Package className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 flex-wrap">
                      {product.name}
                      {getStatusBadge(product.status)}
                    </h3>
                    {product.brand && <p className="text-slate-500 mt-1 font-medium text-sm">by <span className="font-bold text-slate-700">{product.brand}</span></p>}
                  </div>
                </div>
                
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center font-black text-xl
                    ${product.trust_score > 80 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : product.trust_score > 50 ? 'border-orange-400 text-orange-700 bg-orange-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                    {product.trust_score}
                  </div>
                  <span className="text-[10px] uppercase font-black text-slate-400 mt-1.5 tracking-widest">Trust Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block mb-0.5 tracking-wider">Origin</span>
                    <span className="text-sm font-bold text-slate-900">{product.origin}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block mb-0.5 tracking-wider">Expiry</span>
                    <span className="text-sm font-bold text-slate-900">{product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to={`/dashboard/product/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-semibold transition-all"
                >
                  <Activity className="w-5 h-5" /> View Full Journey
                </Link>
                <button 
                  onClick={() => { navigate('/dashboard/scan'); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-semibold transition-all shadow-sm"
                >
                  <ScanLine className="w-5 h-5" /> Log Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
