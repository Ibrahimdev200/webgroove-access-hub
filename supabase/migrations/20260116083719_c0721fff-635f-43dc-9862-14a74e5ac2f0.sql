-- 1. Create pending_transfers table for the new transfer flow
CREATE TABLE public.pending_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_wallet_id UUID NOT NULL REFERENCES public.tau_wallets(id),
  sender_user_id UUID NOT NULL,
  recipient_wallet_id UUID NOT NULL REFERENCES public.tau_wallets(id),
  recipient_user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 3),
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_transfers ENABLE ROW LEVEL SECURITY;

-- Policies for pending_transfers
CREATE POLICY "Senders can view their pending transfers"
ON public.pending_transfers
FOR SELECT
USING (sender_user_id = auth.uid());

CREATE POLICY "Recipients can view pending transfers to them"
ON public.pending_transfers
FOR SELECT
USING (recipient_user_id = auth.uid());

CREATE POLICY "Senders can cancel their pending transfers"
ON public.pending_transfers
FOR UPDATE
USING (sender_user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Recipients can accept pending transfers"
ON public.pending_transfers
FOR UPDATE
USING (recipient_user_id = auth.uid() AND status = 'pending');

-- 2. Update handle_new_user function to give 10 TAU instead of 100
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  wallet_addr TEXT;
  sec_phrase TEXT;
BEGIN
  -- Generate unique wallet address
  wallet_addr := 'wg_' || substring(md5(NEW.id::text || now()::text) from 1 for 12);
  
  -- Generate security phrase
  sec_phrase := public.generate_security_phrase();
  
  -- Create profile with security phrase
  INSERT INTO public.profiles (user_id, email, display_name, security_phrase)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), sec_phrase);
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'standard');
  
  -- Create wallet with 10 TAU welcome bonus (changed from 100)
  INSERT INTO public.tau_wallets (user_id, wallet_address, balance)
  VALUES (NEW.id, wallet_addr, 10.00);
  
  RETURN NEW;
END;
$$;

-- 3. Enable realtime for pending_transfers so users get notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_transfers;