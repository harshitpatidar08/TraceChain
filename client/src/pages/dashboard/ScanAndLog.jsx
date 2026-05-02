import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { Search, Loader2, Package, MapPin, CheckCircle, ScanLine, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import QRScanner from '../../components/QRScanner';

const ScanAndLog = () => {
  const { user, role } = useAuth();
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
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
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

      const res = await fetch('http://localhost:5000/api/events/log', {
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
      toast.success('Event logged successfully!');
      
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
      {/* LEFT COLUMN - Scanner */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border-2 border-orange-500/50 shadow-lg shadow-orange-500/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <ScanLine className="text-orange-500" /> Scan Product QR
          </h2>
          
          <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 mb-6 relative min-h-[300px]">
            <QRScanner onScanSuccess={handleScan} />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">or enter manually</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Trace ID" 
              value={traceId}
              onChange={e => setTraceId(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-4 py-3 outline-none text-white font-mono placeholder-slate-500 transition-colors"
            />
            <button type="submit" disabled={searchLoading || !traceId} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - Product & Form */}
      <div className="lg:col-span-7">
        {!product ? (
          <div className="bg-slate-800/50 border border-slate-700/50 border-dashed rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ScanLine className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Scan or enter a Trace ID to begin</h3>
            <p className="text-slate-500">Scan a product's QR code to view its details and append a new event to its blockchain record.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Info Card */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{product.name}</h3>
                  {product.brand && <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">by {product.brand}</span>}
                </div>
                <p className="font-mono text-sm text-orange-400 mb-4">{product.id}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Current Stage</span>
                    <span className="capitalize font-medium text-white bg-slate-700 px-2 py-1 rounded inline-block">{product.current_stage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Expiry Status</span>
                    <span className={`font-medium text-${getExpiryInfo(product.exp_date).color}-400`}>
                      {product.exp_date ? new Date(product.exp_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center sm:border-l sm:border-slate-700 sm:pl-6">
                <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mb-2
                  ${product.trust_score > 80 ? 'border-green-500 text-green-500' : product.trust_score > 50 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}>
                  <span className="text-2xl font-bold">{product.trust_score}</span>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Trust Score</span>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                <h4 className="flex items-center gap-2 font-bold text-red-400 mb-2"><Info className="w-5 h-5" /> Active Alerts</h4>
                <ul className="space-y-1">
                  {alerts.map(a => (
                    <li key={a.id} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      {a.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form or Success */}
            {successHash ? (
              <div className="bg-slate-800 p-10 rounded-xl border border-green-500/50 text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Event Logged Successfully</h3>
                <p className="text-slate-400 mb-6">Cryptographic proof appended to the network.</p>
                
                <div className="bg-slate-900 p-4 rounded-lg mb-8 border border-slate-700">
                  <span className="text-xs text-slate-500 uppercase block mb-1">Transaction Hash</span>
                  <p className="font-mono text-orange-400 text-sm break-all">{successHash}</p>
                </div>
                
                <button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto">
                  Log Another Event
                </button>
              </div>
            ) : (
              <div className="bg-slate-800 p-6 sm:p-8 rounded-xl border border-slate-700 shadow-sm relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Package className="w-32 h-32 text-orange-500" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-6">Log Your Event</h3>
                
                <form onSubmit={handleLogEvent} className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Actor Name</label>
                      <input disabled value={user?.user_metadata?.display_name || user?.email} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Stage</label>
                      <input disabled value={myStage.toUpperCase()} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-orange-400/80 font-medium cursor-not-allowed" />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-slate-300">Location *</label>
                      <div className="flex">
                        <input required value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-l-lg px-4 py-2.5 outline-none text-white transition-colors" placeholder="City, Facility Name" />
                        <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-r-lg border border-l-0 border-slate-700 transition-colors flex items-center justify-center">
                          {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-300" /> : <MapPin className="w-4 h-4 text-slate-300" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Temperature (°C)</label>
                      <input type="number" step="0.1" value={eventData.temperature} onChange={e => setEventData({...eventData, temperature: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-4 py-2.5 outline-none text-white transition-colors placeholder-slate-600" placeholder="Optional" />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-300">Humidity (%)</label>
                      <input type="number" step="0.1" value={eventData.humidity} onChange={e => setEventData({...eventData, humidity: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-4 py-2.5 outline-none text-white transition-colors placeholder-slate-600" placeholder="Optional" />
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-sm font-medium text-slate-300">Notes</label>
                      <textarea rows="3" value={eventData.notes} onChange={e => setEventData({...eventData, notes: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 rounded-lg px-4 py-2.5 outline-none text-white transition-colors placeholder-slate-600" placeholder="Observations, condition checks..."></textarea>
                    </div>
                  </div>

                  <button type="submit" disabled={logLoading} className="w-full bg-orange-500 hover:bg-orange-600 px-4 py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center shadow-lg shadow-orange-500/20 mt-4">
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
