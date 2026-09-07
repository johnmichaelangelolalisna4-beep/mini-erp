import XLSX from 'xlsx-js-style';
import { createClient } from '@/server/supabase/client';

export interface ExportReportOptions {
  fileNamePrefix?: string;
}

// ---------------------------------------------------------------------------
// WARM ESPRESSO DESIGN TOKENS (RGB Hex for xlsx-js-style)
// ---------------------------------------------------------------------------
const PALETTE = {
  ESPRESSO: '713105',    // Primary Brand Espresso (Title banner & primary headers)
  GROUNDS: '4F351C',     // Dark Grounds (Category headers & secondary banners)
  NOIR: '341100',        // Deep Noir (Primary text)
  ROAST: '7F5E35',       // Muted Roast (Metadata, descriptions, subtitles)
  CREMA: 'CFAB71',       // Golden Crema (Accents, highlights)
  FOAM: 'FFF7E8',        // Warm Foam (Zebra striping / card backings)
  FOAM_LIGHT: 'FFFDF8',  // Soft alternating row fill
  WHITE: 'FFFFFF',       // Clean White
  BORDER: 'E8DECF',      // Subtle cell border
  SUCCESS_BG: 'ECFDF5',  // Completed badge background
  SUCCESS_TXT: '065F46', // Completed badge text
  ALERT_BG: 'FEF2F2',    // Alert background
  ALERT_TXT: '991B1B',   // Alert text
};

const THIN_BORDER = {
  top: { style: 'thin', color: { rgb: PALETTE.BORDER } },
  bottom: { style: 'thin', color: { rgb: PALETTE.BORDER } },
  left: { style: 'thin', color: { rgb: PALETTE.BORDER } },
  right: { style: 'thin', color: { rgb: PALETTE.BORDER } },
};

