import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { User, Loader2, Save, Building, Phone, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    organization: '',
    phone: ''
  });

  useEffect(() => {
    if (user && user.user_metadata) {
      setFormData({
        displayName: user.user_metadata.display_name || '',
        organization: user.user_metadata.organization || '',
        phone: user.user_metadata.phone || ''
      });
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
          organization: formData.organization,
          phone: formData.phone
        }
      });

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const displayNameDisplay = formData.displayName || user?.email || 'User';

  const roleColors = {
    farmer: 'bg-emerald-100 text-emerald-700',
    processor: 'bg-blue-100 text-blue-700',
    distributor: 'bg-purple-100 text-purple-700',
    retailer: 'bg-orange-100 text-orange-700',
    admin: 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-lg mx-auto py-8">

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="bg-white/90 backdrop-blur-sm rounded-[36px] border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Top Header Background */}
        <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-slate-50 to-slate-50" />
          <div className="absolute top-4 right-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50" />
        </div>

        {/* Profile Card Content */}
        <div className="px-8 pb-8">
          {/* Avatar Area */}
          <div className="relative -mt-16 text-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-3 shadow-xl">
              <span className="text-4xl font-black text-white">{getInitials(displayNameDisplay)}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate px-4">{displayNameDisplay}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 mb-3 text-slate-500 font-medium text-sm">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColors[role] || 'bg-slate-100 text-slate-600'}`}>
              {role}
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edit Profile</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl pl-11 pr-4 py-3.5 outline-none text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl pl-11 pr-4 py-3.5 outline-none text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                  placeholder="Company or Farm Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-2xl pl-11 pr-4 py-3.5 outline-none text-slate-900 transition-all placeholder:text-slate-300 font-medium"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 font-medium">Your data is encrypted and protected by Supabase Auth. Your email cannot be changed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
