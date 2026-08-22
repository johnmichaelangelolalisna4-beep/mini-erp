import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';

export interface ExportReportOptions {
  fileNamePrefix?: string;
}

/**
 * Helper to auto-calculate worksheet column widths based on cell content
 */
function fitToColumn(worksheetData: (string | number | boolean | null | undefined)[][]) {
  const colWidths: { wch: number }[] = [];

  worksheetData.forEach((row) => {
    row.forEach((val, colIndex) => {
      const cellLen = val !== null && val !== undefined ? String(val).length : 0;
      if (!colWidths[colIndex] || cellLen > colWidths[colIndex].wch) {
        colWidths[colIndex] = { wch: Math.max(cellLen + 3, 12) };
      }
    });
  });

  return colWidths;
}

/**
 * Dynamically queries live Supabase database and generates a comprehensive
 * multi-sheet Excel spreadsheet containing Sales Reports, Executive Financial Summary,
 * General Ledger, and Product Inventory Valuation.
 */
export async function exportFinanceSummaryReport(options: ExportReportOptions = {}) {
  const supabase = createClient();

  // 1. Fetch live data from Supabase in parallel
  const [ordersRes, productsRes, invoicesRes, stockLogsRes, profilesRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').order('created_at', { ascending: false }),
    supabase.from('stock_logs').select('*, products(name, sku, unit_price)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const invoices = invoicesRes.data || [];
  const stockLogs = stockLogsRes.data || [];
  const profiles = profilesRes.data || [];

  // 2. Compute dynamic financial metrics
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

  const grossRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const cancelledRevenue = cancelledOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Compute restock wholesale expenses from stock logs
  const restockExpenses = stockLogs
    .filter((log: any) => log.change_type === 'ADDITION')
    .reduce((sum: number, log: any) => {
      const price = Number(log.products?.unit_price || 15);
      return sum + Number(log.quantity || 0) * price * 0.6;
    }, 0);

  const totalExpenses = restockExpenses > 0 ? restockExpenses : grossRevenue * 0.25;
  const netProfit = Math.max(0, grossRevenue - totalExpenses);
  const estimatedTax = netProfit * 0.15;

  const totalInventoryValuation = products.reduce(
    (sum, p) => sum + Number(p.stock_count || 0) * Number(p.unit_price || 0),
    0
  );
  const lowStockProducts = products.filter(
    (p) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)
  );

  const now = new Date();
  const reportDateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const reportTimeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const isoDateStr = now.toISOString().split('T')[0];

  // 3. Create Workbook
  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // TAB 1: EXECUTIVE FINANCIAL SUMMARY
  // -------------------------------------------------------------
  const summarySheetData: (string | number)[][] = [
    ['MINI-ERP LUXURY FURNITURE & INTERIOR LIVING'],
    ['EXECUTIVE SALES & FINANCIAL SUMMARY REPORT'],
    ['Generated On:', `${reportDateStr} at ${reportTimeStr}`],
    ['Database Source:', 'Supabase Live Production Database'],
    [],
    ['KEY PERFORMANCE INDICATORS', 'AMOUNT / VALUE', 'DETAILS & DESCRIPTION'],
    ['Gross Sales Revenue (Completed)', `₱${grossRevenue.toFixed(2)}`, 'Total settled order revenue from customers'],
    ['Total Operating & Restock Cost', `₱${totalExpenses.toFixed(2)}`, 'Supplier procurement and wholesale fulfillment expenses'],
    ['Net Operating Profit Margin', `₱${netProfit.toFixed(2)}`, 'Net profit before tax provisions (Revenue - Expenses)'],
    ['Estimated Tax Provision (15%)', `₱${estimatedTax.toFixed(2)}`, 'Estimated corporate tax allocation at default 15% rate'],
    ['Total Orders Placed', orders.length, 'Total customer sales orders recorded in system'],
    ['Completed Orders Volume', `${completedOrders.length} orders (₱${grossRevenue.toFixed(2)})`, 'Orders fulfilled and settled in full'],
    ['Pending Orders Volume', `${pendingOrders.length} orders (₱${pendingRevenue.toFixed(2)})`, 'Orders in queue or awaiting payment/fulfillment'],
    ['Cancelled Orders Volume', `${cancelledOrders.length} orders (₱${cancelledRevenue.toFixed(2)})`, 'Voided or cancelled transactions'],
    ['Total Products in Catalog', `${products.length} SKUs`, 'Active furniture models and pieces across collections'],
    ['Total Stock Inventory Value', `₱${totalInventoryValuation.toFixed(2)}`, 'Asset valuation based on current retail unit pricing'],
    ['Low Stock Reorder Alerts', `${lowStockProducts.length} Items`, 'Products at or below designated minimum safety levels'],
    ['Registered Staff Accounts', `${profiles.length} Users`, 'Active enterprise employee and administrator accounts'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
  summarySheet['!cols'] = fitToColumn(summarySheetData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // -------------------------------------------------------------
  // TAB 2: DETAILED SALES ORDERS REPORT
  // -------------------------------------------------------------
  const salesHeader = [
    'Order Number',
    'Customer Name',
    'Order Date',
    'Quantity',
    'Status',
    'Total Amount (₱)',
    'Created By Role',
    'System Order ID',
  ];

  const salesRows = orders.map((order: any) => [
    order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    order.customer_name || 'Walk-in Client',
    new Date(order.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    order.quantity || 1,
    order.status || 'PENDING',
    Number(order.total_amount || 0).toFixed(2),
    order.created_by_role || 'Sales Rep',
    order.id,
  ]);

  const salesSheetData = [
    ['MINI-ERP SALES ORDERS DETAILED REPORT'],
    [`Total Orders: ${orders.length}`, `Report Date: ${reportDateStr}`],
    [],
    salesHeader,
    ...salesRows,
  ];

  const salesSheet = XLSX.utils.aoa_to_sheet(salesSheetData);
  salesSheet['!cols'] = fitToColumn(salesSheetData);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Orders Report');

  // -------------------------------------------------------------
  // TAB 3: GENERAL LEDGER & CASHFLOW ENTRIES
  // -------------------------------------------------------------
  const ledgerHeader = [
    'TRX ID',
    'Date',
    'Category',
    'Description',
    'Flow Type',
    'Amount (₱)',
    'Running Balance (₱)',
  ];

  let runningBalance = grossRevenue - totalExpenses;
  const ledgerRows: (string | number)[][] = [];

  orders.forEach((order) => {
    const isCancelled = order.status === 'CANCELLED';
    const amountNum = Number(order.total_amount || 0);
    ledgerRows.push([
      order.order_number || `ORD-${order.id.slice(0, 6)}`,
      new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      'Sales Revenue',
      `Client Order: ${order.customer_name} (${order.status})`,
      isCancelled ? 'Expense/Refund' : 'Income',
      `${isCancelled ? '-' : '+'}₱${amountNum.toFixed(2)}`,
      `₱${runningBalance.toFixed(2)}`,
    ]);
  });

  stockLogs.forEach((log: any) => {
    if (log.change_type === 'ADDITION') {
      const cost = Number(log.quantity || 0) * Number(log.products?.unit_price || 15) * 0.6;
      ledgerRows.push([
        `STK-${log.id.slice(0, 6).toUpperCase()}`,
        new Date(log.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        'Inventory Restock',
        `Supplier Restock: ${log.products?.name || 'Stock In'} (${log.quantity} units)`,
        'Expense',
        `-₱${cost.toFixed(2)}`,
        `₱${runningBalance.toFixed(2)}`,
      ]);
    }
  });

  const ledgerSheetData = [
    ['MINI-ERP GENERAL LEDGER & CASHFLOW JOURNAL'],
    [`Total Entries: ${ledgerRows.length}`, `Report Date: ${reportDateStr}`],
    [],
    ledgerHeader,
    ...ledgerRows,
  ];

  const ledgerSheet = XLSX.utils.aoa_to_sheet(ledgerSheetData);
  ledgerSheet['!cols'] = fitToColumn(ledgerSheetData);
  XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'General Ledger');

  // -------------------------------------------------------------
  // TAB 4: PRODUCT CATALOG & INVENTORY VALUATION
  // -------------------------------------------------------------
  const inventoryHeader = [
    'SKU',
    'Furniture Piece Name',
    'Collection Category',
    'Unit Price (₱)',
    'Stock Units',
    'Reorder Threshold',
    'Stock Status',
    'Inventory Valuation (₱)',
  ];

  const inventoryRows = products.map((prod) => {
    const valuation = Number(prod.stock_count || 0) * Number(prod.unit_price || 0);
    return [
      prod.sku || 'N/A',
      prod.name || 'Unnamed Item',
      prod.category || 'General',
      Number(prod.unit_price || 0).toFixed(2),
      Number(prod.stock_count || 0),
      Number(prod.reorder_level || 10),
      prod.status || 'IN STOCK',
      valuation.toFixed(2),
    ];
  });

  const inventorySheetData = [
    ['MINI-ERP FURNITURE INVENTORY & ASSET VALUATION'],
    [`Total Catalog SKUs: ${products.length}`, `Total Stock Valuation: ₱${totalInventoryValuation.toFixed(2)}`],
    [],
    inventoryHeader,
    ...inventoryRows,
  ];

  const inventorySheet = XLSX.utils.aoa_to_sheet(inventorySheetData);
  inventorySheet['!cols'] = fitToColumn(inventorySheetData);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Valuation');

  // -------------------------------------------------------------
  // TAB 5: INVOICES & RECEIVABLES (If invoices exist)
  // -------------------------------------------------------------
  if (invoices.length > 0) {
    const invoiceHeader = [
      'Invoice Number',
      'Customer Name',
      'Amount (₱)',
      'Due Date',
      'Status',
      'Created Date',
    ];

    const invoiceRows = invoices.map((inv) => [
      inv.invoice_number,
      inv.customer_name,
      Number(inv.amount || 0).toFixed(2),
      inv.due_date,
      inv.status,
      new Date(inv.created_at).toLocaleDateString('en-US'),
    ]);

    const invoiceSheetData = [
      ['MINI-ERP INVOICES & RECEIVABLES REPORT'],
      [`Total Invoices: ${invoices.length}`, `Report Date: ${reportDateStr}`],
      [],
      invoiceHeader,
      ...invoiceRows,
    ];

    const invoiceSheet = XLSX.utils.aoa_to_sheet(invoiceSheetData);
    invoiceSheet['!cols'] = fitToColumn(invoiceSheetData);
    XLSX.utils.book_append_sheet(workbook, invoiceSheet, 'Invoices & Receivables');
  }

  // 4. Trigger Dynamic Excel File Download in Browser
  const fileName = `${options.fileNamePrefix || 'Mini_ERP_Sales_Financial_Report'}_${isoDateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return {
    success: true,
    fileName,
    totalOrders: orders.length,
    grossRevenue,
    netProfit,
  };
}

/**
 * Dynamically queries live Supabase database and exports full enterprise
 * audit trails, operational stock movements, order lifecycle events, and security logs into an Excel spreadsheet.
 */
export async function exportAuditLogsReport(options: ExportReportOptions = {}) {
  const supabase = createClient();

  const [stockLogsRes, ordersRes, productsRes, profilesRes] = await Promise.all([
    supabase.from('stock_logs').select('*, products(name, sku, unit_price)').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ]);

  const stockLogs = stockLogsRes.data || [];
  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const profiles = profilesRes.data || [];

  const now = new Date();
  const reportDateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const reportTimeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const isoDateStr = now.toISOString().split('T')[0];

  // Synthesize unified activity trail
  const activityTrail: (string | number)[][] = [];
  let additionsCount = 0;
  let deductionsCount = 0;
  let alertsCount = 0;

  // Stock logs
  stockLogs.forEach((log: any) => {
    const isAdd = log.change_type === 'ADDITION';
    const isDed = log.change_type === 'DEDUCTION';
    if (isAdd) additionsCount++;
    if (isDed) deductionsCount++;

    activityTrail.push([
      `LOG-STK-${log.id.slice(0, 8)}`,
      new Date(log.created_at).toLocaleString('en-US'),
      'Inventory',
      isAdd ? 'STOCK_ADDITION' : isDed ? 'STOCK_DEDUCTION' : 'STOCK_ADJUSTMENT',
      log.products?.name || 'Inventory Item',
      log.products?.sku ? `SKU: ${log.products.sku}` : 'General',
      `${Number(log.quantity) > 0 ? '+' : ''}${log.quantity} units`,
      isAdd ? 'Supplier Restock' : isDed ? 'Order Fulfillment' : 'Inventory Admin',
      isAdd ? 'SUCCESS' : 'INFO',
      log.reason || 'Stock level updated',
    ]);
  });

  // Orders
  orders.forEach((order: any) => {
    const isComp = order.status === 'COMPLETED';
    const isCanc = order.status === 'CANCELLED';

    activityTrail.push([
      `LOG-ORD-${order.id.slice(0, 8)}`,
      new Date(order.created_at).toLocaleString('en-US'),
      'Sales & Orders',
      isComp ? 'ORDER_COMPLETED' : isCanc ? 'ORDER_CANCELLED' : 'ORDER_CREATED',
      order.order_number || `ORD-${order.id.slice(0, 6)}`,
      `Client: ${order.customer_name}`,
      `₱${Number(order.total_amount || 0).toFixed(2)}`,
      order.created_by_role || 'Sales Rep',
      isComp ? 'SUCCESS' : isCanc ? 'WARNING' : 'INFO',
      `Order for ${order.customer_name} (${order.status}). Amount: ₱${Number(order.total_amount || 0).toFixed(2)}`,
    ]);
  });

  // Products
  products.forEach((prod: any) => {
    activityTrail.push([
      `LOG-PRD-${prod.id.slice(0, 8)}`,
      new Date(prod.created_at || now).toLocaleString('en-US'),
      'Catalog',
      'PRODUCT_CATALOGED',
      prod.name,
      `SKU: ${prod.sku}`,
      `${prod.stock_count} units (₱${Number(prod.unit_price || 0).toFixed(2)})`,
      'Inventory Admin',
      'INFO',
      `Cataloged piece "${prod.name}" in ${prod.category} collection.`,
    ]);

    if (Number(prod.stock_count) <= Number(prod.reorder_level)) {
      alertsCount++;
      activityTrail.push([
        `ALERT-STK-${prod.id.slice(0, 8)}`,
        new Date(prod.updated_at || prod.created_at || now).toLocaleString('en-US'),
        'Inventory',
        prod.stock_count === 0 ? 'OUT_OF_STOCK_TRIGGER' : 'LOW_STOCK_TRIGGER',
        prod.name,
        `SKU: ${prod.sku}`,
        `${prod.stock_count} units left`,
        'System Guard',
        'WARNING',
        `Low stock alert: ${prod.name} has ${prod.stock_count} units remaining (threshold: ${prod.reorder_level}).`,
      ]);
    }
  });

  // Profiles
  profiles.forEach((prof: any) => {
    activityTrail.push([
      `LOG-USR-${prof.id.slice(0, 8)}`,
      new Date(prof.created_at || now).toLocaleString('en-US'),
      'User & Auth',
      'STAFF_REGISTERED',
      prof.full_name,
      `Role: ${prof.role}`,
      prof.role,
      'System Admin',
      'SECURITY',
      `Staff user registered for ${prof.full_name} (${prof.email}) with ${prof.role} role.`,
    ]);
  });

  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // TAB 1: AUDIT SUMMARY & METRICS
  // -------------------------------------------------------------
  const summaryData: (string | number)[][] = [
    ['MINI-ERP LUXURY FURNITURE & INTERIOR LIVING'],
    ['ENTERPRISE AUDIT TRAIL & SYSTEM ACTIVITY LOGS REPORT'],
    ['Generated On:', `${reportDateStr} at ${reportTimeStr}`],
    ['Database Source:', 'Supabase Live Production Database'],
    [],
    ['AUDIT METRIC CATEGORY', 'COUNT / VALUE', 'AUDIT DESCRIPTION'],
    ['Total System Activity Events', activityTrail.length, 'All aggregated audit, inventory, order, and user actions'],
    ['Stock Additions (Restocks)', additionsCount, 'Supplier stock intake and catalog warehouse replenishments'],
    ['Stock Deductions (Fulfillments)', deductionsCount, 'Stock deducted upon customer order completions'],
    ['Security Alerts & Warnings', alertsCount, 'Low-stock triggers and sensitive system operations'],
    ['Active Product Catalog SKUs', products.length, 'Monitored luxury furniture pieces in catalog'],
    ['Total Customer Orders Monitored', orders.length, 'Sales transactions tracked in audit ledger'],
    ['Registered Enterprise Staff', profiles.length, 'Active staff and administrator accounts with logged access'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = fitToColumn(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Audit Summary');

  // -------------------------------------------------------------
  // TAB 2: COMPLETE ACTIVITY FEED
  // -------------------------------------------------------------
  const activityHeader = [
    'Log ID',
    'Date & Time',
    'Module',
    'Action Type',
    'Target Entity',
    'Reference / SKU',
    'Impact / Quantity',
    'Actor / Performed By',
    'Level',
    'Details & Description',
  ];

  const activitySheetData = [
    ['MINI-ERP UNIFIED SYSTEM ACTIVITY FEED'],
    [`Total Logged Events: ${activityTrail.length}`, `Report Date: ${reportDateStr}`],
    [],
    activityHeader,
    ...activityTrail,
  ];

  const activitySheet = XLSX.utils.aoa_to_sheet(activitySheetData);
  activitySheet['!cols'] = fitToColumn(activitySheetData);
  XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activity Feed');

  // -------------------------------------------------------------
  // TAB 3: STOCK MOVEMENTS DETAIL
  // -------------------------------------------------------------
  const stockHeader = [
    'Stock Log ID',
    'Date & Time',
    'Movement Type',
    'Product Name',
    'SKU Code',
    'Quantity Changed',
    'Unit Value (₱)',
    'Reason / Memo',
  ];

  const stockRows = stockLogs.map((log: any) => [
    `STK-${log.id.slice(0, 8)}`,
    new Date(log.created_at).toLocaleString('en-US'),
    log.change_type,
    log.products?.name || 'Stock Item',
    log.products?.sku || 'N/A',
    `${Number(log.quantity) > 0 ? '+' : ''}${log.quantity}`,
    Number(log.products?.unit_price || 0).toFixed(2),
    log.reason || 'Operational stock change',
  ]);

  const stockSheetData = [
    ['MINI-ERP STOCK MOVEMENT AUDIT LOGS'],
    [`Total Stock Logs: ${stockLogs.length}`, `Report Date: ${reportDateStr}`],
    [],
    stockHeader,
    ...stockRows,
  ];

  const stockSheet = XLSX.utils.aoa_to_sheet(stockSheetData);
  stockSheet['!cols'] = fitToColumn(stockSheetData);
  XLSX.utils.book_append_sheet(workbook, stockSheet, 'Stock Movement Logs');

  // -------------------------------------------------------------
  // TAB 4: SALES & ORDER TRANSACTIONS AUDIT
  // -------------------------------------------------------------
  const orderHeader = [
    'Order Number',
    'Customer Name',
    'Created Date',
    'Status',
    'Total Amount (₱)',
    'Created By Role',
    'Order ID',
  ];

  const orderRows = orders.map((o: any) => [
    o.order_number || `ORD-${o.id.slice(0, 6)}`,
    o.customer_name,
    new Date(o.created_at).toLocaleString('en-US'),
    o.status,
    Number(o.total_amount || 0).toFixed(2),
    o.created_by_role || 'Sales Rep',
    o.id,
  ]);

  const orderSheetData = [
    ['MINI-ERP SALES & ORDERS AUDIT TRAIL'],
    [`Total Orders: ${orders.length}`, `Report Date: ${reportDateStr}`],
    [],
    orderHeader,
    ...orderRows,
  ];

  const orderSheet = XLSX.utils.aoa_to_sheet(orderSheetData);
  orderSheet['!cols'] = fitToColumn(orderSheetData);
  XLSX.utils.book_append_sheet(workbook, orderSheet, 'Sales & Orders Audit');

  // Trigger Download
  const fileName = `${options.fileNamePrefix || 'Mini_ERP_Audit_and_System_Logs'}_${isoDateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return {
    success: true,
    fileName,
    totalEvents: activityTrail.length,
  };
}
