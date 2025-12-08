import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ public_settings: { requiresAuth: false } });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        // Defer profile fetch to avoid deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
            fetchUserRoles(currentSession.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserRoles([]);
        }
      }
    );

    // THEN check for existing session
    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check failed:', error);
        setAuthError({
          type: 'auth_error',
          message: error.message
        });
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession?.user);
      
      if (currentSession?.user) {
        await Promise.all([
          fetchUserProfile(currentSession.user.id),
          fetchUserRoles(currentSession.user.id)
        ]);
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRoles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, municipality_id, organization_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
      }
      
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setAuthError({
          type: 'login_error',
          message: error.message
        });
        throw error;
      }
      
      return data;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });
      
      if (error) {
        setAuthError({
          type: 'signup_error',
          message: error.message
        });
        throw error;
      }
      
      // Create user profile if signup successful
      if (data.user) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          user_email: email,
          full_name: metadata.full_name || metadata.name,
          preferred_language: 'en',
        });
      }
      
      return data;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRoles([]);
      setIsAuthenticated(false);
      
      if (shouldRedirect) {
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/auth';
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const hasRole = (role) => {
    return userRoles.some(r => r.role === role);
  };

  const isAdmin = () => hasRole('admin');

  // Create a combined user object that includes profile data
  const currentUser = user ? {
    ...user,
    ...userProfile,
    email: user.email,
    roles: userRoles,
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user: currentUser,
      session,
      userProfile,
      userRoles,
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      signUp,
      logout,
      navigateToLogin,
      resetPassword,
      hasRole,
      isAdmin,
      checkAuth,
      checkAppState: checkAuth, // Alias for compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
