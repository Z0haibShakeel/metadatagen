

import { supabase } from './supabase';
import { UserProfile } from '../types/index';
import { getTodayUTC } from './creditService';

export const userService = {
  /**
   * Fetches the user profile from the 'profiles' table.
   * If the profile doesn't exist (e.g., first login), it creates a default one.
   */
  async ensureUserProfile(user: any): Promise<UserProfile | null> {
    if (!user) return null;

    try {
      // 1. Try to get existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        return data as UserProfile;
      }

      // 2. If no profile exists, create one
      // Note: Ideally, a Supabase Database Trigger should handle this on auth.users insert,
      // but this acts as a client-side fallback.
      if (error && (error.code === 'PGRST116' || !data)) {
        const newProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || '',
          // Role is removed here to allow Supabase DB default to take effect
          created_at: new Date().toISOString(),
          credits_used: 0,
          last_reset_date: getTodayUTC()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
            console.error('Error creating profile:', createError);
            return null;
        }

        return createdProfile as UserProfile;
      }

      return null;
    } catch (e) {
      console.error('Unexpected error in ensureUserProfile:', e);
      return null;
    }
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data as UserProfile;
  }
};