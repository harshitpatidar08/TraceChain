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
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id, session.user.user_metadata);
      }
      setLoading(false);
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchRole(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId, userMetadata = null) => {
    try {
      // 1. Check metadata passed or from state
      if (userMetadata?.role) {
        setRole(userMetadata.role);
        return userMetadata.role;
      }

      // 2. Fallback to users_extended table
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
        const userRole = await fetchRole(data.user.id, data.user.user_metadata);
        
        // Redirect based on role
        if (userRole) {
          navigate(`/dashboard/${userRole}`);
        } else {
          // If no role found even in metadata, default to farmer or show error
          toast.error("Account profile not fully set up.");
          navigate('/dashboard/farmer');
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
        navigate(`/dashboard/${selectedRole}`);
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
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);