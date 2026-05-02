-- ============================================
-- TraceChain — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  -- Format: TC-YYYY-CATEGORY-XXX (example: TC-2026-FOOD-001)
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK (category IN ('food','retail')),
  description TEXT,
  origin TEXT,
  weight TEXT,
  certifications TEXT[],
  mfg_date DATE,
  exp_date DATE,
  registered_by UUID REFERENCES auth.users(id),
  current_stage TEXT DEFAULT 'farm' CHECK (current_stage IN
    ('farm','processing','distribution','retail','consumer')),
  status TEXT DEFAULT 'active' CHECK (status IN
    ('active','recalled','expired')),
  qr_code_url TEXT,
  trust_score INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. SUPPLY CHAIN EVENTS TABLE
CREATE TABLE supply_chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN
    ('farm','processing','distribution','retail','consumer')),
  role TEXT NOT NULL,
  actor TEXT NOT NULL,
  location TEXT,
  temperature NUMERIC,
  humidity NUMERIC,
  notes TEXT,
  event_hash TEXT,
  previous_hash TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ALERTS TABLE
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN
    ('expiry','temperature','missing_stage',
     'stage_gap','fraud','recalled')),
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN
    ('low','medium','high')),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. USERS EXTENDED TABLE
CREATE TABLE users_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN
    ('farmer','processor','distributor','retailer','admin')),
  display_name TEXT,
  organization TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Products RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON products
  FOR SELECT USING (true);
CREATE POLICY "Auth users insert products" ON products
  FOR INSERT WITH CHECK (auth.uid() = registered_by);
CREATE POLICY "Auth users update products" ON products
  FOR UPDATE USING (auth.uid() = registered_by);

-- Supply Chain Events RLS
ALTER TABLE supply_chain_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events public read" ON supply_chain_events
  FOR SELECT USING (true);
CREATE POLICY "Auth users insert events" ON supply_chain_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Alerts RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts public read" ON alerts
  FOR SELECT USING (true);
CREATE POLICY "Service role manage alerts" ON alerts
  USING (true);

-- Users Extended RLS
ALTER TABLE users_extended ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON users_extended
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON users_extended
  FOR INSERT WITH CHECK (auth.uid() = user_id);
