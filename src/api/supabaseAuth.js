import { supabase } from '@/integrations/supabase/client';

/**
 * Supabase Auth wrapper that mimics Base44 auth interface
 */
export const auth = {
  /**
   * Get current user
   */
  async me() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      
      // Get extended profile (may not exist yet)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      return {
        id: user.id,
        email: user.email,
        ...(profile || {}),
        ...user.user_metadata,
      };
    } catch (e) {
      console.debug('Auth.me() error:', e);
      return null;
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUp({ email, password, ...metadata }) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata,
      },
    });
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        user_email: email,
        full_name: metadata.full_name || metadata.name,
        ...metadata,
      });
    }
    
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Reset password
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null);
    });
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Check if user has a specific role
   */
  async hasRole(role) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', role)
      .single();
    
    return !!data;
  },

  /**
   * Get user roles
   */
  async getRoles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data } = await supabase
      .from('user_roles')
      .select('role, municipality_id, organization_id')
      .eq('user_id', user.id);
    
    return data || [];
  },
};

export default auth;
