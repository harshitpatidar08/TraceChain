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
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
        {/* Top Header Background */}
        <div className="h-32 bg-slate-900 border-b border-slate-700 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-slate-900 to-slate-900"></div>
        </div>

        {/* Profile Card Content */}
        <div className="px-8 pb-8">
          {/* Avatar Area */}
          <div className="relative -mt-16 text-center mb-6">
            <div className="w-32 h-32 bg-orange-500 rounded-full border-4 border-slate-800 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-5xl font-bold text-white">{getInitials(displayNameDisplay)}</span>
            </div>
            <h2 className="text-2xl font-bold text-white truncate px-4">{displayNameDisplay}</h2>
            <div className="flex items-center justify-center gap-2 mt-1 mb-3 text-slate-400">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {role}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-11 pr-4 py-3 outline-none text-white transition-all placeholder-slate-600"
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-11 pr-4 py-3 outline-none text-white transition-all placeholder-slate-600"
                  placeholder="Company or Farm Name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl pl-11 pr-4 py-3 outline-none text-white transition-all placeholder-slate-600"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
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
