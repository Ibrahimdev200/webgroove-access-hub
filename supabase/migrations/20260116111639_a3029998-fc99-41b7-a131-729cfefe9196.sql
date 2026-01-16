-- Fix #1: Create atomic transfer function to prevent race conditions
CREATE OR REPLACE FUNCTION public.execute_transfer(
  p_sender_wallet_id UUID,
  p_recipient_wallet_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_reference_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_new_balance DECIMAL;
  v_recipient_new_balance DECIMAL;
BEGIN
  -- Lock rows and update sender (atomic)
  UPDATE tau_wallets
  SET balance = balance - p_amount
  WHERE id = p_sender_wallet_id
    AND balance >= p_amount
    AND is_active = true
  RETURNING balance INTO v_sender_new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or inactive wallet';
  END IF;
  
  -- Update recipient
  UPDATE tau_wallets
  SET balance = balance + p_amount
  WHERE id = p_recipient_wallet_id
    AND is_active = true
  RETURNING balance INTO v_recipient_new_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient wallet not found or inactive';
  END IF;
  
  -- Create transaction records
  INSERT INTO tau_transactions (wallet_id, type, amount, balance_after, counterparty_wallet_id, description, reference_id, status)
  VALUES 
    (p_sender_wallet_id, 'transfer_out', p_amount, v_sender_new_balance, p_recipient_wallet_id, p_description, p_reference_id, 'completed'),
    (p_recipient_wallet_id, 'transfer_in', p_amount, v_recipient_new_balance, p_sender_wallet_id, p_description, p_reference_id, 'completed');
  
  RETURN json_build_object(
    'success', true,
    'sender_balance', v_sender_new_balance,
    'recipient_balance', v_recipient_new_balance
  );
END;
$$;

-- Fix #2: Restrict profile SELECT policy to only own profile (prevents email/security_phrase exposure)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile only"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Also allow admins to view all profiles for admin functionality
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));