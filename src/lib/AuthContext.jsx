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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Check if user needs onboarding - no automatic redirect, just sets state
  const checkOnboardingStatus = (profile) => {
    if (!profile) return false;
    
    // User needs onboarding if onboarding_completed is explicitly false or null/undefined
    const needsIt = profile.onboarding_completed !== true;
    setNeedsOnboarding(needsIt);
    
    return needsIt;
  };
  
  // Separate function to redirect to onboarding if needed (called by components)
  const redirectToOnboardingIfNeeded = () => {
    // Only redirect if:
    // 1. User needs onboarding
    // 2. Not already on auth page or onboarding-related pages
    const currentPath = window.location.pathname.toLowerCase();
    const onboardingPaths = ['/auth', '/onboarding', '/startup-onboarding', '/municipality-staff-onboarding', 
      '/researcher-onboarding', '/citizen-onboarding', '/expert-onboarding'];
    const isOnOnboardingPage = onboardingPaths.some(p => currentPath.includes(p.toLowerCase()));
    
    if (needsOnboarding && !isOnOnboardingPage) {
      window.location.href = '/onboarding';
      return true;
    }
    return false;
  };

  useEffect(() => {
    // Handle OAuth callback - check for tokens in URL hash
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('OAuth callback detected, processing tokens...');
        // Supabase will automatically detect and process the hash
        // We just need to clean the URL after processing
        const { data: { session: callbackSession }, error } = await supabase.auth.getSession();
        
        if (callbackSession && !error) {
          // Clean the URL by removing the hash
          window.history.replaceState(null, '', window.location.pathname);
          console.log('OAuth callback processed successfully');
        } else if (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };

    handleOAuthCallback();

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        setIsLoadingAuth(false);
        
        // Defer profile fetch to avoid deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
            fetchUserRoles(currentSession.user.id);
            
            // Create profile for OAuth users if it doesn't exist
            if (event === 'SIGNED_IN') {
              createOAuthProfile(currentSession.user);
            }
          }, 0);
        } else {
          setUserProfile(null);
          setUserRoles([]);
          setNeedsOnboarding(false);
        }
      }
    );

    // THEN check for existing session
    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  const createOAuthProfile = async (user) => {
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const metadata = user.user_metadata || {};
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          user_email: user.email,
          full_name: metadata.full_name || metadata.name || '',
          preferred_language: 'en',
        });
        console.log('OAuth profile created');
      }
    } catch (error) {
      console.error('Error creating OAuth profile:', error);
    }
  };

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
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
      }
      
      setUserProfile(data);
      
      // Check if user needs onboarding after profile is fetched
      if (data) {
        checkOnboardingStatus(data);
      }
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
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
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
        const { error: profileError } = await supabase.from('user_profiles').upsert({
          user_id: data.user.id,
          user_email: email,
          full_name: metadata.full_name || metadata.name,
          preferred_language: 'en',
        }, { onConflict: 'user_id' });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      
      // Use published domain if available, otherwise current origin
      const publishedDomain = 'https://saudi-innovate-hub.lovable.app';
      const redirectUrl = window.location.hostname.includes('lovable.app') 
        ? `${publishedDomain}/`
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        setAuthError({
          type: 'oauth_error',
          message: error.message
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      setAuthError(null);
      
      const publishedDomain = 'https://saudi-innovate-hub.lovable.app';
      const redirectUrl = window.location.hostname.includes('lovable.app') 
        ? `${publishedDomain}/`
        : `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile openid',
        },
      });
      
      if (error) {
        setAuthError({
          type: 'oauth_error',
          message: error.message
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRoles([]);
      setIsAuthenticated(false);
      setNeedsOnboarding(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
      }
      
      if (shouldRedirect) {
        // Use a small delay to ensure state is cleared before redirect
        setTimeout(() => {
          window.location.href = '/Auth';
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even on error
      if (shouldRedirect) {
        setTimeout(() => {
          window.location.href = '/Auth';
        }, 100);
      }
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Auth';
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
      needsOnboarding,
      login,
      signUp,
      signInWithGoogle,
      signInWithMicrosoft,
      logout,
      navigateToLogin,
      resetPassword,
      hasRole,
      isAdmin,
      checkAuth,
      checkAppState: checkAuth,
      redirectToOnboardingIfNeeded,
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
