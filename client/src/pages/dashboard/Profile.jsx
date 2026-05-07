import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { User, Loader2, Save, Building, Phone, Mail } from 'lucide-react';
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

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Top Header Background */}
        <div className="h-32 bg-gray-50 border-b border-slate-100 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-gray-50 to-gray-50"></div>
        </div>

        {/* Profile Card Content */}
        <div className="px-8 pb-8">
          {/* Avatar Area */}
          <div className="relative -mt-16 text-center mb-6">
            <div className="w-32 h-32 bg-orange-500 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-3 shadow-xl">
              <span className="text-5xl font-black text-white">{getInitials(displayNameDisplay)}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 truncate px-4 font-poppins">{displayNameDisplay}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 mb-3 text-gray-500 font-medium">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <span className="inline-block px-4 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {role}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 rounded-xl pl-11 pr-4 py-3 outline-none text-gray-900 transition-all placeholder-gray-300 font-medium"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 rounded-xl pl-11 pr-4 py-3 outline-none text-gray-900 transition-all placeholder-gray-300 font-medium"
                  placeholder="Company or Farm Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 rounded-xl pl-11 pr-4 py-3 outline-none text-gray-900 transition-all placeholder-gray-300 font-medium"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
