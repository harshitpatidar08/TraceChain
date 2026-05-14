import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Truck,
  Store,
  Loader2,
  ArrowRight,
  Leaf
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login, register, user, role } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user && role) {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    organization: '',
    role: 'farmer'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(
          formData.email,
          formData.password,
          formData.role,
          formData.fullName,
          formData.organization
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 transition-all duration-300';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">

      {/* LEFT SECTION */}

      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F1F5F9] items-center justify-center p-16">

        {/* Decorative Background */}

        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-60" />

        <div className="relative z-10 max-w-xl">

          {/* Heading */}

          <div className="mb-10">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-16 h-16 rounded-3xl bg-white shadow-md flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>

              <div>
                <h1 className="text-5xl font-black text-slate-900">
                  TraceChain
                </h1>

                <p className="text-slate-500 mt-1">
                  Smart Supply Chain Platform
                </p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-slate-900 leading-tight mb-5">
              Track products from farm to customer with complete transparency.
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              Modern blockchain-powered logistics platform for secure product
              verification, real-time tracking, and trusted supply chains.
            </p>
          </div>

          {/* Minimal Image */}

          <div className="relative mb-12 flex justify-center">

  {/* Background Glow */}
  <div className="absolute inset-0 bg-emerald-100 blur-3xl opacity-40 rounded-full scale-110" />

  {/* Main Image Card */}
  <div className="relative bg-white p-3 rounded-[40px] shadow-2xl border border-slate-200 rotate-[-2deg] hover:rotate-0 transition-all duration-500">

    <img
      src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1400&auto=format&fit=crop"
      alt="modern supply chain"
      className="w-[520px] h-[340px] object-cover rounded-[30px]"
    />

    {/* Floating Small Card */}
    <div className="absolute -bottom-6 -right-6 bg-white border border-slate-200 rounded-3xl px-5 py-4 shadow-xl">

      <p className="text-sm text-slate-500 mb-1">
        Live Tracking
      </p>

      <h4 className="text-xl font-bold text-slate-900">
        24/7 Monitoring
      </h4>
    </div>

  </div>
</div>

          {/* Features */}

          <div className="grid grid-cols-3 gap-4">

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-5">
              <Leaf className="w-8 h-8 text-emerald-500 mb-3" />

              <h3 className="font-semibold text-slate-900 mb-1">
                Farm Origin
              </h3>

              <p className="text-sm text-slate-500">
                Verified source tracking
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-5">
              <Truck className="w-8 h-8 text-orange-500 mb-3" />

              <h3 className="font-semibold text-slate-900 mb-1">
                Logistics
              </h3>

              <p className="text-sm text-slate-500">
                Real-time shipment monitoring
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl p-5">
              <Store className="w-8 h-8 text-blue-500 mb-3" />

              <h3 className="font-semibold text-slate-900 mb-1">
                Retail
              </h3>

              <p className="text-sm text-slate-500">
                Instant QR verification
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div className="flex-1 flex items-center justify-center p-6 md:p-10">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">

            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900">
                TraceChain
              </h1>

              <p className="text-slate-500 text-sm">
                Supply Chain Security
              </p>
            </div>
          </div>

          {/* CARD */}

          <div className="bg-white border border-slate-200 rounded-[36px] shadow-xl p-8 md:p-10">

            {/* Tabs */}

            <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">

              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Login
              </button>

              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Register
              </button>

            </div>

            {/* Heading */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>

              <p className="text-slate-500">
                {isLogin
                  ? 'Login to continue managing your supply chain.'
                  : 'Start building trusted product tracking today.'}
              </p>
            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-5">

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      required
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Organization
                    </label>

                    <input
                      type="text"
                      name="organization"
                      required
                      onChange={handleChange}
                      placeholder="Your organization"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role
                    </label>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option>farmer</option>
                      <option>processor</option>
                      <option>distributor</option>
                      <option>retailer</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </div>

              {/* Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Login' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

            </form>

            {/* Footer */}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">

              <p className="text-sm text-slate-400">
                Secure • Transparent • Modern
              </p>

            </div>

          </div>
        </div>
      </div>

      <ChatbotWidget />
    </div>
  );
};

export default Auth;