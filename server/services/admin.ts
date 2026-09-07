import { createClient } from '@/server/supabase/client';
import { fetchWithCache, invalidateRelatedCaches } from '@/server/services/cache';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock_count: number;
  unit_price: number;
  wholesale_price?: number;
  reorder_level: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  image_url?: string;
  created_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  products?: { name: string; sku: string; category?: string } | { name: string; sku: string; category?: string }[] | any;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  quantity?: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_by_role: string;
  created_at: string;
  payment_method?: string;
  pricing_tier?: 'RETAIL' | 'WHOLESALE';
  order_items?: OrderItem[];
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
  products?: { name: string; sku: string; unit_price?: number } | any;
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

// 1. Dashboard KPIs Aggregation (Cached 30s + Lean Columns)
export async function fetchDashboardKPIs() {
  return fetchWithCache('dashboard_kpis', async () => {
    const supabase = createClient();

    const [productsRes, ordersRes, profilesRes, salesRes] = await Promise.all([
      supabase.from('products').select('id, sku, name, category, stock_count, unit_price, wholesale_price, reorder_level, status, image_url, created_at'),
      supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_by_role, created_at, order_items(id, product_id, quantity, unit_price, products(name, sku, category))').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('total_amount').eq('status', 'COMPLETED')
    ]);

    const products: Product[] = (productsRes.data as unknown as Product[]) || [];
    const orders: Order[] = (ordersRes.data as unknown as Order[]) || [];
    const profiles: Profile[] = (profilesRes.data as unknown as Profile[]) || [];
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
  }, 30000);
}

