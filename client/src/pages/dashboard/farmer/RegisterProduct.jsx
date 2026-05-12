import React, { useState } from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';

import {
  Loader2,
  MapPin,
  Download,
  Printer,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
  QrCode,
  Leaf,
  Thermometer,
  Droplets,
  FileText,
  User
} from 'lucide-react';

import toast from 'react-hot-toast';
import { supabase } from '../../../config/supabase';
import { Link } from 'react-router-dom';

const RegisterProduct = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'food',
    origin: '',
    weight: '',
    mfg_date: '',
    exp_date: '',
    description: '',
    certifications: [],
    first_event: {
      actor: user?.user_metadata?.display_name || '',
      location: '',
      temperature: '',
      humidity: '',
      notes: ''
    }
  });

  const availableCerts = ['FSSAI', 'ISO', 'Organic', 'Halal', 'Vegan'];

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const toggleCert = (cert) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address.city || data.address.state_district || data.address.state;
          setFormData((prev) => ({
            ...prev,
            first_event: { ...prev.first_event, location: city }
          }));
          toast.success('Location fetched successfully');
        } catch (error) {
          toast.error('Error reverse geocoding location');
        }
        setLocationLoading(false);
      },
      () => {
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
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register product');
      setSuccessData(data);
      addNotification(
        `✅ Product registered successfully!\nTrace ID: ${data.product.id}`,
        'success'
      );
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const inputClass =
    'w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all duration-200 font-medium';

  const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2';

  /* ─── SUCCESS STATE ──────────────────────────────────────────── */
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm p-10 rounded-[40px] border border-slate-200 shadow-sm text-center">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 rounded-t-[40px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

          <div className="relative">
            {/* Icon */}
            <div className="w-24 h-24 bg-emerald-100 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-sm">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> Blockchain Verified
            </div>

            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-3">
              Registration Complete!
            </h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
              Your product is now securely registered on the blockchain and fully traceable across the supply chain.
            </p>

            {/* Trace ID */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl px-8 py-5 mb-6 inline-block">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-2 font-black">Trace ID</span>
              <span className="font-mono text-lg text-emerald-600 font-black tracking-wider break-all">
                {successData.product.id}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-8">
              <div className="bg-white border border-slate-200 p-5 rounded-[28px] shadow-sm inline-block">
                <img
                  src={successData.qr_code}
                  alt="Product QR Code"
                  className="w-52 h-52"
                />
              </div>
            </div>

            {/* QR Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={successData.qr_code}
                download={`QR_${successData.product.id}.png`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-semibold transition-all"
              >
                <Download className="w-5 h-5" /> Download QR
              </a>
              <button
                onClick={() => {
                  const win = window.open('');
                  win.document.write(
                    `<img src="${successData.qr_code}" onload="window.print();window.close()" />`
                  );
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-semibold transition-all"
              >
                <Printer className="w-5 h-5" /> Print QR
              </button>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              <Link
                to={`/dashboard/product/${successData.product.id}`}
                className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-semibold transition-all shadow-sm"
              >
                View Product Journey
              </Link>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setStep(1);
                  setFormData({
                    ...formData,
                    name: '',
                    brand: '',
                    origin: '',
                    weight: '',
                    mfg_date: '',
                    exp_date: '',
                    description: '',
                    certifications: []
                  });
                }}
                className="flex-1 text-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-2xl font-semibold transition-all"
              >
                Register Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── FORM ───────────────────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[36px] p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left: Title */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Product Registration
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-1">
              Register New Product
            </h1>
            <p className="text-slate-500 text-sm">
              Create a secure blockchain identity for your batch.
            </p>
          </div>

          {/* Right: Step Indicator */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-2xl p-1.5 border border-slate-200 shadow-sm self-start sm:self-center shrink-0">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${step === 1 ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${step === 1 ? 'border-white/30 bg-white/10' : step > 1 ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300'}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              Details
            </div>
            <div className="w-6 h-px bg-slate-300 mx-1" />
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${step === 2 ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${step === 2 ? 'border-white/30 bg-white/10' : 'border-slate-300'}`}>
                2
              </span>
              Origin Event
            </div>
          </div>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[36px] p-8 md:p-10 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded-t-[36px] opacity-60" />

        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="relative space-y-8">

          {/* ── STEP 1: Product Details ── */}
          {step === 1 && (
            <>
              {/* Section label */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Product Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Organic Basmati Rice"
                    className={inputClass}
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className={labelClass}>Brand</label>
                  <input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. GreenFarm"
                    className={inputClass}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClass}
                  >
                    <option value="food">Food & Beverage</option>
                    <option value="retail">Retail</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className={labelClass}>Weight / Quantity</label>
                  <input
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="e.g. 500kg batch"
                    className={inputClass}
                  />
                </div>

                {/* Origin — full width */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Origin Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      required
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="e.g. Punjab, India"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Manufacturing Date */}
                <div>
                  <label className={labelClass}>Manufacturing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.mfg_date}
                    onChange={(e) => setFormData({ ...formData, mfg_date: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className={labelClass}>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.exp_date}
                    onChange={(e) => setFormData({ ...formData, exp_date: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Description — full width */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about the product..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2.5 shadow-sm min-w-[160px] justify-center"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Certifications + Origin Event ── */}
          {step === 2 && (
            <>
              {/* Certifications */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Certifications</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {availableCerts.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all duration-200 ${
                        formData.certifications.includes(cert)
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {formData.certifications.includes(cert) && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">First Origin Event</h2>
                    <p className="text-xs text-slate-400 mt-0.5">This creates the genesis block for your product's blockchain journey.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Actor Name */}
                  <div>
                    <label className={labelClass}>Actor Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        value={formData.first_event.actor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: { ...formData.first_event, actor: e.target.value }
                          })
                        }
                        placeholder="Your name or org"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={labelClass}>Location *</label>
                    <div className="flex">
                      <input
                        required
                        value={formData.first_event.location}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: { ...formData.first_event, location: e.target.value }
                          })
                        }
                        placeholder="Farm city / facility"
                        className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-l-2xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={getLocation}
                        disabled={locationLoading}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-5 rounded-r-2xl transition-all flex items-center justify-center"
                      >
                        {locationLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className={labelClass}>
                      Temperature (°C) <span className="text-slate-300 normal-case font-normal tracking-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        value={formData.first_event.temperature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: { ...formData.first_event, temperature: e.target.value }
                          })
                        }
                        placeholder="e.g. 24.5"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Humidity */}
                  <div>
                    <label className={labelClass}>
                      Humidity (%) <span className="text-slate-300 normal-case font-normal tracking-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        value={formData.first_event.humidity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: { ...formData.first_event, humidity: e.target.value }
                          })
                        }
                        placeholder="e.g. 65"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Notes <span className="text-slate-300 normal-case font-normal tracking-normal">Optional</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                      <textarea
                        rows="3"
                        value={formData.first_event.notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: { ...formData.first_event, notes: e.target.value }
                          })
                        }
                        placeholder="Observations at origin point..."
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Notice */}
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                  By submitting, you confirm this information is accurate. The product record will be <strong>cryptographically hashed</strong> and permanently stored on the blockchain.
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-700 px-8 py-3.5 rounded-2xl font-semibold transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all duration-200 shadow-sm min-w-[220px]"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Register on Blockchain</>
                  )}
                </button>
              </div>
            </>
          )}

        </form>
      </div>
    </div>
  );
};

export default RegisterProduct;