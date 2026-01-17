-- Create enums for the Build Era system
CREATE TYPE public.build_task_type AS ENUM ('daily', 'weekly', 'seasonal', 'special');
CREATE TYPE public.build_task_status AS ENUM ('draft', 'scheduled', 'active', 'inactive', 'expired');
CREATE TYPE public.user_rank AS ENUM ('explorer', 'builder', 'architect', 'pioneer', 'founder_circle');
CREATE TYPE public.badge_type AS ENUM ('auto', 'admin_approved');

-- Build Phases table (admin-controlled story phases)
CREATE TABLE public.build_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  phase_number INTEGER NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Build Tasks table (admin-managed tasks)
CREATE TABLE public.build_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type build_task_type NOT NULL,
  tau_reward NUMERIC NOT NULL CHECK (tau_reward > 0),
  phase_id UUID REFERENCES public.build_phases(id) ON DELETE SET NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status build_task_status NOT NULL DEFAULT 'draft',
  max_completions_per_user INTEGER DEFAULT 1,
  max_total_completions INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  is_system_task BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Task Completions
CREATE TABLE public.user_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.build_tasks(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tau_awarded NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  admin_notes TEXT,
  UNIQUE(user_id, task_id, completion_date)
);

-- Daily Login Tracking (LOCKED SYSTEM)
CREATE TABLE public.daily_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tau_awarded NUMERIC NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, login_date)
);

-- User Build Stats
CREATE TABLE public.user_build_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_rank user_rank NOT NULL DEFAULT 'explorer',
  total_tau_earned NUMERIC NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  contribution_score INTEGER NOT NULL DEFAULT 0,
  login_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Badges Definition
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  badge_type badge_type NOT NULL DEFAULT 'auto',
  tau_threshold NUMERIC,
  tasks_threshold INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  awarded_by UUID,
  UNIQUE(user_id, badge_id)
);

-- Referral Codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  tau_per_referral NUMERIC NOT NULL DEFAULT 5.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral Tracking
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id),
  tau_awarded_to_referrer NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Build Era Settings
CREATE TABLE public.build_era_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.build_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_build_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_era_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view phases" ON public.build_phases FOR SELECT USING (true);
CREATE POLICY "Admins can manage phases" ON public.build_phases FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active tasks" ON public.build_tasks FOR SELECT USING (status = 'active' OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage tasks" ON public.build_tasks FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view completions" ON public.user_task_completions FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert completions" ON public.user_task_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update completions" ON public.user_task_completions FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete completions" ON public.user_task_completions FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view logins" ON public.daily_logins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert login" ON public.daily_logins FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view stats" ON public.user_build_stats FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert stats" ON public.user_build_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update stats" ON public.user_build_stats FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "View active badges" ON public.badges FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert badges" ON public.badges FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update badges" ON public.badges FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete badges" ON public.badges FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view their badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update referral codes" ON public.referral_codes FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referred_id);
CREATE POLICY "Admins update referrals" ON public.referrals FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "View settings" ON public.build_era_settings FOR SELECT USING (true);
CREATE POLICY "Admins insert settings" ON public.build_era_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update settings" ON public.build_era_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_build_phases_updated_at BEFORE UPDATE ON public.build_phases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_build_tasks_updated_at BEFORE UPDATE ON public.build_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_build_stats_updated_at BEFORE UPDATE ON public.user_build_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'WG-' || code;
END;
$$;

-- Function to claim daily login reward
CREATE OR REPLACE FUNCTION public.claim_daily_login()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_last_login DATE;
  v_streak INTEGER;
  v_tau_reward NUMERIC := 1.00;
  v_wallet_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF EXISTS (SELECT 1 FROM daily_logins WHERE user_id = v_user_id AND login_date = v_today) THEN
    RETURN json_build_object('success', false, 'error', 'Already claimed today');
  END IF;
  
  SELECT id INTO v_wallet_id FROM tau_wallets WHERE user_id = v_user_id;
  
  IF v_wallet_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  SELECT last_login_date, login_streak INTO v_last_login, v_streak
  FROM user_build_stats WHERE user_id = v_user_id;
  
  IF v_last_login IS NULL THEN
    v_streak := 1;
  ELSIF v_last_login = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;
  
  INSERT INTO daily_logins (user_id, login_date, tau_awarded)
  VALUES (v_user_id, v_today, v_tau_reward);
  
  UPDATE tau_wallets SET balance = balance + v_tau_reward WHERE id = v_wallet_id;
  
  INSERT INTO user_build_stats (user_id, total_tau_earned, login_streak, longest_streak, last_login_date)
  VALUES (v_user_id, v_tau_reward, v_streak, v_streak, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    total_tau_earned = user_build_stats.total_tau_earned + v_tau_reward,
    login_streak = v_streak,
    longest_streak = GREATEST(user_build_stats.longest_streak, v_streak),
    last_login_date = v_today,
    updated_at = now();
  
  INSERT INTO tau_transactions (wallet_id, type, amount, balance_after, description, status)
  SELECT v_wallet_id, 'earning', v_tau_reward, balance, 'Daily Login Reward', 'completed'
  FROM tau_wallets WHERE id = v_wallet_id;
  
  RETURN json_build_object(
    'success', true,
    'tau_awarded', v_tau_reward,
    'streak', v_streak
  );
END;
$$;