import { createClient } from '@/lib/supabase/client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock_count: number;
  unit_price: number;
  reorder_level: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  image_url?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_by_role: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  due_date: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Sales' | 'Inventory';
  created_at: string;
}

export interface StockLog {
  id: string;
  product_id: string;
  change_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  products?: { name: string; sku: string };
}

// 1. Dashboard KPIs Aggregation
export async function fetchDashboardKPIs() {
  const supabase = createClient();

  const [productsRes, ordersRes, profilesRes, salesRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('orders').select('*'),
    supabase.from('profiles').select('*'),
    supabase.from('orders').select('total_amount').eq('status', 'COMPLETED')
  ]);

  const products = productsRes.data || [];
  const orders = ordersRes.data || [];
  const profiles = profilesRes.data || [];
  const completedSales = salesRes.data || [];

  const totalSales = completedSales.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const lowStockCount = products.filter(p => p.stock_count <= p.reorder_level).length;
  const activeStaffCount = profiles.length;
  const totalProducts = products.length;

  return {
    totalSales,
    totalProducts,
    lowStockCount,
    activeStaffCount,
    products,
    orders,
    profiles
  };
}

// 2. Products CRUD
export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 3. Orders CRUD
export async function fetchOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: 'COMPLETED' | 'PENDING' | 'CANCELLED') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 4. Invoices CRUD
export async function fetchInvoices(): Promise<Invoice[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateInvoiceStatus(id: string, status: 'PAID' | 'UNPAID' | 'OVERDUE') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export const defaultProfiles: Profile[] = [
  { id: "EMP-001", full_name: "Jane Smith", email: "jane.smith@minierp.com", role: "Admin", created_at: new Date().toISOString() },
  { id: "EMP-002", full_name: "System Administrator", email: "admin@minierp.com", role: "Admin", created_at: new Date().toISOString() },
];


// 5. Profiles / User Management
export async function fetchProfiles(): Promise<Profile[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultProfiles;
    }
    return data;
  } catch (err) {
    console.warn("Using fallback default profiles:", err);
    return defaultProfiles;
  }
}


export async function createProfile(profile: Omit<Profile, 'id' | 'created_at'> & { password?: string }) {
  try {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      const data = await res.json();
      return data.profile || data.user;
    }
  } catch (err) {
    console.warn('API create-user fallback:', err);
  }

  // Fallback to direct client insert
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfileRole(id: string, role: 'Admin' | 'Sales' | 'Inventory') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(id: string) {
  try {
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('API delete-user fallback:', err);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}



// 6. Stock Logs
export async function fetchStockLogs(): Promise<StockLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('stock_logs')
    .select('*, products(name, sku)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
