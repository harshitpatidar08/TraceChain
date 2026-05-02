import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../config/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Download, MapPin, Calendar, Activity, ExternalLink, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const MyProducts = () => {
  const { user } = useAuth();
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
    return <span className={`px-2 py-1 rounded border border-slate-700/50 text-xs font-bold uppercase ${map[status] || map.active}`}>{status}</span>;
  };

  const getExpiryInfo = (expDate) => {
    if (!expDate) return { label: 'No expiry', color: 'slate' };
    const today = new Date();
    const expiry = new Date(expDate);
    const diffMs = expiry - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: `Expired`, color: 'red' };
    if (diffDays <= 7) return { label: `Expiring soon`, color: 'orange' };
    return { label: `Valid`, color: 'green' };
  };

  const downloadQR = (id) => {
    const canvas = document.getElementById(`qr-${id}`);
    const svg = canvas.outerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR_${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-white">My Products</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and track your registered batches.</p>
        </div>
        <Link to="/dashboard/farmer/register" className="bg-orange-500 hover:bg-orange-600 transition-colors px-5 py-2.5 rounded-lg font-medium text-white flex items-center gap-2 shadow-lg shadow-orange-500/20">
          <Plus className="w-5 h-5" /> Register New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No products registered yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">Start tracing your products by registering your first batch onto the blockchain.</p>
          <Link to="/dashboard/farmer/register" className="inline-flex bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-3 rounded-lg font-medium text-white items-center gap-2">
            <Plus className="w-5 h-5" /> Register First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(product => {
            const expInfo = getExpiryInfo(product.exp_date);
            return (
              <div key={product.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                {/* Top: Name & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{product.name}</h3>
                    <p className="text-sm font-mono text-orange-400 mt-1">{product.id}</p>
                  </div>
                  {getStatusBadge(product.status)}
                </div>

                {/* Middle: Category & Trust Score */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium capitalize flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" /> {product.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trust Score</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-sm
                      ${product.trust_score > 80 ? 'bg-green-500/20 text-green-400' : 
                        product.trust_score > 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'}`}>
                      {product.trust_score}
                    </span>
                  </div>
                </div>

                {/* Info Row: Origin & Expiry */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Origin
                    </span>
                    <span className="text-sm text-slate-300 truncate" title={product.origin}>{product.origin}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 uppercase font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Expiry
                    </span>
                    <span className={`text-sm font-medium text-${expInfo.color}-400`}>
                      {product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Hidden QR SVG for downloading */}
                <div className="hidden">
                  <QRCodeSVG id={`qr-${product.id}`} value={`https://tracechain.app/trace/${product.id}`} size={256} />
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => navigate(`/dashboard/product/${product.id}`)} className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" /> View Journey
                  </button>
                  <button onClick={() => downloadQR(product.id)} className="bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 px-4 py-2 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
