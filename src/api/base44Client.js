/**
 * Supabase-based client that mimics the Base44 SDK interface
 * This allows gradual migration from Base44 to Supabase
 */

import { entities } from './supabaseEntities';
import { auth } from './supabaseAuth';

// Create a client object that mimics base44 SDK structure
export const base44 = {
  entities,
  auth,
};

export default base44;
