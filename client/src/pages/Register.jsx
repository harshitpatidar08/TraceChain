import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import {
  Loader2,
  MapPin,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Package
} from 'lucide-react';

import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

const Register = () => {
  const { user } = useAuth();

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

  const availableCerts = [
    'FSSAI',
    'ISO',
    'Organic',
    'Halal',
    'Vegan'
  ];

  const inputClass =
    'w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all';

  const labelClass =
    'block text-sm font-semibold text-slate-700 mb-2';

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

          const city =
            data.address.city ||
            data.address.state_district ||
            data.address.state;

          setFormData((prev) => ({
            ...prev,
            first_event: {
              ...prev.first_event,
              location: city
            }
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
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const res = await fetch(
        'http://localhost:5000/api/products/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Failed to register product'
        );
      }

      setSuccessData(data);

      toast.success('Product registered successfully!');
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">

        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 -z-10" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10" />

        <div className="bg-white border border-slate-200 rounded-[36px] p-10 max-w-xl w-full shadow-sm text-center">

          <div className="w-24 h-24 rounded-[32px] bg-emerald-100 flex items-center justify-center mx-auto mb-8">

            <CheckCircle2 className="w-12 h-12 text-emerald-600" />

          </div>

          <h2 className="text-4xl font-black text-slate-900 mb-3">

            Product Registered

          </h2>

          <p className="text-slate-500 mb-8">

            Your product has been successfully added to the
            TraceChain blockchain.

          </p>

          <div className="bg-[#F8FAFC] border border-slate-200 rounded-3xl p-8 mb-8">

            <img
              src={successData.qr_code}
              alt="QR Code"
              className="mx-auto w-56 h-56 bg-white rounded-2xl p-3 shadow-sm"
            />

            <p className="font-mono text-sm text-slate-500 mt-6">

              {successData.product.id}

            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">

            <a
              href={successData.qr_code}
              download={`QR_${successData.product.id}.png`}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all"
            >

              <Download className="w-5 h-5" />

              Download QR

            </a>

            <button
              onClick={() => {
                const win = window.open('');

                win.document.write(
                  `<img src="${successData.qr_code}" onload="window.print();window.close()" />`
                );
              }}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all"
            >

              <Printer className="w-5 h-5" />

              Print QR

            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12">

      {/* Background */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40 -z-10" />

      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="text-center mb-14">

          <div className="w-20 h-20 rounded-[28px] bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-6">

            <Package className="w-10 h-10 text-emerald-500" />

          </div>

          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">

            Register Product

          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto">

            Create secure blockchain records for product tracking
            and supply chain verification.

          </p>

        </div>

        {/* Stepper */}

        <div className="flex items-center justify-center gap-4 mb-10">

          <div
            className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
              step === 1
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            1. Product Info
          </div>

          <div className="w-10 h-px bg-slate-300" />

          <div
            className={`px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
              step === 2
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500'
            }`}
          >
            2. Metrics & Event
          </div>

        </div>

        {/* Main Card */}

        <div className="bg-white border border-slate-200 rounded-[36px] p-6 md:p-10 shadow-sm">

          {step === 1 ? (
            <form
              onSubmit={handleNext}
              className="space-y-8"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className={labelClass}>
                    Product Name
                  </label>

                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Brand
                  </label>

                  <input
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand: e.target.value
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Category
                  </label>

                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value
                      })
                    }
                    className={inputClass}
                  >
                    <option value="food">
                      Food
                    </option>

                    <option value="retail">
                      Retail
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Weight / Quantity
                  </label>

                  <input
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value
                      })
                    }
                    placeholder="e.g. 500kg"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Origin Location
                  </label>

                  <input
                    required
                    value={formData.origin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        origin: e.target.value
                      })
                    }
                    placeholder="Farm, City, Country"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Manufacturing Date
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.mfg_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mfg_date: e.target.value
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Expiry Date
                  </label>

                  <input
                    type="date"
                    required
                    value={formData.exp_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exp_date: e.target.value
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Description
                  </label>

                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value
                      })
                    }
                    className={inputClass}
                  />
                </div>

              </div>

              <div className="flex justify-end">

                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all"
                >
                  Next →
                </button>

              </div>

            </form>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-10"
            >

              {/* Certifications */}

              <div>

                <label className={labelClass}>
                  Certifications
                </label>

                <div className="flex flex-wrap gap-3 mt-4">

                  {availableCerts.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`px-5 py-3 rounded-2xl border text-sm font-semibold transition-all ${
                        formData.certifications.includes(cert)
                          ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}

                </div>
              </div>

              {/* Event */}

              <div className="border-t border-slate-100 pt-10">

                <h3 className="text-2xl font-bold text-slate-900 mb-8">

                  First Origin Event

                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <label className={labelClass}>
                        Actor Name
                      </label>

                      <input
                        required
                        value={formData.first_event.actor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            first_event: {
                              ...formData.first_event,
                              actor: e.target.value
                            }
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Location
                      </label>

                      <div className="flex">

                        <input
                          required
                          value={formData.first_event.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_event: {
                                ...formData.first_event,
                                location: e.target.value
                              }
                            })
                          }
                          className="flex-1 bg-[#F8FAFC] border border-slate-200 rounded-l-2xl px-5 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400/30"
                        />

                        <button
                          type="button"
                          onClick={getLocation}
                          disabled={locationLoading}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-r-2xl transition-all"
                        >

                          {locationLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <MapPin className="w-5 h-5" />
                          )}

                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Temperature (°C)
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      value={formData.first_event.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_event: {
                            ...formData.first_event,
                            temperature: e.target.value
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Humidity (%)
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      value={formData.first_event.humidity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_event: {
                            ...formData.first_event,
                            humidity: e.target.value
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Notes
                    </label>

                    <textarea
                      rows="3"
                      value={formData.first_event.notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_event: {
                            ...formData.first_event,
                            notes: e.target.value
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* Actions */}

              <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6">

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl font-semibold transition-all"
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all flex items-center justify-center min-w-[220px]"
                >

                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Register Product'
                  )}

                </button>

              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;