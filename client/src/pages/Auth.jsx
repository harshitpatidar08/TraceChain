import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, Package, Store, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        const success = await register(
          formData.email,
          formData.password,
          formData.role,
          formData.fullName,
          formData.organization
        );
        // If registration failed, loading is already handled by finally, 
        // but we can add logic here if we want to stay on specific tabs.
      }
    } catch (err) {
      console.error("Auth Page Error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      console.log("Cleaning up loading state...");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-slate-100">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-700 flex-col justify-center items-center p-12">
        <div className="max-w-md w-full">
          <h1 className="text-5xl font-bold mb-4 flex items-center gap-3">
            <ShieldCheck className="w-12 h-12" /> TraceChain
          </h1>
          <p className="text-xl text-orange-100 mb-12">Securing the supply chain from farm to fork with blockchain transparency.</p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-orange-600/30 p-4 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">1. Farm & Processing</h3>
                <p className="text-orange-200 text-sm">Register source origin</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-orange-600/30 p-4 rounded-xl backdrop-blur-sm">
              <Truck className="w-8 h-8 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">2. Distribution</h3>
                <p className="text-orange-200 text-sm">Track shipments & temps</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-orange-600/30 p-4 rounded-xl backdrop-blur-sm">
              <Store className="w-8 h-8 text-orange-200" />
              <div>
                <h3 className="font-semibold text-lg">3. Retail & Consumer</h3>
                <p className="text-orange-200 text-sm">Verify authenticity instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center justify-center bg-slate-900 p-8">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <div className="flex mb-8 bg-slate-900 rounded-lg p-1">
            <button 
              className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input type="text" name="fullName" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Organization</label>
                  <input type="text" name="organization" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                  <select name="role" onChange={handleChange} value={formData.role} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors">
                    <option value="farmer">Farmer</option>
                    <option value="processor">Processor</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input type="password" name="password" required onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;