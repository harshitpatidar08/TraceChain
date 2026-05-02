import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, MapPin, QrCode, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

const Register = () => {
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
      // POST /api/products/register equivalent via Supabase Client or custom API...
      // Since backend exists, we can call it. But wait, backend handles JWT. 
      // Let's get active session token.
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
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-slate-800 p-10 rounded-2xl max-w-lg w-full text-center shadow-2xl border border-slate-700">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Product Registered!</h2>
          <p className="text-slate-400 mb-6 font-mono text-lg">{successData.product.id}</p>
          
          <img src={successData.qr_code} alt="QR Code" className="mx-auto w-48 h-48 rounded-lg bg-white p-2 mb-6" />
          
          <p className="text-slate-300 text-sm mb-8">Share this QR with the next stakeholder in the supply chain.</p>
          
          <div className="flex gap-4 justify-center">
            <a 
              href={successData.qr_code} 
              download={`QR_${successData.product.id}.png`}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Download className="w-4 h-4" /> Download QR
            </a>
            <button 
              onClick={() => {
                const win = window.open('');
                win.document.write(`<img src="${successData.qr_code}" onload="window.print();window.close()" />`);
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg transition-colors font-medium text-white"
            >
              <Printer className="w-4 h-4" /> Print QR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Register Product</h1>
        <div className="flex gap-2 items-center text-sm">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Product Info</span>
          <span className="text-slate-600">→</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Metrics & Event</span>
        </div>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Brand</label>
                <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
                  <option value="food">Food</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Weight/Quantity</label>
                <input value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 500kg" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Origin Location</label>
                <input required value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} placeholder="Farm, City, Country" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mfg Date</label>
                <input type="date" required value={formData.mfg_date} onChange={e => setFormData({...formData, mfg_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Expiry Date</label>
                <input type="date" required value={formData.exp_date} onChange={e => setFormData({...formData, exp_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3"></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-lg font-medium text-white transition-colors">
                Next →
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Certifications</label>
              <div className="flex flex-wrap gap-3">
                {availableCerts.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      formData.certifications.includes(cert) 
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <h3 className="text-xl font-semibold mb-4">First Origin Event</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Actor Name</label>
                    <input required value={formData.first_event.actor} onChange={e => setFormData({...formData, first_event: {...formData.first_event, actor: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                    <div className="flex drop-shadow-sm">
                      <input required value={formData.first_event.location} onChange={e => setFormData({...formData, first_event: {...formData.first_event, location: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-l-lg px-4 py-3" />
                      <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-slate-700 hover:bg-slate-600 px-4 rounded-r-lg border border-l-0 border-slate-700 flex items-center justify-center">
                        {locationLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : <MapPin className="w-5 h-5 text-slate-300" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Temperature (°C) {formData.category === 'food' && <span className="text-orange-400 text-xs ml-2">(Rec: 2-8°C)</span>}</label>
                  <input type="number" step="0.1" value={formData.first_event.temperature} onChange={e => setFormData({...formData, first_event: {...formData.first_event, temperature: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Humidity (%)</label>
                  <input type="number" step="0.1" value={formData.first_event.humidity} onChange={e => setFormData({...formData, first_event: {...formData.first_event, humidity: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                  <textarea rows="2" value={formData.first_event.notes} onChange={e => setFormData({...formData, first_event: {...formData.first_event, notes: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3"></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-6 py-3 font-medium transition-colors">
                ← Back
              </button>
              <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center min-w-[200px]">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Register Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;