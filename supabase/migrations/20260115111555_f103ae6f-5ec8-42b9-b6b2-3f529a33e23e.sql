-- Add account management fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add freeze fields to wallets (is_active already exists but let's add more context)
ALTER TABLE public.tau_wallets
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS frozen_reason TEXT;

-- Create admin audit log table to track all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_user_id UUID,
    target_wallet_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and insert audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create account recovery requests table
CREATE TABLE IF NOT EXISTS public.account_recovery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.account_recovery_requests ENABLE ROW LEVEL SECURITY;

-- Users can create and view their own recovery requests
CREATE POLICY "Users can create recovery requests"
ON public.account_recovery_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recovery requests"
ON public.account_recovery_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can update recovery requests
CREATE POLICY "Admins can update recovery requests"
ON public.account_recovery_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any profile (for blocking)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all wallets
CREATE POLICY "Admins can view all wallets"
ON public.tau_wallets
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update any wallet
CREATE POLICY "Admins can update any wallet"
ON public.tau_wallets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert transactions (for crediting accounts)
CREATE POLICY "Admins can insert transactions"
ON public.tau_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));