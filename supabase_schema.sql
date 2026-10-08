-- Supabase SQL Schema Migration Script for Micro Crypto P2P Exchange

-- 1. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pair VARCHAR(50) UNIQUE NOT NULL DEFAULT 'PKR_USDT',
    rate NUMERIC(12, 2) NOT NULL DEFAULT 282.50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial rate insert
INSERT INTO public.exchange_rates (pair, rate)
VALUES ('PKR_USDT', 282.50)
ON CONFLICT (pair) DO NOTHING;

-- 2. Payment Methods Table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    account_title VARCHAR(150) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Payment Methods
INSERT INTO public.payment_methods (id, name, account_title, account_number, instructions, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'JazzCash', 'P2P Crypto Exchange', '03001234567', 'Send exact PKR amount to this JazzCash account and upload screenshot.', true),
  ('22222222-2222-2222-2222-222222222222', 'Easypaisa', 'P2P Crypto Exchange', '03451234567', 'Send exact PKR amount to this Easypaisa account and upload screenshot.', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    pkr_amount NUMERIC(12, 2) NOT NULL,
    usdt_amount NUMERIC(12, 4) NOT NULL,
    exchange_rate NUMERIC(12, 2) NOT NULL,
    payment_method_id UUID REFERENCES public.payment_methods(id),
    payment_method_name VARCHAR(100) NOT NULL,
    user_usdt_wallet VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50),
    user_email VARCHAR(100),
    proof_screenshot_url TEXT,
    proof_tx_ref VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    admin_pin VARCHAR(255) DEFAULT '123456',
    min_pkr NUMERIC(12, 2) DEFAULT 500,
    max_pkr NUMERIC(12, 2) DEFAULT 1000000,
    notice_text TEXT DEFAULT 'Instant USDT delivery upon receipt verification. Operating 24/7.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.admin_settings (id, admin_pin, min_pkr, max_pkr)
VALUES ('default', '123456', 500, 1000000)
ON CONFLICT (id) DO NOTHING;
