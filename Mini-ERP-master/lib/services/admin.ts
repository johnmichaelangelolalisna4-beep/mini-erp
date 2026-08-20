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

export interface LedgerEntry {
  id: string;
  date: string;
  category: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: string;
  balance: string;
}

export interface FinancialOverview {
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  estimatedTax: number;
  ledger: LedgerEntry[];
}

// 1. Dashboard KPIs Aggregation
export async function fetchDashboardKPIs() {
  const supabase = createClient();

  const [productsRes, ordersRes, profilesRes, salesRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('total_amount').eq('status', 'COMPLETED')
  ]);

  const products: Product[] = productsRes.data || [];
  const orders: Order[] = ordersRes.data || [];
  const profiles: Profile[] = profilesRes.data || [];
  const completedSales = salesRes.data || [];

  const totalSales = completedSales.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const lowStockCount = products.filter(p => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)).length;
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

// 2. Financial Overview & Dynamic Ledger Aggregation
export async function fetchFinancialOverview(): Promise<FinancialOverview> {
  const supabase = createClient();

  const [ordersRes, invoicesRes, stockLogsRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('stock_logs').select('*, products(name, sku, unit_price)').order('created_at', { ascending: false })
  ]);

  const orders: Order[] = ordersRes.data || [];
  const invoices: Invoice[] = invoicesRes.data || [];
  const stockLogs = stockLogsRes.data || [];

  // Completed sales as gross revenue
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const grossRevenue = completedOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  // Compute supplier stock addition expenses from stock logs
  const restockExpenses = stockLogs
    .filter(log => log.change_type === 'ADDITION')
    .reduce((acc, log) => {
      const price = Number(log.products?.unit_price || 15);
      return acc + (Number(log.quantity || 0) * price * 0.6); // Estimated wholesale cost (60% of retail)
    }, 0);

  const totalExpenses = restockExpenses > 0 ? restockExpenses : grossRevenue * 0.25; // Sensible dynamic expense
  const netProfit = Math.max(0, grossRevenue - totalExpenses);
  const estimatedTax = netProfit * 0.15; // 15% provision

  // Construct dynamic ledger entries from actual orders and stock logs
  const ledger: LedgerEntry[] = [];
  let runningBalance = grossRevenue - totalExpenses;

  // Add order transactions
  orders.forEach(order => {
    ledger.push({
      id: order.order_number || `ORD-${order.id.slice(0, 6)}`,
      date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      category: 'Sales Revenue',
      description: `Order for ${order.customer_name} (${order.status})`,
      type: order.status === 'CANCELLED' ? 'Expense' : 'Income',
      amount: `${order.status === 'CANCELLED' ? '-' : '+'}$${Number(order.total_amount).toFixed(2)}`,
      balance: `$${Number(runningBalance).toFixed(2)}`
    });
  });

  // Add stock restock entries as expenses
  stockLogs.slice(0, 10).forEach((log: any) => {
    if (log.change_type === 'ADDITION') {
      const cost = Number(log.quantity || 0) * Number(log.products?.unit_price || 15) * 0.6;
      ledger.push({
        id: `STK-${log.id.slice(0, 6)}`,
        date: new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        category: 'Inventory Restock',
        description: `Supplier Restock: ${log.products?.name || 'Stock In'} (${log.quantity} units)`,
        type: 'Expense',
        amount: `-$${cost.toFixed(2)}`,
        balance: `$${Number(runningBalance).toFixed(2)}`
      });
    }
  });

  return {
    grossRevenue,
    totalExpenses,
    netProfit,
    estimatedTax,
    ledger: ledger.slice(0, 25)
  };
}

// 3. Products CRUD
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

// 4. Orders CRUD
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

// 5. Invoices CRUD
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

// 6. Profiles / User Management (Dynamic with no fake defaults)
export async function fetchProfiles(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn("Profiles fetch notice:", error);
    return [];
  }
  return data || [];
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

// 7. Stock Logs
export async function fetchStockLogs(): Promise<StockLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('stock_logs')
    .select('*, products(name, sku, unit_price)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
