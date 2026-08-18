-- ========================================================
-- MINI-ERP SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- Project: mini-erp-app
-- Description: Complete schema for Products, Orders, Invoices, Stock Logs & User Roles
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for public/authenticated clients (can be refined per portal role)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read access on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow public read access on order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on order_items" ON public.order_items FOR ALL USING (true);

CREATE POLICY "Allow public read access on invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on invoices" ON public.invoices FOR ALL USING (true);

CREATE POLICY "Allow public read access on stock_logs" ON public.stock_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on stock_logs" ON public.stock_logs FOR ALL USING (true);

CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on profiles" ON public.profiles FOR ALL USING (true);

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

INSERT INTO public.products (sku, name, category, stock_count, unit_price, reorder_level, status)
VALUES 
    ('SKU-1001', 'Espresso Blend Whole Bean 1kg', 'Coffee Beans', 145, 28.50, 20, 'IN STOCK'),
    ('SKU-1002', 'Ethiopian Yirgacheffe Light Roast 500g', 'Coffee Beans', 8, 19.99, 15, 'LOW STOCK'),
    ('SKU-1003', 'Oat Milk Barista Edition 1L (Case of 12)', 'Dairy & Alternatives', 0, 42.00, 10, 'OUT OF STOCK'),
    ('SKU-1004', 'Commercial Dual Boiler Espresso Machine', 'Equipment', 4, 3450.00, 2, 'IN STOCK'),
    ('SKU-1005', 'Precision Burr Grinder 64mm', 'Equipment', 12, 580.00, 5, 'IN STOCK')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.orders (order_number, customer_name, total_amount, status, created_by_role)
VALUES 
    ('ORD-2026-001', 'Artisan Roasters Co.', 1250.00, 'COMPLETED', 'Sales Rep'),
    ('ORD-2026-002', 'Downtown Grind Cafe', 485.50, 'PENDING', 'Sales Rep'),
    ('ORD-2026-003', 'Bean & Leaf Bistro', 3200.00, 'COMPLETED', 'Admin')
ON CONFLICT (order_number) DO NOTHING;

INSERT INTO public.invoices (invoice_number, customer_name, amount, due_date, status)
VALUES 
    ('INV-2026-101', 'Artisan Roasters Co.', 1250.00, '2026-09-01', 'PAID'),
    ('INV-2026-102', 'Downtown Grind Cafe', 485.50, '2026-08-30', 'UNPAID'),
    ('INV-2026-103', 'Bean & Leaf Bistro', 3200.00, '2026-08-15', 'OVERDUE')
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO public.profiles (email, full_name, role)
VALUES 
    ('admin@minierp.com', 'System Administrator', 'Admin'),
    ('jane.smith@minierp.com', 'Jane Smith', 'Admin')
ON CONFLICT (email) DO NOTHING;