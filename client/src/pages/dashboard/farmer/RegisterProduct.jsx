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
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
        
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete</h2>
        <p className="text-gray-500 mb-2">Your product has been securely logged on the blockchain.</p>
        
        <div className="bg-orange-50 inline-block px-6 py-3 rounded-xl border border-orange-100 mb-8">
          <span className="text-[10px] text-orange-600 uppercase tracking-widest block mb-1 font-bold">Trace ID</span>
          <span className="font-mono text-xl text-orange-700 font-bold tracking-wider">{successData.product.id}</span>
        </div>
          
          <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-inner">
            <img src={successData.qr_code} alt="QR Code" className="w-48 h-48" />
          </div>
          
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <a 
            href={successData.qr_code} 
            download={`QR_${successData.product.id}.png`}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl transition-all font-bold shadow-sm"
          >
            <Download className="w-5 h-5" /> Download QR
          </a>
          <button 
            onClick={() => {
              const win = window.open('');
              win.document.write(`<img src="${successData.qr_code}" onload="window.print();window.close()" />`);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl transition-all font-bold shadow-sm"
          >
            <Printer className="w-5 h-5" /> Print QR
          </button>
        </div>
          
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 pt-6 border-t border-slate-100">
          <Link 
            to={`/dashboard/product/${successData.product.id}`}
            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
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
            className="flex-1 text-center bg-transparent border border-orange-200 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl font-bold transition-all"
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
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Register New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new blockchain identity for your batch.</p>
        </div>
        <div className="flex items-center bg-white rounded-full p-1 border border-slate-200 shadow-sm">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${step === 1 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}>
            1. Details
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${step === 2 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}>
            2. Origin Event
          </span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="e.g. Organic Basmati Rice" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand</label>
                <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="e.g. GreenFarm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900">
                  <option value="food">Food & Beverage</option>
                  <option value="retail">Retail Goods</option>
                  <option value="pharma">Pharmaceuticals</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Weight/Quantity</label>
                <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 500kg batch" className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Origin Location *</label>
                <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="e.g. Punjab, India" className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manufacturing Date *</label>
                <input type="date" required value={formData.mfg_date} onChange={e => setFormData({...formData, mfg_date: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date *</label>
                <input type="date" required value={formData.exp_date} onChange={e => setFormData({...formData, exp_date: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900" />
              </div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="Additional details about the product..."></textarea>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-md active:scale-95">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {availableCerts.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
                      formData.certifications.includes(cert) 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md' 
                        : 'bg-white border-slate-200 text-gray-500 hover:border-orange-200 hover:text-orange-500'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">First Origin Event</h3>
                <p className="text-sm text-gray-500">This event will be logged as the genesis block for this product.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actor Name *</label>
                  <input required value={formData.first_event.actor} onChange={e => setFormData({...formData, first_event: {...formData.first_event, actor: e.target.value}})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location *</label>
                  <div className="flex">
                    <input required value={formData.first_event.location} onChange={e => setFormData({...formData, first_event: {...formData.first_event, location: e.target.value}})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-l-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="City, Region" />
                    <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-gray-50 hover:bg-gray-100 px-4 rounded-r-xl border border-l-0 border-slate-200 transition-colors flex items-center justify-center">
                      {locationLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Temperature (°C) 
                    {formData.category === 'food' && <span className="text-orange-600 text-[10px] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full font-bold">Rec: 2-8°C</span>}
                  </label>
                  <input type="number" step="0.1" value={formData.first_event.temperature} onChange={e => setFormData({...formData, first_event: {...formData.first_event, temperature: e.target.value}})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Humidity (%)</label>
                  <input type="number" step="0.1" value={formData.first_event.humidity} onChange={e => setFormData({...formData, first_event: {...formData.first_event, humidity: e.target.value}})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="Optional" />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes / Conditions</label>
                  <textarea rows="2" value={formData.first_event.notes} onChange={e => setFormData({...formData, first_event: {...formData.first_event, notes: e.target.value}})} className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 rounded-xl px-4 py-2.5 outline-none transition-all text-gray-900 placeholder-slate-400" placeholder="Weather conditions, specific handling instructions..."></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 border-t border-slate-100 gap-4">
              <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-900 px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Details
              </button>
              <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center min-w-[200px] shadow-lg shadow-orange-500/10 active:scale-95">
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
