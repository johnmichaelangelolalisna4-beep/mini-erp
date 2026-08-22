-- ========================================================
-- MINI-ERP SUPABASE DATABASE DDL SCHEMA (IDEMPOTENT)
-- Project: mini-erp-app
-- Description: Core Schema Definitions for Products, Orders, Order Items, Invoices, Stock Logs & User Profiles
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock_count INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    wholesale_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    reorder_level INT NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'IN STOCK',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_by_role TEXT DEFAULT 'Sales Rep',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STOCK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.stock_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL, -- 'ADDITION', 'DEDUCTION', 'ADJUSTMENT'
    quantity INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROFILES / USER MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Sales', -- 'Admin', 'Sales', 'Inventory'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (SAFE / RE-RUNNABLE)
-- ========================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Products Policies
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on products" ON public.products;
CREATE POLICY "Allow public insert/update on products" ON public.products FOR ALL USING (true);

-- 2. Orders Policies
DROP POLICY IF EXISTS "Allow public read access on orders" ON public.orders;
CREATE POLICY "Allow public read access on orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on orders" ON public.orders;
CREATE POLICY "Allow public insert/update on orders" ON public.orders FOR ALL USING (true);

-- 3. Order Items Policies
DROP POLICY IF EXISTS "Allow public read access on order_items" ON public.order_items;
CREATE POLICY "Allow public read access on order_items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on order_items" ON public.order_items;
CREATE POLICY "Allow public insert/update on order_items" ON public.order_items FOR ALL USING (true);

-- 4. Invoices Policies
DROP POLICY IF EXISTS "Allow public read access on invoices" ON public.invoices;
CREATE POLICY "Allow public read access on invoices" ON public.invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on invoices" ON public.invoices;
CREATE POLICY "Allow public insert/update on invoices" ON public.invoices FOR ALL USING (true);

-- 5. Stock Logs Policies
DROP POLICY IF EXISTS "Allow public read access on stock_logs" ON public.stock_logs;
CREATE POLICY "Allow public read access on stock_logs" ON public.stock_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on stock_logs" ON public.stock_logs;
CREATE POLICY "Allow public insert/update on stock_logs" ON public.stock_logs FOR ALL USING (true);

-- 6. Profiles Policies
DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update on profiles" ON public.profiles;
CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true);

-- ========================================================
-- 8. HIGH-PERFORMANCE DATABASE INDEXES (B-TREE)
-- ========================================================

-- Products: Quick filter for low stock alerts and category browsing
CREATE INDEX IF NOT EXISTS idx_products_stock_reorder ON public.products(stock_count, reorder_level);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created ON public.products(created_at DESC);

-- Orders: Fast sorting by date, status filtering for pending badges
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- Order Items: Foreign key acceleration for order details and joins
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Stock Logs: Fast chronological audit trail queries
CREATE INDEX IF NOT EXISTS idx_stock_logs_created ON public.stock_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON public.stock_logs(product_id);

-- Invoices: Fast retrieval by status and due date
CREATE INDEX IF NOT EXISTS idx_invoices_status_created ON public.invoices(status, created_at DESC);

-- Profiles: Fast role lookup and staff count
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ========================================================
-- 9. SUPABASE STORAGE BUCKET CONFIGURATION
-- ========================================================

-- Create 'products' public storage bucket if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public Storage Access Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Products Bucket'
    ) THEN
        CREATE POLICY "Public Access for Products Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'products');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads to Products Bucket'
    ) THEN
        CREATE POLICY "Allow Uploads to Products Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Updates to Products Bucket'
    ) THEN
        CREATE POLICY "Allow Updates to Products Bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'products');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Deletes from Products Bucket'
    ) THEN
        CREATE POLICY "Allow Deletes from Products Bucket" ON storage.objects FOR DELETE USING (bucket_id = 'products');
    END IF;
END $$;

-- ========================================================
-- 10. SUPABASE REALTIME WEBSOCKET REPLICATION
-- ========================================================

-- Enable Realtime events for tables so UI updates automatically without manual refresh
DO $$
BEGIN
    -- Enable replication for orders, products, order_items, stock_logs, profiles
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

