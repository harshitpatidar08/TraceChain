import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    // Add a maximum timeout of 3 seconds
    const timeoutId = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;
      
      if (mounted) setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchRole = async (userId) => {
    try {
      // Always fetch fresh from users_extended table, ignore userMetadata cache
      const { data, error } = await supabase
        .from('users_extended')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      
      setRole(data?.role || null);
      return data?.role;
    } catch (err) {
      console.error('Error fetching role:', err);
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (data.user) {
        // Fetch role with our new resilient fetchRole
        const userRole = await fetchRole(data.user.id);
        
        // Redirect based on role
        if (userRole) {
          navigate('/dashboard');
        } else {
          // If no role found even in metadata, default to farmer or show error
          toast.error("Account profile not fully set up.");
          navigate('/dashboard');
        }
      }
      
      return true;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return false;
    }
  };

  const register = async (email, password, selectedRole, displayName, organization) => {
    try {
      console.log("Starting registration for:", email);
      
      // Safety timeout: If Supabase doesn't respond in 15 seconds, something is wrong
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Registration timed out. This is usually due to a slow database trigger in Supabase.")), 15000)
      );

      // 1. Sign up auth user WITH metadata
      const signUpPromise = supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: selectedRole,
            display_name: displayName,
            organization
          }
        }
      });

      const { data, error: signUpError } = await Promise.race([signUpPromise, timeout]);

      if (signUpError) {
        console.error("Supabase Signup Error:", signUpError);
        throw signUpError;
      }

      if (data?.user) {
        console.log("User created in Auth, setting role...");
        setRole(selectedRole);

        // 2. Attempt to insert into users_extended
        try {
          const { error: profileError } = await supabase
            .from('users_extended')
            .insert({
              user_id: data.user.id,
              role: selectedRole,
              display_name: displayName,
              organization
            });
          
          if (profileError) console.warn("Extended profile creation warning:", profileError.message);
        } catch (e) {
          console.warn("Table insert caught error:", e);
        }
        
        toast.success('Account created successfully!');
        navigate('/dashboard');
        return true;
      }
      
      console.warn("Signup finished but no user returned. Check email confirmation settings.");
      return false;
    } catch (err) {
      console.error('Registration Catch Block:', err);
      toast.error(err.message || 'Registration failed.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut', err);
    }
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setRole(null);
    navigate('/');
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden relative">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40" />

      {/* Loader Card */}
      <div className="relative bg-white border border-slate-200 rounded-[36px] px-12 py-14 shadow-sm flex flex-col items-center max-w-md w-full">

        {/* Animated Logo */}
        <div className="relative mb-8">

          <div className="w-24 h-24 rounded-[32px] bg-emerald-100 flex items-center justify-center animate-pulse">

            <svg
              className="w-12 h-12 text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2l4-4m5-2a9 9 0 11-18 0a9 9 0 0118 0z"
              />
            </svg>

          </div>

          {/* Spinner Ring */}
          <div className="absolute inset-0 rounded-[32px] border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>

        </div>

        {/* Brand */}
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">

          TraceChain

        </h1>

        <p className="text-slate-500 text-center leading-relaxed mb-8">

          Initializing secure blockchain authentication
          and loading your dashboard experience.

        </p>

        {/* Loading Bar */}

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

          <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse"></div>

        </div>

        <p className="text-sm text-slate-400 mt-5">

          Verifying session...

        </p>

      </div>
    </div>
  );
}

return (
  <AuthContext.Provider
    value={{
      user,
      role,
      loading,
      login,
      register,
      logout
    }}
  >
    {children}
  </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);