-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Setup Roles & Permissions (Ensure primitives exist)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
    AND ur.role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 0.1 Update Wallets Table (Add locked_balance)
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS locked_balance DECIMAL(10, 2) DEFAULT 0.00;

-- 1. Create UPI Transactions Table
CREATE TABLE IF NOT EXISTS public.upi_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    upi_ref_id TEXT, -- The RRN or Ref ID from UPI Provider
    gateway_status TEXT DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED
    app_used TEXT, -- gpay, phonepe, paytm, etc.
    intent_url TEXT,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL, -- USER_UPDATE, WALLET_ADJUSTMENT, REFUND
    target_id UUID, -- ID of the user or transaction affected
    details JSONB, -- Previous value, New value, Reason
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies

-- UPI Transactions: Users can view their own, Admins can view all
ALTER TABLE public.upi_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own upi transactions" ON public.upi_transactions;
CREATE POLICY "Users can view own upi transactions" ON public.upi_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all upi transactions" ON public.upi_transactions;
CREATE POLICY "Admins can view all upi transactions" ON public.upi_transactions
    FOR SELECT USING (public.has_role('admin'::public.app_role, auth.uid()));

-- Audit Logs: Admins can view all, Users cannot view
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.has_role('admin'::public.app_role, auth.uid()));

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.has_role('admin'::public.app_role, auth.uid()));

-- 5. Functions & Triggers

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_upi_transactions_updated_at ON public.upi_transactions;
CREATE TRIGGER handle_upi_transactions_updated_at
  BEFORE UPDATE ON public.upi_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
