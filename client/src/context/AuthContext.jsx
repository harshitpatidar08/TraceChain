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
          await fetchRole(session.user.id, session.user.user_metadata);
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
        await fetchRole(session.user.id, session.user.user_metadata);
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

  const fetchRole = async (userId, userMetadata = {}) => {
    try {
      // Always fetch fresh from users_extended table, ignore userMetadata cache
      const { data, error } = await supabase
        .from('users_extended')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Auto-create profile with role from metadata or default to farmer
          const defaultRole = userMetadata.role || 'farmer';
          try {
            await supabase.from('users_extended').insert({
              user_id: userId,
              role: defaultRole,
              display_name: userMetadata.display_name || '',
              organization: userMetadata.organization || ''
            });
            setRole(defaultRole);
            return defaultRole;
          } catch (e) {
            console.error('Error auto-creating profile:', e);
            return null;
          }
        }
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
      // Safety timeout to prevent hanging login buttons
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Login timed out. Please check your connection.")), 15000)
      );

      const { data, error } = await Promise.race([loginPromise, timeout]);
      if (error) throw error;
      
      // We no longer manually fetch role or navigate here.
      // onAuthStateChange listener will detect the SIGNED_IN event,
      // call fetchRole, update user/role states, and Auth.jsx's useEffect
      // will handle the navigation to /dashboard.
      
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

  // Removed artificial loading delay to show content immediately
  // if (loading) {
  //   return <div className="min-h-screen bg-[#F8FAFC]"></div>;
  // }

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