// 2. Financial Overview & Dynamic Ledger Aggregation (Cached 30s)
export async function fetchFinancialOverview(): Promise<FinancialOverview> {
  return fetchWithCache('financial_overview', async () => {
    const supabase = createClient();

    const [ordersRes, invoicesRes, stockLogsRes] = await Promise.all([
      supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_by_role, created_at').order('created_at', { ascending: false }),
      supabase.from('invoices').select('id, invoice_number, customer_name, amount, due_date, status, created_at').order('created_at', { ascending: false }),
      supabase.from('stock_logs').select('id, product_id, change_type, quantity, reason, created_at, products(name, sku, unit_price)').order('created_at', { ascending: false }).limit(100)
    ]);

    const orders: Order[] = ordersRes.data || [];
    const stockLogs = stockLogsRes.data || [];

    // Completed sales as gross revenue
    const completedOrders = orders.filter(o => o.status === 'COMPLETED');
    const grossRevenue = completedOrders.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

    // Compute supplier stock addition expenses from stock logs
    const restockExpenses = stockLogs
      .filter(log => log.change_type === 'ADDITION')
      .reduce((acc, log: any) => {
        const prod = Array.isArray(log.products) ? log.products[0] : log.products;
        const price = Number(prod?.unit_price || 15);
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
        amount: `${order.status === 'CANCELLED' ? '-' : '+'}₱${Number(order.total_amount).toFixed(2)}`,
        balance: `₱${Number(runningBalance).toFixed(2)}`
      });
    });

    // Add stock restock entries as expenses
    stockLogs.slice(0, 10).forEach((log: any) => {
      if (log.change_type === 'ADDITION') {
        const prod = Array.isArray(log.products) ? log.products[0] : log.products;
        const cost = Number(log.quantity || 0) * Number(prod?.unit_price || 15) * 0.6;
        ledger.push({
          id: `STK-${log.id.slice(0, 6)}`,
          date: new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          category: 'Inventory Restock',
          description: `Supplier Restock: ${prod?.name || 'Stock In'} (${log.quantity} units)`,
          type: 'Expense',
          amount: `-₱${cost.toFixed(2)}`,
          balance: `₱${Number(runningBalance).toFixed(2)}`
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
  }, 30000);
}

// 3. Products CRUD (Cached 45s + Invalidation)
export async function fetchProducts(): Promise<Product[]> {
  return fetchWithCache('products', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name, category, stock_count, unit_price, wholesale_price, reorder_level, status, image_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, 45000);
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  invalidateRelatedCaches(['products', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
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
  invalidateRelatedCaches(['products', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  invalidateRelatedCaches(['products', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return true;
}

// 4. Orders CRUD (Cached 30s + Invalidation)
export async function fetchOrders(): Promise<Order[]> {
  return fetchWithCache('orders', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, total_amount, status, created_by_role, created_at, order_items(id, order_id, product_id, quantity, unit_price, products(name, sku, category))')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Orders join fetch notice, using fallback:', error);
      const fallbackRes = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return (fallbackRes.data || []).map((o: any) => ({
        ...o,
        quantity: 1,
      }));
    }

    return (data || []).map((order: any) => {
      const items = order.order_items || [];
      const totalQty = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
      return {
        ...order,
        quantity: totalQty > 0 ? totalQty : 1,
      };
    });
  }, 30000);
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at' | 'order_items'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      order_number: order.order_number,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      status: order.status,
      created_by_role: order.created_by_role,
    }])
    .select()
    .single();

  if (error) throw error;
  invalidateRelatedCaches(['orders', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return data;
}

export async function createOrderItem(item: {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.warn('Order item insert notice:', error);
    return null;
  }
  invalidateRelatedCaches(['orders', 'products', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
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
  invalidateRelatedCaches(['orders', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return data;
}

export async function deleteOrder(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  invalidateRelatedCaches(['orders', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return true;
}

export async function deductProductStock(productId: string, quantity: number, reason: string) {
  const supabase = createClient();
  
  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, stock_count, reorder_level')
    .eq('id', productId)
    .single();

  if (fetchErr || !product) {
    console.error('Error fetching product for stock deduction:', fetchErr);
    return null;
  }

  const currentStock = Number(product.stock_count || 0);
  const reorderLevel = Number(product.reorder_level || 0);
  const newStock = Math.max(0, currentStock - quantity);
  const newStatus =
    newStock === 0
      ? 'OUT OF STOCK'
      : newStock <= reorderLevel
      ? 'LOW STOCK'
      : 'IN STOCK';

  const { data: updatedProduct, error: updateErr } = await supabase
    .from('products')
    .update({
      stock_count: newStock,
      status: newStatus,
    })
    .eq('id', productId)
    .select()
    .single();

  if (updateErr) {
    console.error('Error updating product stock during deduction:', updateErr);
    throw updateErr;
  }

  await createStockLog({
    product_id: productId,
    change_type: 'DEDUCTION',
    quantity: quantity,
    reason: reason || `Order fulfillment: Deducted ${quantity} units`,
  });

  invalidateRelatedCaches(['products', 'orders', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return updatedProduct;
}

export async function restoreProductStock(productId: string, quantity: number, reason: string) {
  const supabase = createClient();

  const { data: product, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, stock_count, reorder_level')
    .eq('id', productId)
    .single();

  if (fetchErr || !product) {
    console.warn('Product fetch notice during stock restoration:', fetchErr);
    return null;
  }

  const currentStock = Number(product.stock_count || 0);
  const reorderLevel = Number(product.reorder_level || 0);
  const newStock = currentStock + quantity;
  const newStatus =
    newStock === 0
      ? 'OUT OF STOCK'
      : newStock <= reorderLevel
      ? 'LOW STOCK'
      : 'IN STOCK';

  const { data: updatedProduct, error: updateErr } = await supabase
    .from('products')
    .update({
      stock_count: newStock,
      status: newStatus,
    })
    .eq('id', productId)
    .select()
    .single();

  if (updateErr) {
    console.error('Error updating product stock during restoration:', updateErr);
    throw updateErr;
  }

  await createStockLog({
    product_id: productId,
    change_type: 'ADDITION',
    quantity: quantity,
    reason: reason || `Order restoration: Returned ${quantity} units to inventory`,
  });

  invalidateRelatedCaches(['products', 'orders', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return updatedProduct;
}

// 5. Invoices CRUD (Cached 45s + Invalidation)
export async function fetchInvoices(): Promise<Invoice[]> {
  return fetchWithCache('invoices', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, amount, due_date, status, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }, 45000);
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
  invalidateRelatedCaches(['invoices', 'financial_overview']);
  return data;
}

// 6. Profiles / User Management (Cached 60s + Invalidation)
export async function fetchProfiles(): Promise<Profile[]> {
  return fetchWithCache('profiles', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Profiles fetch notice:", error);
      return [];
    }
    return data || [];
  }, 60000);
}

export async function createProfile(profile: Omit<Profile, 'id' | 'created_at'> & { password?: string }) {
  let createdUser = null;
  try {
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      const data = await res.json();
      createdUser = data.profile || data.user;
    }
  } catch (err) {
    console.warn('API create-user fallback:', err);
  }

  if (!createdUser) {
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
    createdUser = data;
  }

  invalidateRelatedCaches(['profiles', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs']);
  return createdUser;
}

export async function updateProfileRole(id: string, role: 'Admin' | 'Sales' | 'Inventory', email?: string) {
  try {
    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role, email }),
    });
    if (res.ok) {
      const data = await res.json();
      invalidateRelatedCaches(['profiles', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs']);
      return data.profile || data;
    }
  } catch (err) {
    console.warn('API update-role fallback:', err);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  invalidateRelatedCaches(['profiles', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs']);
  return data;
}

export async function deleteProfile(id: string) {
  try {
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      invalidateRelatedCaches(['profiles', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs']);
      return true;
    }
  } catch (err) {
    console.warn('API delete-user fallback:', err);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  invalidateRelatedCaches(['profiles', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs']);
  return true;
}

// 7. Stock Logs & Unified System Audit (Cached 30s + Invalidation)
export interface UnifiedAuditLog {
  id: string;
  timestamp: string;
  module: 'Inventory' | 'Sales & Orders' | 'User & Auth' | 'Finance' | 'Catalog';
  action: string;
  entity_name: string;
  entity_type: string;
  actor: string;
  quantity_or_value?: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'SECURITY';
  description: string;
  raw_id?: string;
}

export async function fetchStockLogs(): Promise<StockLog[]> {
  return fetchWithCache('stock_logs', async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stock_logs')
      .select('id, product_id, change_type, quantity, reason, created_at, products(name, sku, unit_price)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Stock logs fetch notice:', error);
      return [];
    }
    return (data || []).map((log: any) => ({
      ...log,
      products: Array.isArray(log.products) ? log.products[0] : log.products,
    })) as StockLog[];
  }, 30000);
}

export async function createStockLog(log: {
  product_id: string;
  change_type: string;
  quantity: number;
  reason?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('stock_logs')
    .insert([log])
    .select()
    .single();

  if (error) {
    console.warn('Failed to insert stock log:', error);
    return null;
  }
  invalidateRelatedCaches(['stock_logs', 'products', 'sidebar_metrics', 'dashboard_kpis', 'audit_logs', 'financial_overview']);
  return data;
}

export async function fetchUnifiedAuditLogs(): Promise<{
  logs: UnifiedAuditLog[];
  metrics: {
    totalEvents: number;
    stockAdditions: number;
    stockDeductions: number;
    securityAlerts: number;
  };
}> {
  return fetchWithCache('audit_logs', async () => {
    const supabase = createClient();

    const [stockLogsRes, ordersRes, productsRes, profilesRes] = await Promise.all([
      supabase.from('stock_logs').select('id, product_id, change_type, quantity, reason, created_at, products(name, sku, unit_price)').order('created_at', { ascending: false }).limit(100),
      supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_by_role, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('products').select('id, sku, name, category, stock_count, unit_price, reorder_level, status, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('id, email, full_name, role, created_at').order('created_at', { ascending: false }).limit(100),
    ]);

    const stockLogs = stockLogsRes.data || [];
    const orders = ordersRes.data || [];
    const products: Product[] = productsRes.data || [];
    const profiles: Profile[] = profilesRes.data || [];

    const activityTrail: UnifiedAuditLog[] = [];
    let stockAdditionsCount = 0;
    let stockDeductionsCount = 0;
    let securityAlertsCount = 0;

    // 1. Process Stock Logs
    stockLogs.forEach((log: any) => {
      const isAddition = log.change_type === 'ADDITION';
      const isDeduction = log.change_type === 'DEDUCTION';
      const prod = Array.isArray(log.products) ? log.products[0] : log.products;
      if (isAddition) stockAdditionsCount++;
      if (isDeduction) stockDeductionsCount++;

      activityTrail.push({
        id: `LOG-STK-${log.id.slice(0, 8)}`,
        timestamp: log.created_at || new Date().toISOString(),
        module: 'Inventory',
        action: isAddition ? 'STOCK_ADDITION' : isDeduction ? 'STOCK_DEDUCTION' : 'STOCK_ADJUSTMENT',
        entity_name: prod?.name || 'Inventory Item',
        entity_type: prod?.sku ? `SKU: ${prod.sku}` : 'Product Stock',
        actor: isAddition ? 'Supplier Restock' : isDeduction ? 'Order Fulfillment' : 'Inventory Admin',
        quantity_or_value: `${Number(log.quantity) > 0 ? '+' : ''}${log.quantity} units`,
        level: isAddition ? 'SUCCESS' : 'INFO',
        description: log.reason || (isAddition ? `Restocked ${log.quantity} units` : `Deducted ${Math.abs(log.quantity)} units`),
        raw_id: log.id,
      });
    });

    // 2. Process Orders
    orders.forEach((order: Order) => {
      const isCompleted = order.status === 'COMPLETED';
      const isCancelled = order.status === 'CANCELLED';

      activityTrail.push({
        id: `LOG-ORD-${order.id.slice(0, 8)}`,
        timestamp: order.created_at || new Date().toISOString(),
        module: 'Sales & Orders',
        action: isCompleted ? 'ORDER_COMPLETED' : isCancelled ? 'ORDER_CANCELLED' : 'ORDER_CREATED',
        entity_name: order.order_number || `ORD-${order.id.slice(0, 6).toUpperCase()}`,
        entity_type: `Client: ${order.customer_name}`,
        actor: order.created_by_role || 'Sales Rep',
        quantity_or_value: `₱${Number(order.total_amount || 0).toFixed(2)}`,
        level: isCompleted ? 'SUCCESS' : isCancelled ? 'WARNING' : 'INFO',
        description: `Order ${order.order_number} for customer "${order.customer_name}" marked as ${order.status}. Total: ₱${Number(order.total_amount).toFixed(2)}.`,
        raw_id: order.id,
      });
    });

    // 3. Process Product Catalog additions & Low Stock Alerts
    products.forEach((prod: Product) => {
      activityTrail.push({
        id: `LOG-PRD-${prod.id.slice(0, 8)}`,
        timestamp: prod.created_at || new Date().toISOString(),
        module: 'Catalog',
        action: 'PRODUCT_CATALOGED',
        entity_name: prod.name,
        entity_type: `SKU: ${prod.sku}`,
        actor: 'Inventory Admin',
        quantity_or_value: `${prod.stock_count} in stock (₱${Number(prod.unit_price).toFixed(2)})`,
        level: 'INFO',
        description: `Cataloged piece "${prod.name}" in "${prod.category}" collection with initial stock of ${prod.stock_count} units.`,
        raw_id: prod.id,
      });

      if (Number(prod.stock_count) <= Number(prod.reorder_level)) {
        securityAlertsCount++;
        activityTrail.push({
          id: `ALERT-STK-${prod.id.slice(0, 8)}`,
          timestamp: prod.created_at || new Date().toISOString(),
          module: 'Inventory',
          action: prod.stock_count === 0 ? 'OUT_OF_STOCK_TRIGGER' : 'LOW_STOCK_TRIGGER',
          entity_name: prod.name,
          entity_type: `SKU: ${prod.sku}`,
          actor: 'System Guard',
          quantity_or_value: `${prod.stock_count} units left`,
          level: 'WARNING',
          description: `Alert: Stock level for "${prod.name}" (${prod.stock_count} units) has breached safety reorder threshold (${prod.reorder_level} units).`,
          raw_id: prod.id,
        });
      }
    });

    // 4. Process Staff User Accounts
    profiles.forEach((profile: Profile) => {
      activityTrail.push({
        id: `LOG-USR-${profile.id.slice(0, 8)}`,
        timestamp: profile.created_at || new Date().toISOString(),
        module: 'User & Auth',
        action: 'STAFF_REGISTERED',
        entity_name: profile.full_name,
        entity_type: `Role: ${profile.role}`,
        actor: 'System Admin',
        quantity_or_value: profile.role,
        level: 'SECURITY',
        description: `Staff profile activated for ${profile.full_name} (${profile.email}) with ${profile.role} permissions.`,
        raw_id: profile.id,
      });
    });

    activityTrail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      logs: activityTrail,
      metrics: {
        totalEvents: activityTrail.length,
        stockAdditions: stockAdditionsCount,
        stockDeductions: stockDeductionsCount,
        securityAlerts: securityAlertsCount,
      },
    };
  }, 30000);
}

/**
 * Compresses an image to a maximum resolution of 1080p (max 1920x1080)
 * while preserving aspect ratio and optimizing file size.
 */
export async function compressImageTo1080p(file: File, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        const maxWidth = 1920;
        const maxHeight = 1080;

        let scale = 1;
        if (width > maxWidth || height > maxHeight) {
          const scaleWidth = maxWidth / width;
          const scaleHeight = maxHeight / height;
          scale = Math.min(scaleWidth, scaleHeight);
        }

        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Image compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image blob or file to Supabase Storage 'products' bucket
 * and returns the public CDN URL. If the bucket is not found or fails, gracefully
 * falls back to storing the compressed 1080p Base64 data URL directly.
 */
export async function uploadProductImage(fileOrBlob: Blob | File, originalName = 'product.jpg'): Promise<string> {
  const supabase = createClient();
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const cleanBaseName =
    sanitizedName.endsWith('.jpg') ||
    sanitizedName.endsWith('.jpeg') ||
    sanitizedName.endsWith('.png') ||
    sanitizedName.endsWith('.webp')
      ? sanitizedName
      : `${sanitizedName}.jpg`;
  const filePath = `catalog/${Date.now()}_${cleanBaseName}`;

  try {
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, fileOrBlob, {
        contentType: fileOrBlob.type || 'image/jpeg',
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } else if (error) {
      console.warn(`Supabase Storage upload warning (${error.message}). Falling back to compressed 1080p Base64.`);
    }
  } catch (err: any) {
    console.warn(`Storage exception (${err.message}). Using compressed 1080p Base64 fallback.`);
  }

  // Graceful Fallback: Convert compressed 1080p Blob to Data URL so it always saves
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(fileOrBlob);
  });
}
