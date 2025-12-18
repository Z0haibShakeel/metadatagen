
import { UserProfile } from '../types/index';
import { supabase } from './supabase';

export const DAILY_FREE_CREDITS = 50;

/**
 * Gets the current date in YYYY-MM-DD format based on UTC time.
 */
export const getTodayUTC = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if credits need to be reset based on the date.
 * Returns the effective credits used (0 if reset occurred, otherwise current value).
 */
export const getEffectiveCreditsUsed = (profile: UserProfile): number => {
  const today = getTodayUTC();
  if (profile.last_reset_date !== today) {
    return 0;
  }
  return profile.credits_used || 0;
};

/**
 * Calculates remaining credits for the user.
 * Premium users return Infinity.
 */
export const getRemainingCredits = (profile: UserProfile): number => {
  if (profile.role === 'premium') return Infinity;
  
  const used = getEffectiveCreditsUsed(profile);
  return Math.max(0, DAILY_FREE_CREDITS - used);
};

/**
 * Checks if user has enough credits for a specific amount.
 */
export const hasSufficientCredits = (profile: UserProfile, amount: number = 1): boolean => {
  if (profile.role === 'premium') return true;
  return getRemainingCredits(profile) >= amount;
};

/**
 * Deducts credits. Handles the logic of resetting the date if it's a new day.
 * Returns the updated UserProfile.
 */
export const deductCredits = async (profile: UserProfile, amount: number = 1): Promise<UserProfile> => {
  if (profile.role === 'premium') return profile;

  const today = getTodayUTC();
  let newUsed = profile.credits_used;

  // If new day, reset used count before adding amount
  if (profile.last_reset_date !== today) {
    newUsed = amount;
  } else {
    newUsed = (profile.credits_used || 0) + amount;
  }

  // Optimistic update locally
  const updatedProfile: UserProfile = {
    ...profile,
    credits_used: newUsed,
    last_reset_date: today
  };

  // Persist to Supabase
  const { error } = await supabase
    .from('profiles')
    .update({ 
      credits_used: newUsed, 
      last_reset_date: today 
    })
    .eq('id', profile.id);

  if (error) {
    console.error("Failed to deduct credits:", error);
    throw new Error("Failed to update credit balance.");
  }

  return updatedProfile;
};
