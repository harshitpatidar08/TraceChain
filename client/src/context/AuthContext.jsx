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

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id, session.user.user_metadata);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        // Only the finally block controls loading — no race-condition timeout
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION is handled by initAuth above
      if (event === 'INITIAL_SESSION') return;

      if (!mounted) return;
      
      // Silently update user on token refresh or user update without re-fetching role
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          setUser(session.user);
        }
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      mounted = false;
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
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Server is slow, please try again")), 5000)
      );

      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      
      const { data, error } = await Promise.race([loginPromise, timeout]);
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        setRole(data.user.user_metadata?.role || 'farmer');
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
    // Clear React state immediately so UI updates at once
    setUser(null);
    setRole(null);
    // IMPORTANT: Do NOT call localStorage.clear() or sessionStorage.clear().
    // Supabase uses navigator.locks internally — clearing localStorage destroys
    // its lock tracking keys while the actual Web Lock stays held, which causes
    // the next signInWithPassword() call to time out waiting for the lock.
    // Let supabase.auth.signOut() handle its own cleanup correctly.
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during signOut', err);
    }
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