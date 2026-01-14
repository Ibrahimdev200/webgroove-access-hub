-- =============================================
-- WEBGROOVE CORE DATABASE SCHEMA
-- =============================================

-- 1. USER ROLES ENUM
CREATE TYPE public.app_role AS ENUM ('standard', 'developer', 'creator', 'vendor', 'admin');

-- 2. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. USER ROLES TABLE (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. TAU WALLETS TABLE
CREATE TABLE public.tau_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  wallet_address TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  daily_transfer_limit DECIMAL(15, 2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tau_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON public.tau_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.tau_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. TAU TRANSACTIONS TABLE
CREATE TYPE public.transaction_type AS ENUM ('purchase', 'transfer_in', 'transfer_out', 'earning', 'refund');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

CREATE TABLE public.tau_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.tau_wallets(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  counterparty_wallet_id UUID REFERENCES public.tau_wallets(id),
  description TEXT,
  reference_id TEXT,
  status transaction_status NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tau_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.tau_transactions FOR SELECT
  USING (
    wallet_id IN (SELECT id FROM public.tau_wallets WHERE user_id = auth.uid())
  );

-- 6. OTP CODES FOR SECURE TRANSFERS
CREATE TABLE public.transfer_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  recipient_wallet_address TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  purpose TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transfer_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own OTPs"
  ON public.transfer_otps FOR SELECT
  USING (auth.uid() = user_id);

-- 7. MARKETPLACE CATEGORIES
CREATE TABLE public.marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.marketplace_categories FOR SELECT
  USING (true);

-- 8. MARKETPLACE PRODUCTS
CREATE TYPE public.product_status AS ENUM ('draft', 'pending', 'active', 'inactive');

CREATE TABLE public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.marketplace_categories(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  features TEXT[],
  base_price_usd DECIMAL(10, 2) NOT NULL,
  tau_price DECIMAL(10, 2) NOT NULL,
  cash_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_price_usd * 1.06) STORED,
  image_url TEXT,
  status product_status NOT NULL DEFAULT 'pending',
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.marketplace_products FOR SELECT
  USING (status = 'active' OR vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own products"
  ON public.marketplace_products FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own products"
  ON public.marketplace_products FOR UPDATE
  USING (auth.uid() = vendor_id);

-- 9. ORDERS TABLE
CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'refunded', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('tau', 'card');

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  payment_method payment_method NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  tau_amount DECIMAL(10, 2),
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 10. AUTO-CREATE PROFILE AND WALLET ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_addr TEXT;
BEGIN
  -- Generate unique wallet address
  wallet_addr := 'wg_' || substring(md5(NEW.id::text || now()::text) from 1 for 12);
  
  -- Create profile
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1));
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'standard');
  
  -- Create wallet with welcome bonus
  INSERT INTO public.tau_wallets (user_id, wallet_address, balance)
  VALUES (NEW.id, wallet_addr, 100.00);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. UPDATE TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tau_wallets_updated_at
  BEFORE UPDATE ON public.tau_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.marketplace_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. SEED MARKETPLACE CATEGORIES
INSERT INTO public.marketplace_categories (name, slug, description, icon, color, display_order) VALUES
  ('Developer Tools', 'developer-tools', 'IDEs, debugging tools, and development utilities', 'Code', 'blue', 1),
  ('Design Resources', 'design-resources', 'UI kits, icons, templates, and design systems', 'Palette', 'pink', 2),
  ('Training Courses', 'training-courses', 'Online courses, tutorials, and certifications', 'GraduationCap', 'amber', 3),
  ('Infrastructure', 'infrastructure', 'Cloud services, APIs, and backend tools', 'Server', 'emerald', 4),
  ('AI & ML Tools', 'ai-ml-tools', 'Machine learning frameworks and AI utilities', 'Brain', 'violet', 5),
  ('Security', 'security', 'Security auditing, encryption, and compliance tools', 'Shield', 'red', 6);