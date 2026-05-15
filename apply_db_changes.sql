-- Run these commands in your Supabase SQL Editor

ALTER TABLE users_extended 
ADD COLUMN IF NOT EXISTS farmer_id TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS farmer_id TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS crop_code TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE products
ADD COLUMN IF NOT EXISTS unit_code TEXT;
