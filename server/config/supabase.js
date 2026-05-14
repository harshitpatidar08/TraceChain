import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const getUserSupabase = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return supabase;
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    }
  );
};
