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
      const res = await fetch(`http://localhost:5000/api/products/${traceId.trim()}`);
      if (!res.ok) throw new Error('Product not found. Please check the Trace ID.');
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = { active: 'bg-green-500/20 text-green-400 border-green-500/30', recalled: 'bg-red-500/20 text-red-400 border-red-500/30', expired: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${map[status] || map.active}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-orange-500/20">
          <Search className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Global Product Search</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Look up any product on the TraceChain network using its unique Trace ID to verify its authenticity and journey.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-orange-500 p-2 shadow-lg transition-colors">
          <div className="pl-4 flex items-center justify-center">
            <Search className="w-6 h-6 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Enter Trace ID (e.g. TC-2026-FOOD-001)"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-white font-mono text-lg px-4 py-4 outline-none placeholder-slate-600 uppercase"
          />
          <button 
            type="submit" 
            disabled={loading || !traceId}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 rounded-xl font-bold transition-colors flex items-center justify-center min-w-[120px] shadow-lg shadow-orange-500/20"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {product && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
            {/* Top color bar */}
            <div className={`h-2 w-full ${product.trust_score > 80 ? 'bg-green-500' : product.trust_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center shrink-0 border border-slate-600">
                    <Package className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {product.name}
                      {getStatusBadge(product.status)}
                    </h3>
                    {product.brand && <p className="text-slate-400 mt-1">by <span className="font-medium text-slate-300">{product.brand}</span></p>}
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xl
                    ${product.trust_score > 80 ? 'border-green-500 text-green-500' : product.trust_score > 50 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}>
                    {product.trust_score}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-wider">Trust Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700 mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Origin</span>
                    <span className="text-sm font-medium text-white">{product.origin}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold block mb-0.5">Expiry</span>
                    <span className="text-sm font-medium text-white">{product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to={`/dashboard/product/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3.5 rounded-xl font-medium transition-colors"
                >
                  <Activity className="w-5 h-5" /> View Full Journey
                </Link>
                <button 
                  onClick={() => {
                    // Navigate to scan page and set ID in search bar. We don't have query param support yet, but let's just go there.
                    navigate('/dashboard/scan');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-orange-500/20"
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
