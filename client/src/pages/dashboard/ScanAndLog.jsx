import { API_BASE_URL } from '../../config.js';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { Search, Loader2, Package, MapPin, CheckCircle, ScanLine, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../context/NotificationContext';
import QRScanner from '../../components/QRScanner';

const ScanAndLog = () => {
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();
  const [traceId, setTraceId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [alerts, setAlerts] = useState([]);
  
  const [eventData, setEventData] = useState({
    location: '', temperature: '', humidity: '', notes: ''
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [successHash, setSuccessHash] = useState(null);

  // Auto-set Stage mapping based on role
  const roleStageMap = {
    processor: 'processing',
    distributor: 'distribution',
    retailer: 'retail'
  };
  const myStage = roleStageMap[role] || 'consumer';

  const handleScan = (decodedText) => {
    // If it's a URL, extract ID
    if (decodedText.includes('/trace/')) {
      const parts = decodedText.split('/');
      const id = parts[parts.length - 1];
      setTraceId(id);
      fetchProduct(id);
    } else {
      setTraceId(decodedText);
      fetchProduct(decodedText);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (traceId) fetchProduct(traceId);
  };

  const fetchProduct = async (id) => {
    setSearchLoading(true);
    setSuccessHash(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found or invalid ID');
      const data = await res.json();
      setProduct(data.product);

      // Fetch active alerts for this product
      const { data: productAlerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('product_id', data.product.id)
        .eq('resolved', false);
      setAlerts(productAlerts || []);
      
    } catch (err) {
      toast.error(err.message);
      setProduct(null);
    }
    setSearchLoading(false);
  };

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const city = data.address.city || data.address.state_district || data.address.state;
          setEventData(prev => ({ ...prev, location: city }));
          toast.success("Location updated");
        } catch (error) {
          toast.error("Failed to fetch location name");
        }
        setLocationLoading(false);
      },
      () => {
        toast.error("Location access denied");
        setLocationLoading(false);
      }
    );
  };

  const handleLogEvent = async (e) => {
    e.preventDefault();
    setLogLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = {
        product_id: product.id,
        stage: myStage,
        role: role,
        actor: user.user_metadata?.display_name || user.email,
        ...eventData
      };

      const res = await fetch(`${API_BASE_URL}/api/events/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccessHash(data.event_hash);
      addNotification(`📦 Event logged successfully at ${myStage} stage`, 'success');
      
    } catch (err) {
      toast.error(err.message);
    }
    setLogLoading(false);
  };

  const resetForm = () => {
    setSuccessHash(null);
    setEventData({ location: '', temperature: '', humidity: '', notes: '' });
    setProduct(null);
    setTraceId('');
  };

  const getExpiryInfo = (prod) => {
    const expDate = prod?.exp_date;
    if (!expDate) return { label: 'No expiry', color: 'slate' };
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

  const inputClass = 'w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all duration-300';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">

      {/* LEFT COLUMN - Scanner */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-emerald-600" />
            </div>
            Scan Product QR
          </h2>
          <p className="text-slate-500 text-sm mb-5">Scan a QR code to automatically load product details.</p>
          
          <div className="rounded-2xl overflow-hidden border border-slate-100 bg-[#F8FAFC] mb-5 relative min-h-[300px]">
            <QRScanner onScan={handleScan} />
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">or enter manually</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter Trace ID" 
              value={traceId}
              onChange={e => setTraceId(e.target.value)}
              className="flex-1 bg-[#F8FAFC] border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-2xl px-4 py-3 outline-none text-slate-900 font-mono placeholder:text-slate-400 transition-all"
            />
            <button type="submit" disabled={searchLoading || !traceId} className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 rounded-2xl font-semibold transition-all flex items-center justify-center shadow-sm">
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - Product & Form */}
      <div className="lg:col-span-7">
        {!product ? (
          <div className="bg-white/90 backdrop-blur-sm border border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <ScanLine className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Scan or enter a Trace ID</h3>
            <p className="text-slate-500 max-w-sm">Scan a product's QR code to view its details and append a new event to its blockchain record.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Product Info Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                  {product.brand && <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">by {product.brand}</span>}
                </div>
                <p className="font-mono text-sm text-emerald-600 font-bold mb-4">{product.id}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Stage</span>
                    <span className="capitalize font-semibold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl inline-block">{product.current_stage}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Expiry Status</span>
                    <span className={`font-semibold text-${getExpiryInfo(product).color}-600`}>
                      {product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center sm:border-l sm:border-slate-100 sm:pl-6">
                <div className={`w-16 h-16 rounded-full border-[3px] flex items-center justify-center mb-2
                  ${product.trust_score > 80 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : product.trust_score > 50 ? 'border-orange-400 text-orange-700 bg-orange-50' : 'border-red-500 text-red-700 bg-red-50'}`}>
                  <span className="text-xl font-black">{product.trust_score}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Trust Score</span>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-3xl">
                <h4 className="flex items-center gap-2 font-bold text-red-700 mb-2 uppercase tracking-wider text-xs"><Info className="w-4 h-4" /> Active Alerts</h4>
                <ul className="space-y-1">
                  {alerts.map(a => (
                    <li key={a.id} className="text-sm text-red-600 flex items-start gap-2 font-medium">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      {a.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form or Success */}
            {successHash ? (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-3xl p-10 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-3xl" />
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Event Logged Successfully</h3>
                <p className="text-slate-500 mb-6">Cryptographic proof appended to the blockchain network.</p>
                
                <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-2xl mb-8">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Transaction Hash</span>
                  <p className="font-mono text-emerald-600 text-xs break-all font-bold tracking-wider">{successHash}</p>
                </div>
                
                <button onClick={resetForm} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all w-full sm:w-auto shadow-sm">
                  Log Another Event
                </button>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Log Your Event</h3>
                
                <form onSubmit={handleLogEvent} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor Name</label>
                      <input disabled value={user?.user_metadata?.display_name || user?.email} className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3 text-slate-400 cursor-not-allowed font-medium" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</label>
                      <input disabled value={myStage.toUpperCase()} className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 text-emerald-700 font-bold cursor-not-allowed tracking-wider" />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location *</label>
                      <div className="flex">
                        <input required value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} className="flex-1 bg-white border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 rounded-l-2xl px-4 py-3 outline-none text-slate-900 transition-all font-medium" placeholder="City, Facility Name" />
                        <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-slate-900 hover:bg-slate-800 px-4 rounded-r-2xl transition-all flex items-center justify-center">
                          {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <MapPin className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature (°C)</label>
                      <input type="number" step="0.1" value={eventData.temperature} onChange={e => setEventData({...eventData, temperature: e.target.value})} className={inputClass} placeholder="Optional" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity (%)</label>
                      <input type="number" step="0.1" value={eventData.humidity} onChange={e => setEventData({...eventData, humidity: e.target.value})} className={inputClass} placeholder="Optional" />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                      <textarea rows="3" value={eventData.notes} onChange={e => setEventData({...eventData, notes: e.target.value})} className={inputClass} placeholder="Observations, condition checks..."></textarea>
                    </div>
                  </div>

                  <button type="submit" disabled={logLoading} className="w-full bg-slate-900 hover:bg-slate-800 px-4 py-3.5 rounded-2xl font-semibold text-white transition-all flex items-center justify-center shadow-sm mt-2">
                    {logLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Submit Event to Blockchain'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanAndLog;
