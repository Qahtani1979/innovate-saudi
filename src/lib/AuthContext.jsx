/* @refresh reset */
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

  // Auto-redirect to onboarding when needed
  useEffect(() => {
    if (needsOnboarding && isAuthenticated && !isLoadingAuth) {
      const currentPath = window.location.pathname.toLowerCase();
      const onboardingPaths = ['/auth', '/onboarding', '/startup-onboarding', '/municipality-staff-onboarding', 
        '/researcher-onboarding', '/citizen-onboarding', '/expert-onboarding', '/deputyship-onboarding'];
      const isOnOnboardingPage = onboardingPaths.some(p => currentPath.includes(p.toLowerCase()));
      
      if (!isOnOnboardingPage) {
        console.log('Redirecting to onboarding - needsOnboarding:', needsOnboarding);
        window.location.href = '/onboarding';
      }
    }
  }, [needsOnboarding, isAuthenticated, isLoadingAuth]);

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
        // Log failed login attempt
        logAuthEvent('login_failed', email, error.message);
        
        setAuthError({
          type: 'login_error',
          message: error.message
        });
        throw error;
      }
      
      // Log successful login and create session record
      logAuthEvent('login_success', email);
      createSessionRecord(data.user);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Helper function to log auth events
  const logAuthEvent = async (eventType, email, errorMessage = null) => {
    try {
      await supabase.functions.invoke('log-auth-event', {
        body: {
          event_type: eventType,
          email,
          error_message: errorMessage,
          metadata: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.debug('Auth event logging failed:', error);
      // Don't throw - logging failures shouldn't block auth
    }
  };

  // Helper function to create session record
  const createSessionRecord = async (authUser) => {
    if (!authUser) return;
    try {
      await supabase.from('user_sessions').insert({
        user_id: authUser.id,
        user_email: authUser.email,
        device_info: {
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        started_at: new Date().toISOString(),
        is_active: true
      });
    } catch (error) {
      console.debug('Session record creation failed:', error);
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

        // Send welcome email to new user via email-trigger-hub
        try {
          await supabase.functions.invoke('email-trigger-hub', {
            body: {
              trigger: 'auth.signup',
              recipient_email: email,
              recipient_user_id: data.user.id,
              entity_type: 'user',
              entity_id: data.user.id,
              variables: {
                userName: metadata.full_name || metadata.name || email.split('@')[0],
                loginUrl: window.location.origin + '/auth'
              },
              language: 'en',
              triggered_by: 'system'
            }
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
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
      
      // Always use current origin for redirect
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
      
      const redirectUrl = `${window.location.origin}/`;
      
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
    const currentEmail = user?.email;
    const currentUserId = user?.id;
    
    // Clear local state first - this ensures UI updates immediately
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setUserRoles([]);
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
    
    try {
      // Log the logout event
      if (currentEmail) {
        logAuthEvent('logout', currentEmail);
      }
      
      // Mark session as ended in database
      if (currentUserId) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('user_id', currentUserId)
          .eq('is_active', true);
      }
      
      // Try to sign out from Supabase - but don't fail if session is already gone
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      // session_not_found is expected if server session was already invalidated
      if (error && error.message !== 'Session from session_id claim in JWT does not exist') {
        console.warn('Signout warning:', error.message);
      }
    } catch (error) {
      // Silently handle - local state is already cleared which is the main goal
      console.debug('Logout cleanup:', error?.message);
    }
    
    if (shouldRedirect) {
      // Immediate redirect since state is already cleared
      window.location.href = '/Auth';
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

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  const hasRole = (role) => {
    return userRoles.some(r => r.role === role);
  };

  const isAdmin = () => hasRole('admin');

  // Create a combined user object that includes profile data
  // IMPORTANT: Preserve auth user's id (don't let profile.id override it)
  const currentUser = user ? {
    ...userProfile,
    ...user,
    profile_id: userProfile?.id, // Keep profile ID separately if needed
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
      updatePassword,
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
    // Return a safe fallback instead of throwing to avoid hook context issues
    return {
      user: null,
      session: null,
      userProfile: null,
      userRoles: [],
      isAuthenticated: false,
      isLoadingAuth: true,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: { public_settings: { requiresAuth: false } },
      needsOnboarding: false,
      login: async () => { throw new Error('AuthProvider not mounted'); },
      signUp: async () => { throw new Error('AuthProvider not mounted'); },
      signInWithGoogle: async () => { throw new Error('AuthProvider not mounted'); },
      signInWithMicrosoft: async () => { throw new Error('AuthProvider not mounted'); },
      logout: async () => {},
      navigateToLogin: () => { window.location.href = '/Auth'; },
      resetPassword: async () => { throw new Error('AuthProvider not mounted'); },
      updatePassword: async () => { throw new Error('AuthProvider not mounted'); },
      hasRole: () => false,
      isAdmin: () => false,
      checkAuth: async () => {},
      checkAppState: async () => {},
      redirectToOnboardingIfNeeded: () => false,
    };
  }
  return context;
};
