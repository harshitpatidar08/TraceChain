import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, MapPin, QrCode, Download, Printer, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../../config/supabase';
import { Link } from 'react-router-dom';

const RegisterProduct = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'food', origin: '', weight: '',
    mfg_date: '', exp_date: '', description: '',
    certifications: [],
    first_event: { actor: user?.user_metadata?.display_name || '', location: '', temperature: '', humidity: '', notes: '' }
  });

  const availableCerts = ['FSSAI', 'ISO', 'Organic', 'Halal', 'Vegan'];

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const toggleCert = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
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
          setFormData(prev => ({
            ...prev,
            first_event: { ...prev.first_event, location: city }
          }));
          toast.success('Location fetched successfully');
        } catch (error) {
          toast.error('Error reverse geocoding location');
        }
        setLocationLoading(false);
      },
      (error) => {
        toast.error('Location access denied or failed');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('http://localhost:5000/api/products/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register product');

      setSuccessData(data);
      toast.success('Product registered successfully!');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 p-10 rounded-xl border border-green-500/30 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
          
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Registration Complete</h2>
          <p className="text-slate-400 mb-2">Your product has been securely logged on the blockchain.</p>
          
          <div className="bg-slate-900/50 inline-block px-6 py-3 rounded-lg border border-slate-700 mb-8">
            <span className="text-sm text-slate-500 uppercase tracking-wider block mb-1">Trace ID</span>
            <span className="font-mono text-xl text-orange-400">{successData.product.id}</span>
          </div>
          
          <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-inner">
            <img src={successData.qr_code} alt="QR Code" className="w-48 h-48" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <a 
              href={successData.qr_code} 
              download={`QR_${successData.product.id}.png`}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" /> Download QR
            </a>
            <button 
              onClick={() => {
                const win = window.open('');
                win.document.write(`<img src="${successData.qr_code}" onload="window.print();window.close()" />`);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Printer className="w-5 h-5" /> Print QR
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-slate-700/50">
            <Link 
              to={`/dashboard/product/${successData.product.id}`}
              className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Product Journey
            </Link>
            <button 
              onClick={() => {
                setSuccessData(null);
                setStep(1);
                setFormData({
                  ...formData,
                  name: '', brand: '', origin: '', weight: '',
                  mfg_date: '', exp_date: '', description: '',
                  certifications: []
                });
              }}
              className="flex-1 text-center bg-transparent border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Register Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Register New Product</h1>
          <p className="text-slate-400 text-sm mt-1">Create a new blockchain identity for your batch.</p>
        </div>
        <div className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700">
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${step === 1 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400'}`}>
            1. Details
          </span>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${step === 2 ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400'}`}>
            2. Origin Event
          </span>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-sm">
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Product Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="e.g. Organic Basmati Rice" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Brand</label>
                <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="e.g. GreenFarm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white">
                  <option value="food">Food & Beverage</option>
                  <option value="retail">Retail Goods</option>
                  <option value="pharma">Pharmaceuticals</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Weight/Quantity</label>
                <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 500kg batch" className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-300">Origin Location *</label>
                <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="e.g. Punjab, India" className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Manufacturing Date *</label>
                <input type="date" required value={formData.mfg_date} onChange={e => setFormData({...formData, mfg_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Expiry Date *</label>
                <input type="date" required value={formData.exp_date} onChange={e => setFormData({...formData, exp_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="Additional details about the product..."></textarea>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-700">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-6 py-2.5 rounded-lg font-medium text-white transition-colors flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {availableCerts.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      formData.certifications.includes(cert) 
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">First Origin Event</h3>
                <p className="text-sm text-slate-400">This event will be logged as the genesis block for this product.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Actor Name *</label>
                  <input required value={formData.first_event.actor} onChange={e => setFormData({...formData, first_event: {...formData.first_event, actor: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Location *</label>
                  <div className="flex">
                    <input required value={formData.first_event.location} onChange={e => setFormData({...formData, first_event: {...formData.first_event, location: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-l-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="City, Region" />
                    <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-r-lg border border-l-0 border-slate-700 transition-colors flex items-center justify-center">
                      {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-300" /> : <MapPin className="w-4 h-4 text-slate-300" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    Temperature (°C) 
                    {formData.category === 'food' && <span className="text-orange-400 text-xs bg-orange-400/10 px-2 py-0.5 rounded-full">Rec: 2-8°C</span>}
                  </label>
                  <input type="number" step="0.1" value={formData.first_event.temperature} onChange={e => setFormData({...formData, first_event: {...formData.first_event, temperature: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Humidity (%)</label>
                  <input type="number" step="0.1" value={formData.first_event.humidity} onChange={e => setFormData({...formData, first_event: {...formData.first_event, humidity: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="Optional" />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-300">Notes / Conditions</label>
                  <textarea rows="2" value={formData.first_event.notes} onChange={e => setFormData({...formData, first_event: {...formData.first_event, notes: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-lg px-4 py-2.5 outline-none transition-all text-white placeholder-slate-500" placeholder="Weather conditions, specific handling instructions..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 border-t border-slate-700 gap-4">
              <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-6 py-2.5 font-medium transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Details
              </button>
              <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 px-8 py-2.5 rounded-lg font-medium text-white transition-colors flex items-center justify-center min-w-[200px] shadow-lg shadow-orange-500/20">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Register on Blockchain'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterProduct;
