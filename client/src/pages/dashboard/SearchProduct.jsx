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
    const map = { active: 'bg-green-100 text-green-700 border-green-100', recalled: 'bg-red-100 text-red-700 border-red-100', expired: 'bg-amber-100 text-amber-700 border-amber-100' };
    return <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${map[status] || map.active}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pt-4">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-orange-100 shadow-sm shadow-orange-500/5">
          <Search className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 font-poppins">Global Product Search</h2>
        <p className="text-gray-500 max-w-lg mx-auto">Look up any product on the TraceChain network using its unique Trace ID to verify its authenticity and journey.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
        <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex bg-white rounded-2xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/5 p-2 shadow-xl transition-all">
          <div className="pl-4 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Enter Trace ID (e.g. TC-2026-FOOD-001)"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 font-mono font-bold text-lg px-4 py-4 outline-none placeholder-gray-300 uppercase tracking-wider"
          />
          <button 
            type="submit" 
            disabled={loading || !traceId}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-8 rounded-xl font-bold transition-all flex items-center justify-center min-w-[120px] shadow-lg shadow-orange-500/10 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {product && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative">
            {/* Top color bar */}
            <div className={`h-2 w-full ${product.trust_score > 80 ? 'bg-green-500' : product.trust_score > 50 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                    <Package className="w-7 h-7 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      {product.name}
                      {getStatusBadge(product.status)}
                    </h3>
                    {product.brand && <p className="text-gray-500 mt-1 font-medium">by <span className="font-bold text-orange-600">{product.brand}</span></p>}
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center font-black text-xl
                    ${product.trust_score > 80 ? 'border-green-500 text-green-600 bg-green-50' : product.trust_score > 50 ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-red-500 text-red-600 bg-red-50'}`}>
                    {product.trust_score}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 mt-1.5 tracking-widest">Trust Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-5 bg-gray-50 rounded-2xl border border-slate-100 mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5 tracking-wider">Origin</span>
                    <span className="text-sm font-bold text-gray-900">{product.origin}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-0.5 tracking-wider">Expiry</span>
                    <span className="text-sm font-bold text-gray-900">{product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to={`/dashboard/product/${product.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold transition-all shadow-sm"
                >
                  <Activity className="w-5 h-5" /> View Full Journey
                </Link>
                <button 
                  onClick={() => {
                    navigate('/dashboard/scan');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/10 active:scale-95"
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
