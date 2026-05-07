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
    const map = { active: 'bg-green-100 text-green-700', recalled: 'bg-red-100 text-red-700', expired: 'bg-amber-100 text-amber-700' };
    return <span className={`px-2 py-1 rounded border border-slate-100 text-[10px] font-bold uppercase ${map[status] || map.active}`}>{status}</span>;
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">My Products</h2>
          <p className="text-gray-500 text-sm mt-1">Manage and track your registered batches.</p>
        </div>
        <Link to="/dashboard/farmer/register" className="bg-orange-500 hover:bg-orange-600 transition-all px-5 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg shadow-orange-500/10 active:scale-95">
          <Plus className="w-5 h-5" /> Register New
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products registered yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Start tracing your products by registering your first batch onto the blockchain.</p>
          <Link to="/dashboard/farmer/register" className="inline-flex bg-orange-500 hover:bg-orange-600 transition-all px-6 py-3 rounded-xl font-bold text-white items-center gap-2 shadow-md">
            <Plus className="w-5 h-5" /> Register First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(product => {
            const expInfo = getExpiryInfo(product.exp_date);
            return (
              <div key={product.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Top: Name & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-xs font-mono text-orange-500 mt-1 font-bold">{product.id}</p>
                  </div>
                  {getStatusBadge(product.status)}
                </div>

                {/* Middle: Category & Trust Score */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-orange-100">
                    <Package className="w-3.5 h-3.5" /> {product.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Trust Score</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-sm border
                      ${product.trust_score > 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                        product.trust_score > 50 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-red-50 text-red-700 border-red-100'}`}>
                      {product.trust_score}
                    </span>
                  </div>
                </div>

                {/* Info Row: Origin & Expiry */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Origin
                    </span>
                    <span className="text-sm text-gray-700 font-medium truncate" title={product.origin}>{product.origin}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Expiry
                    </span>
                    <span className={`text-sm font-bold text-${expInfo.color === 'orange' ? 'orange' : expInfo.color === 'green' ? 'green' : 'red'}-600`}>
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
                  <button onClick={() => navigate(`/dashboard/product/${product.id}`)} className="flex-1 bg-orange-500 hover:bg-orange-600 transition-all text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95">
                    <Activity className="w-4 h-4" /> View Journey
                  </button>
                  <button onClick={() => downloadQR(product.id)} className="bg-white border border-slate-200 hover:bg-gray-50 transition-colors text-gray-600 px-4 py-2.5 rounded-xl flex items-center justify-center shadow-sm">
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