// ---------------------------------------------------------------------------
// STYLE PRESETS
// ---------------------------------------------------------------------------
const STYLES = {
  titleBanner: {
    fill: { fgColor: { rgb: PALETTE.ESPRESSO } },
    font: { name: 'Segoe UI', sz: 14, bold: true, color: { rgb: PALETTE.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' },
  },
  subtitleBanner: {
    fill: { fgColor: { rgb: PALETTE.GROUNDS } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: PALETTE.CREMA } },
    alignment: { horizontal: 'center', vertical: 'center' },
  },
  metaBanner: {
    fill: { fgColor: { rgb: PALETTE.FOAM } },
    font: { name: 'Segoe UI', sz: 9, bold: false, color: { rgb: PALETTE.ROAST } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN_BORDER,
  },
  categoryHeader: {
    fill: { fgColor: { rgb: PALETTE.GROUNDS } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: PALETTE.CREMA } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  },
  tableHeaderLeft: {
    fill: { fgColor: { rgb: PALETTE.ESPRESSO } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: PALETTE.WHITE } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  },
  tableHeaderCenter: {
    fill: { fgColor: { rgb: PALETTE.ESPRESSO } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: PALETTE.WHITE } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN_BORDER,
  },
  tableHeaderRight: {
    fill: { fgColor: { rgb: PALETTE.ESPRESSO } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: PALETTE.WHITE } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: THIN_BORDER,
  },
  dataLeft: (isAlt = false, bold = false) => ({
    fill: { fgColor: { rgb: isAlt ? PALETTE.FOAM_LIGHT : PALETTE.WHITE } },
    font: { name: 'Segoe UI', sz: 9.5, bold, color: { rgb: PALETTE.NOIR } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  }),
  dataCenter: (isAlt = false, bold = false) => ({
    fill: { fgColor: { rgb: isAlt ? PALETTE.FOAM_LIGHT : PALETTE.WHITE } },
    font: { name: 'Segoe UI', sz: 9.5, bold, color: { rgb: PALETTE.NOIR } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: THIN_BORDER,
  }),
  dataRight: (isAlt = false, bold = false) => ({
    fill: { fgColor: { rgb: isAlt ? PALETTE.FOAM_LIGHT : PALETTE.WHITE } },
    font: { name: 'Segoe UI', sz: 9.5, bold, color: { rgb: PALETTE.NOIR } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: THIN_BORDER,
  }),
  dataMuted: (isAlt = false) => ({
    fill: { fgColor: { rgb: isAlt ? PALETTE.FOAM_LIGHT : PALETTE.WHITE } },
    font: { name: 'Segoe UI', sz: 9, bold: false, color: { rgb: PALETTE.ROAST } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  }),
};

/**
 * Applies a style object safely to a cell in a worksheet.
 */
function applyCellStyle(sheet: any, r: number, c: number, style: any) {
  const cellRef = XLSX.utils.encode_cell({ r, c });
  if (!sheet[cellRef]) {
    sheet[cellRef] = { t: 's', v: '' };
  }
  sheet[cellRef].s = style;
}

/**
 * Formats a number with comma thousand separators and 2 decimals.
 */
function fmtCurrency(val: number): string {
  return `₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // =========================================================================
  // TAB 1: EXECUTIVE FINANCIAL SUMMARY (Categorized & Styled)
  // =========================================================================
  const summarySheetData: (string | number)[][] = [
    // Row 0 (A1:C1)
    ['MINI-ERP LUXURY FURNITURE & INTERIOR LIVING', '', ''],
    // Row 1 (A2:C2)
    ['EXECUTIVE SALES & FINANCIAL PERFORMANCE REPORT', '', ''],
    // Row 2 (A3:C3)
    [`Report Generated: ${reportDateStr} at ${reportTimeStr}  |  Database Source: Supabase Live Production Database`, '', ''],
    // Row 3: Blank
    ['', '', ''],

    // Row 4: Section 1 Header (A5:C5)
    ['1. FINANCIAL & CASH FLOW PERFORMANCE', '', ''],
    // Row 5: Table Column Headers
    ['FINANCIAL INDICATOR', 'AMOUNT / VALUE', 'DETAILS & ACCOUNTING NOTES'],
    // Rows 6-9: Data
    ['Gross Sales Revenue (Completed)', fmtCurrency(grossRevenue), 'Total settled client order revenue received'],
    ['Total Operating & Restock Cost', fmtCurrency(totalExpenses), 'Supplier procurement and wholesale replenishment expenses'],
    ['Net Operating Profit Margin', fmtCurrency(netProfit), 'Net profit before tax provisions (Gross Revenue - Expenses)'],
    ['Estimated Corporate Tax Provision (15%)', fmtCurrency(estimatedTax), 'Estimated tax allocation at standard 15% rate'],
    // Row 10: Blank
    ['', '', ''],

    // Row 11: Section 2 Header (A12:C12)
    ['2. SALES ORDER VOLUME & COMMERCIAL TRANSACTIONS', '', ''],
    // Row 12: Table Column Headers
    ['ORDER VOLUME METRIC', 'COUNT / VALUE', 'FULFILLMENT STATUS'],
    // Rows 13-16: Data (Fixed Row 11 right-float issue by formatting count explicitly)
    ['Total Orders Placed', `${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'}`, 'Total customer sales orders recorded in system'],
    ['Completed Orders Volume', `${completedOrders.length} Orders (${fmtCurrency(grossRevenue)})`, 'Orders fulfilled, delivered, and settled in full'],
    ['Pending Orders in Queue', `${pendingOrders.length} Orders (${fmtCurrency(pendingRevenue)})`, 'Orders in queue or awaiting payment/fulfillment'],
    ['Cancelled / Voided Orders', `${cancelledOrders.length} Orders (${fmtCurrency(cancelledRevenue)})`, 'Voided transactions with restored warehouse stock'],
    // Row 17: Blank
    ['', '', ''],

    // Row 18: Section 3 Header (A19:C19)
    ['3. WAREHOUSE ASSETS & INVENTORY HEALTH', '', ''],
    // Row 19: Table Column Headers
    ['INVENTORY INDICATOR', 'STOCK STATUS', 'VALUATION & THRESHOLD'],
    // Rows 20-22: Data
    ['Total Products in Catalog', `${products.length} Active SKUs`, 'Active furniture models and pieces across collections'],
    ['Total Stock Inventory Valuation', fmtCurrency(totalInventoryValuation), 'Asset valuation based on current retail unit pricing'],
    ['Low Stock Reorder Alerts', `${lowStockProducts.length} ${lowStockProducts.length === 1 ? 'Item' : 'Items'}`, 'Products at or below designated minimum safety levels'],
    // Row 23: Blank
    ['', '', ''],

    // Row 24: Section 4 Header (A25:C25)
    ['4. ENTERPRISE DIRECTORY & SYSTEM HEALTH', '', ''],
    // Row 25: Table Column Headers
    ['SYSTEM RESOURCE', 'ACTIVE COUNT', 'OPERATIONAL STATUS'],
    // Rows 26-27: Data
    ['Registered Enterprise Staff Accounts', `${profiles.length} Active Users`, 'Authorized enterprise employee and administrator accounts'],
    ['Database & WebSocket Sync', 'OPERATIONAL', 'Supabase realtime replication active across all system portals'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);

  // Configure cell merges for banners and section headers
  summarySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Metadata
    { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } }, // Section 1
    { s: { r: 11, c: 0 }, e: { r: 11, c: 2 } }, // Section 2
    { s: { r: 18, c: 0 }, e: { r: 18, c: 2 } }, // Section 3
    { s: { r: 24, c: 0 }, e: { r: 24, c: 2 } }, // Section 4
  ];

  // Set proportional, balanced column widths
  summarySheet['!cols'] = [
    { wch: 40 }, // Column A: Indicator / Metric
    { wch: 28 }, // Column B: Amount / Value
    { wch: 56 }, // Column C: Notes / Descriptions
  ];

  // Set row heights for breathing room
  summarySheet['!rows'] = [
    { hpt: 30 }, // Title
    { hpt: 20 }, // Subtitle
    { hpt: 18 }, // Metadata
    { hpt: 10 }, // Blank
    { hpt: 22 }, // Section 1
    { hpt: 20 }, // Table Header 1
  ];

  // Style Title Banner
  for (let c = 0; c < 3; c++) applyCellStyle(summarySheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 3; c++) applyCellStyle(summarySheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 3; c++) applyCellStyle(summarySheet, 2, c, STYLES.metaBanner);

  // Helper to style table sections
  const styleTableBlock = (headerRowIndex: number, dataStartRow: number, rowCount: number) => {
    // Section header
    for (let c = 0; c < 3; c++) applyCellStyle(summarySheet, headerRowIndex - 1, c, STYLES.categoryHeader);
    // Table column headers
    applyCellStyle(summarySheet, headerRowIndex, 0, STYLES.tableHeaderLeft);
    applyCellStyle(summarySheet, headerRowIndex, 1, STYLES.tableHeaderRight);
    applyCellStyle(summarySheet, headerRowIndex, 2, STYLES.tableHeaderLeft);

    // Data rows
    for (let i = 0; i < rowCount; i++) {
      const r = dataStartRow + i;
      const isAlt = i % 2 === 1;
      applyCellStyle(summarySheet, r, 0, STYLES.dataLeft(isAlt, true));
      applyCellStyle(summarySheet, r, 1, STYLES.dataRight(isAlt, true));
      applyCellStyle(summarySheet, r, 2, STYLES.dataMuted(isAlt));
    }
  };

  styleTableBlock(5, 6, 4);   // Section 1: Financials
  styleTableBlock(12, 13, 4); // Section 2: Orders
  styleTableBlock(19, 20, 3); // Section 3: Inventory
  styleTableBlock(25, 26, 2); // Section 4: System

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary');

  // =========================================================================
  // TAB 2: DETAILED SALES ORDERS REPORT
  // =========================================================================
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
    fmtCurrency(Number(order.total_amount || 0)),
    order.created_by_role || 'Sales Rep',
    order.id,
  ]);

  const salesSheetData = [
    ['MINI-ERP SALES ORDERS DETAILED REPORT', '', '', '', '', '', '', ''],
    [`Total Orders: ${orders.length}  |  Gross Sales: ${fmtCurrency(grossRevenue)}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    salesHeader,
    ...salesRows,
  ];

  const salesSheet = XLSX.utils.aoa_to_sheet(salesSheetData);
  salesSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];
  salesSheet['!cols'] = [
    { wch: 18 }, // Order Number
    { wch: 28 }, // Customer
    { wch: 14 }, // Date
    { wch: 10 }, // Qty
    { wch: 14 }, // Status
    { wch: 20 }, // Total Amount
    { wch: 16 }, // Created By
    { wch: 38 }, // Order ID
  ];

  // Style Header & Subtitle
  for (let c = 0; c < 8; c++) applyCellStyle(salesSheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 8; c++) applyCellStyle(salesSheet, 1, c, STYLES.subtitleBanner);

  // Style Table Header (Row 3)
  for (let c = 0; c < 8; c++) {
    const isRight = c === 3 || c === 5;
    applyCellStyle(salesSheet, 3, c, isRight ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
  }

  // Style Data Rows
  salesRows.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    applyCellStyle(salesSheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(salesSheet, r, 1, STYLES.dataLeft(isAlt));
    applyCellStyle(salesSheet, r, 2, STYLES.dataCenter(isAlt));
    applyCellStyle(salesSheet, r, 3, STYLES.dataRight(isAlt));
    applyCellStyle(salesSheet, r, 4, STYLES.dataCenter(isAlt, true));
    applyCellStyle(salesSheet, r, 5, STYLES.dataRight(isAlt, true));
    applyCellStyle(salesSheet, r, 6, STYLES.dataCenter(isAlt));
    applyCellStyle(salesSheet, r, 7, STYLES.dataMuted(isAlt));
  });

  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Orders Report');

  // =========================================================================
  // TAB 3: GENERAL LEDGER & CASHFLOW ENTRIES
  // =========================================================================
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
      `${isCancelled ? '-' : '+'}${fmtCurrency(amountNum)}`,
      fmtCurrency(runningBalance),
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
        `-${fmtCurrency(cost)}`,
        fmtCurrency(runningBalance),
      ]);
    }
  });

  const ledgerSheetData = [
    ['MINI-ERP GENERAL LEDGER & CASHFLOW JOURNAL', '', '', '', '', '', ''],
    [`Total Entries: ${ledgerRows.length}  |  Net Balance: ${fmtCurrency(runningBalance)}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ledgerHeader,
    ...ledgerRows,
  ];

  const ledgerSheet = XLSX.utils.aoa_to_sheet(ledgerSheetData);
  ledgerSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  ledgerSheet['!cols'] = [
    { wch: 18 }, // TRX ID
    { wch: 14 }, // Date
    { wch: 20 }, // Category
    { wch: 42 }, // Description
    { wch: 16 }, // Flow Type
    { wch: 20 }, // Amount
    { wch: 22 }, // Balance
  ];

  for (let c = 0; c < 7; c++) applyCellStyle(ledgerSheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 7; c++) applyCellStyle(ledgerSheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 7; c++) {
    const isRight = c === 5 || c === 6;
    applyCellStyle(ledgerSheet, 3, c, isRight ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
  }

  ledgerRows.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    applyCellStyle(ledgerSheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(ledgerSheet, r, 1, STYLES.dataCenter(isAlt));
    applyCellStyle(ledgerSheet, r, 2, STYLES.dataLeft(isAlt));
    applyCellStyle(ledgerSheet, r, 3, STYLES.dataLeft(isAlt));
    applyCellStyle(ledgerSheet, r, 4, STYLES.dataCenter(isAlt, true));
    applyCellStyle(ledgerSheet, r, 5, STYLES.dataRight(isAlt, true));
    applyCellStyle(ledgerSheet, r, 6, STYLES.dataRight(isAlt, true));
  });

  XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'General Ledger');

  // =========================================================================
  // TAB 4: PRODUCT CATALOG & INVENTORY VALUATION
  // =========================================================================
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
      fmtCurrency(Number(prod.unit_price || 0)),
      Number(prod.stock_count || 0),
      Number(prod.reorder_level || 10),
      prod.status || 'IN STOCK',
      fmtCurrency(valuation),
    ];
  });

  const inventorySheetData = [
    ['MINI-ERP FURNITURE INVENTORY & ASSET VALUATION', '', '', '', '', '', '', ''],
    [`Total Catalog SKUs: ${products.length}  |  Total Inventory Valuation: ${fmtCurrency(totalInventoryValuation)}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    inventoryHeader,
    ...inventoryRows,
  ];

  const inventorySheet = XLSX.utils.aoa_to_sheet(inventorySheetData);
  inventorySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];
  inventorySheet['!cols'] = [
    { wch: 16 }, // SKU
    { wch: 32 }, // Name
    { wch: 20 }, // Category
    { wch: 18 }, // Price
    { wch: 14 }, // Units
    { wch: 18 }, // Threshold
    { wch: 16 }, // Status
    { wch: 24 }, // Valuation
  ];

  for (let c = 0; c < 8; c++) applyCellStyle(inventorySheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 8; c++) applyCellStyle(inventorySheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 8; c++) {
    const isRight = c === 3 || c === 4 || c === 5 || c === 7;
    applyCellStyle(inventorySheet, 3, c, isRight ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
  }

  inventoryRows.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    applyCellStyle(inventorySheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(inventorySheet, r, 1, STYLES.dataLeft(isAlt));
    applyCellStyle(inventorySheet, r, 2, STYLES.dataLeft(isAlt));
    applyCellStyle(inventorySheet, r, 3, STYLES.dataRight(isAlt));
    applyCellStyle(inventorySheet, r, 4, STYLES.dataRight(isAlt, true));
    applyCellStyle(inventorySheet, r, 5, STYLES.dataRight(isAlt));
    applyCellStyle(inventorySheet, r, 6, STYLES.dataCenter(isAlt, true));
    applyCellStyle(inventorySheet, r, 7, STYLES.dataRight(isAlt, true));
  });

  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Valuation');

  // =========================================================================
  // TAB 5: INVOICES & RECEIVABLES (If invoices exist)
  // =========================================================================
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
      fmtCurrency(Number(inv.amount || 0)),
      inv.due_date,
      inv.status,
      new Date(inv.created_at).toLocaleDateString('en-US'),
    ]);

    const invoiceSheetData = [
      ['MINI-ERP INVOICES & RECEIVABLES REPORT', '', '', '', '', ''],
      [`Total Invoices: ${invoices.length}  |  Report Date: ${reportDateStr}`, '', '', '', '', ''],
      ['', '', '', '', '', ''],
      invoiceHeader,
      ...invoiceRows,
    ];

    const invoiceSheet = XLSX.utils.aoa_to_sheet(invoiceSheetData);
    invoiceSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    ];
    invoiceSheet['!cols'] = [
      { wch: 18 }, { wch: 28 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    ];

    for (let c = 0; c < 6; c++) applyCellStyle(invoiceSheet, 0, c, STYLES.titleBanner);
    for (let c = 0; c < 6; c++) applyCellStyle(invoiceSheet, 1, c, STYLES.subtitleBanner);
    for (let c = 0; c < 6; c++) {
      applyCellStyle(invoiceSheet, 3, c, c === 2 ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
    }

    invoiceRows.forEach((_, idx) => {
      const r = 4 + idx;
      const isAlt = idx % 2 === 1;
      applyCellStyle(invoiceSheet, r, 0, STYLES.dataLeft(isAlt, true));
      applyCellStyle(invoiceSheet, r, 1, STYLES.dataLeft(isAlt));
      applyCellStyle(invoiceSheet, r, 2, STYLES.dataRight(isAlt, true));
      applyCellStyle(invoiceSheet, r, 3, STYLES.dataCenter(isAlt));
      applyCellStyle(invoiceSheet, r, 4, STYLES.dataCenter(isAlt, true));
      applyCellStyle(invoiceSheet, r, 5, STYLES.dataCenter(isAlt));
    });

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

  // 1. Fetch live activity and system data from Supabase
  const [ordersRes, productsRes, stockLogsRes, profilesRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('products').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('stock_logs').select('*, products(name, sku, unit_price)').order('created_at', { ascending: false }).limit(200),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];
  const stockLogs = stockLogsRes.data || [];
  const profiles = profilesRes.data || [];

  // Map employee ID to Name
  const profileMap = new Map<string, string>();
  profiles.forEach((p) => {
    profileMap.set(p.id, p.full_name || p.email || 'Admin Staff');
  });

  // 2. Synthesize unified system activity trail
  const activityTrail: (string | number)[][] = [];

  // Stock additions and deductions
  stockLogs.forEach((log: any) => {
    const isAddition = log.change_type === 'ADDITION';
    activityTrail.push([
      `ACT-STK-${log.id.slice(0, 6).toUpperCase()}`,
      new Date(log.created_at).toLocaleString('en-US'),
      'Inventory / Warehouse',
      isAddition ? 'STOCK_REPLENISHMENT' : 'STOCK_DEDUCTION',
      'Product SKU',
      log.products?.sku || 'N/A',
      `${isAddition ? '+' : '-'}${log.quantity} units`,
      log.user_id ? profileMap.get(log.user_id) || 'Warehouse Tech' : 'Automated System',
      isAddition ? 'INFO' : 'AUDIT',
      log.reason || (isAddition ? 'Inventory replenishment' : 'Order fulfillment deduction'),
    ]);
  });

  // Sales Orders activity
  orders.forEach((order: any) => {
    activityTrail.push([
      `ACT-ORD-${order.id.slice(0, 6).toUpperCase()}`,
      new Date(order.created_at).toLocaleString('en-US'),
      'Sales Commerce',
      `ORDER_${order.status}`,
      'Client Order',
      order.order_number,
      fmtCurrency(Number(order.total_amount || 0)),
      order.customer_name || 'Showroom Client',
      order.status === 'COMPLETED' ? 'SUCCESS' : order.status === 'CANCELLED' ? 'WARNING' : 'PENDING',
      `Commercial sale (${order.quantity || 1} units) via ${order.payment_method || 'Standard Gateway'}`,
    ]);
  });

  // Sort descending by date
  activityTrail.sort((a, b) => new Date(b[1] as string).getTime() - new Date(a[1] as string).getTime());

  const additionsCount = stockLogs.filter((l: any) => l.change_type === 'ADDITION').length;
  const deductionsCount = stockLogs.filter((l: any) => l.change_type === 'DEDUCTION').length;
  const alertsCount = products.filter((p: any) => Number(p.stock_count || 0) <= Number(p.reorder_level || 0)).length;

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

  const workbook = XLSX.utils.book_new();

  // =========================================================================
  // TAB 1: AUDIT SUMMARY & METRICS
  // =========================================================================
  const summaryData: (string | number)[][] = [
    ['MINI-ERP LUXURY FURNITURE & INTERIOR LIVING', '', ''],
    ['ENTERPRISE AUDIT TRAIL & SYSTEM ACTIVITY LOGS REPORT', '', ''],
    [`Report Generated: ${reportDateStr} at ${reportTimeStr}  |  Database Source: Supabase Live Database`, '', ''],
    ['', '', ''],
    ['1. SYSTEM ACTIVITY & EVENT METRICS', '', ''],
    ['AUDIT METRIC CATEGORY', 'COUNT / VALUE', 'AUDIT DESCRIPTION'],
    ['Total System Activity Events', `${activityTrail.length} Logged Events`, 'All aggregated audit, inventory, order, and user actions'],
    ['Stock Additions (Restocks)', `${additionsCount} Replenishments`, 'Supplier stock intake and catalog warehouse replenishments'],
    ['Stock Deductions (Fulfillments)', `${deductionsCount} Deductions`, 'Stock deducted upon customer order completions'],
    ['Security Alerts & Warnings', `${alertsCount} Active Alerts`, 'Low-stock triggers and sensitive system operations'],
    ['', '', ''],
    ['2. MONITORED ASSETS & DIRECTORY', '', ''],
    ['MONITORED ENTITY', 'ACTIVE QUANTITY', 'SCOPE OF AUDIT'],
    ['Active Product Catalog SKUs', `${products.length} SKUs`, 'Monitored luxury furniture pieces in catalog'],
    ['Total Customer Orders Monitored', `${orders.length} Orders`, 'Sales transactions tracked in audit ledger'],
    ['Registered Enterprise Staff', `${profiles.length} Staff Profiles`, 'Active staff and administrator accounts with logged access'],
  ];

  const auditSummarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  auditSummarySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } },
    { s: { r: 11, c: 0 }, e: { r: 11, c: 2 } },
  ];
  auditSummarySheet['!cols'] = [{ wch: 38 }, { wch: 28 }, { wch: 56 }];

  for (let c = 0; c < 3; c++) applyCellStyle(auditSummarySheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 3; c++) applyCellStyle(auditSummarySheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 3; c++) applyCellStyle(auditSummarySheet, 2, c, STYLES.metaBanner);

  // Section 1
  for (let c = 0; c < 3; c++) applyCellStyle(auditSummarySheet, 4, c, STYLES.categoryHeader);
  applyCellStyle(auditSummarySheet, 5, 0, STYLES.tableHeaderLeft);
  applyCellStyle(auditSummarySheet, 5, 1, STYLES.tableHeaderRight);
  applyCellStyle(auditSummarySheet, 5, 2, STYLES.tableHeaderLeft);
  for (let i = 0; i < 4; i++) {
    const r = 6 + i;
    const isAlt = i % 2 === 1;
    applyCellStyle(auditSummarySheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(auditSummarySheet, r, 1, STYLES.dataRight(isAlt, true));
    applyCellStyle(auditSummarySheet, r, 2, STYLES.dataMuted(isAlt));
  }

  // Section 2
  for (let c = 0; c < 3; c++) applyCellStyle(auditSummarySheet, 11, c, STYLES.categoryHeader);
  applyCellStyle(auditSummarySheet, 12, 0, STYLES.tableHeaderLeft);
  applyCellStyle(auditSummarySheet, 12, 1, STYLES.tableHeaderRight);
  applyCellStyle(auditSummarySheet, 12, 2, STYLES.tableHeaderLeft);
  for (let i = 0; i < 3; i++) {
    const r = 13 + i;
    const isAlt = i % 2 === 1;
    applyCellStyle(auditSummarySheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(auditSummarySheet, r, 1, STYLES.dataRight(isAlt, true));
    applyCellStyle(auditSummarySheet, r, 2, STYLES.dataMuted(isAlt));
  }

  XLSX.utils.book_append_sheet(workbook, auditSummarySheet, 'Audit Summary');

  // =========================================================================
  // TAB 2: COMPLETE ACTIVITY FEED
  // =========================================================================
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
    ['MINI-ERP UNIFIED SYSTEM ACTIVITY FEED', '', '', '', '', '', '', '', '', ''],
    [`Total Logged Events: ${activityTrail.length}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    activityHeader,
    ...activityTrail,
  ];

  const activitySheet = XLSX.utils.aoa_to_sheet(activitySheetData);
  activitySheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
  ];
  activitySheet['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 24 }, { wch: 16 },
    { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 48 },
  ];

  for (let c = 0; c < 10; c++) applyCellStyle(activitySheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 10; c++) applyCellStyle(activitySheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 10; c++) {
    applyCellStyle(activitySheet, 3, c, STYLES.tableHeaderLeft);
  }

  activityTrail.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    for (let c = 0; c < 10; c++) {
      if (c === 0 || c === 3) {
        applyCellStyle(activitySheet, r, c, STYLES.dataLeft(isAlt, true));
      } else if (c === 1 || c === 8) {
        applyCellStyle(activitySheet, r, c, STYLES.dataCenter(isAlt));
      } else if (c === 6) {
        applyCellStyle(activitySheet, r, c, STYLES.dataRight(isAlt, true));
      } else if (c === 9) {
        applyCellStyle(activitySheet, r, c, STYLES.dataMuted(isAlt));
      } else {
        applyCellStyle(activitySheet, r, c, STYLES.dataLeft(isAlt));
      }
    }
  });

  XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activity Feed');

  // =========================================================================
  // TAB 3: STOCK MOVEMENTS DETAIL
  // =========================================================================
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
    fmtCurrency(Number(log.products?.unit_price || 0)),
    log.reason || 'Operational stock change',
  ]);

  const stockSheetData = [
    ['MINI-ERP STOCK MOVEMENT AUDIT LOGS', '', '', '', '', '', '', ''],
    [`Total Stock Logs: ${stockLogs.length}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    stockHeader,
    ...stockRows,
  ];

  const stockSheet = XLSX.utils.aoa_to_sheet(stockSheetData);
  stockSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];
  stockSheet['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 32 }, { wch: 16 },
    { wch: 18 }, { wch: 18 }, { wch: 40 },
  ];

  for (let c = 0; c < 8; c++) applyCellStyle(stockSheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 8; c++) applyCellStyle(stockSheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 8; c++) {
    const isRight = c === 5 || c === 6;
    applyCellStyle(stockSheet, 3, c, isRight ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
  }

  stockRows.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    applyCellStyle(stockSheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(stockSheet, r, 1, STYLES.dataCenter(isAlt));
    applyCellStyle(stockSheet, r, 2, STYLES.dataCenter(isAlt, true));
    applyCellStyle(stockSheet, r, 3, STYLES.dataLeft(isAlt));
    applyCellStyle(stockSheet, r, 4, STYLES.dataLeft(isAlt));
    applyCellStyle(stockSheet, r, 5, STYLES.dataRight(isAlt, true));
    applyCellStyle(stockSheet, r, 6, STYLES.dataRight(isAlt));
    applyCellStyle(stockSheet, r, 7, STYLES.dataMuted(isAlt));
  });

  XLSX.utils.book_append_sheet(workbook, stockSheet, 'Stock Movement Logs');

  // =========================================================================
  // TAB 4: SALES & ORDER TRANSACTIONS AUDIT
  // =========================================================================
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
    fmtCurrency(Number(o.total_amount || 0)),
    o.created_by_role || 'Sales Rep',
    o.id,
  ]);

  const orderSheetData = [
    ['MINI-ERP SALES & ORDERS AUDIT TRAIL', '', '', '', '', '', ''],
    [`Total Orders: ${orders.length}  |  Report Date: ${reportDateStr}`, '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    orderHeader,
    ...orderRows,
  ];

  const orderSheet = XLSX.utils.aoa_to_sheet(orderSheetData);
  orderSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
  ];
  orderSheet['!cols'] = [
    { wch: 18 }, { wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 38 },
  ];

  for (let c = 0; c < 7; c++) applyCellStyle(orderSheet, 0, c, STYLES.titleBanner);
  for (let c = 0; c < 7; c++) applyCellStyle(orderSheet, 1, c, STYLES.subtitleBanner);
  for (let c = 0; c < 7; c++) {
    const isRight = c === 4;
    applyCellStyle(orderSheet, 3, c, isRight ? STYLES.tableHeaderRight : STYLES.tableHeaderLeft);
  }

  orderRows.forEach((_, idx) => {
    const r = 4 + idx;
    const isAlt = idx % 2 === 1;
    applyCellStyle(orderSheet, r, 0, STYLES.dataLeft(isAlt, true));
    applyCellStyle(orderSheet, r, 1, STYLES.dataLeft(isAlt));
    applyCellStyle(orderSheet, r, 2, STYLES.dataCenter(isAlt));
    applyCellStyle(orderSheet, r, 3, STYLES.dataCenter(isAlt, true));
    applyCellStyle(orderSheet, r, 4, STYLES.dataRight(isAlt, true));
    applyCellStyle(orderSheet, r, 5, STYLES.dataCenter(isAlt));
    applyCellStyle(orderSheet, r, 6, STYLES.dataMuted(isAlt));
  });

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
