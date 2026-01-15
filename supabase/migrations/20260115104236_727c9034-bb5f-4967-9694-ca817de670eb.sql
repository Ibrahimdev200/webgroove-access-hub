-- Add security_phrase to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS security_phrase TEXT,
ADD COLUMN IF NOT EXISTS security_phrase_hash TEXT;

-- Create security questions table (predefined questions)
CREATE TABLE IF NOT EXISTS public.security_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_questions
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active security questions
CREATE POLICY "Anyone can view active security questions"
ON public.security_questions
FOR SELECT
USING (is_active = true);

-- Insert default security questions
INSERT INTO public.security_questions (question, display_order) VALUES
('What is the name of your first pet?', 1),
('In what city were you born?', 2),
('What is your mother''s maiden name?', 3),
('What was the name of your first school?', 4),
('What is your favorite movie?', 5),
('What was your childhood nickname?', 6),
('What is the name of your favorite childhood friend?', 7),
('What street did you grow up on?', 8);

-- Create user security answers table
CREATE TABLE IF NOT EXISTS public.user_security_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.security_questions(id) ON DELETE CASCADE,
    answer_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, question_id)
);

-- Enable RLS on user_security_answers
ALTER TABLE public.user_security_answers ENABLE ROW LEVEL SECURITY;

-- Users can view their own security answers
CREATE POLICY "Users can view their own security answers"
ON public.user_security_answers
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own security answers
CREATE POLICY "Users can insert their own security answers"
ON public.user_security_answers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own security answers
CREATE POLICY "Users can update their own security answers"
ON public.user_security_answers
FOR UPDATE
USING (auth.uid() = user_id);

-- Create admin notifications/announcements table
CREATE TABLE IF NOT EXISTS public.admin_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_announcements
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active announcements
CREATE POLICY "Authenticated users can view active announcements"
ON public.admin_announcements
FOR SELECT
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Only admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.admin_announcements
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create user notification reads table (to track which users have seen which announcements)
CREATE TABLE IF NOT EXISTS public.user_notification_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.admin_announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, announcement_id)
);

-- Enable RLS on user_notification_reads
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification reads
CREATE POLICY "Users can view their own notification reads"
ON public.user_notification_reads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own notification reads
CREATE POLICY "Users can insert their own notification reads"
ON public.user_notification_reads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to generate a secure 12-word recovery phrase
CREATE OR REPLACE FUNCTION public.generate_security_phrase()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    words TEXT[] := ARRAY[
        'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
        'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
        'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'xray',
        'yankee', 'zulu', 'anchor', 'beacon', 'castle', 'dragon', 'eagle', 'falcon',
        'galaxy', 'harbor', 'island', 'jungle', 'knight', 'lantern', 'mountain', 'nebula',
        'ocean', 'phoenix', 'quasar', 'river', 'summit', 'thunder', 'universe', 'volcano',
        'wizard', 'zenith', 'amber', 'bronze', 'crystal', 'diamond', 'emerald', 'frost',
        'golden', 'horizon', 'ivory', 'jasper', 'kindle', 'lunar', 'marble', 'nova'
    ];
    phrase TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        phrase := phrase || words[1 + floor(random() * array_length(words, 1))::integer];
        IF i < 12 THEN
            phrase := phrase || '-';
        END IF;
    END LOOP;
    RETURN phrase;
END;
$$;

-- Generate security phrases for existing users who don't have one
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN 
        SELECT user_id FROM public.profiles WHERE security_phrase IS NULL
    LOOP
        UPDATE public.profiles 
        SET security_phrase = public.generate_security_phrase()
        WHERE user_id = profile_record.user_id;
    END LOOP;
END $$;

-- Update the handle_new_user function to include security phrase generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Create wallet with welcome bonus
  INSERT INTO public.tau_wallets (user_id, wallet_address, balance)
  VALUES (NEW.id, wallet_addr, 100.00);
  
  RETURN NEW;
END;
$$;