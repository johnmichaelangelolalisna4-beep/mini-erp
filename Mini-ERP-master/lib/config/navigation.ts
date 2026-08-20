import React from "react";
import {
  BarChart2,
  Package,
  ShoppingCart,
  Banknote,
  Users,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  History,
  Boxes,
  Receipt,
  Home,
} from "lucide-react";

export type MetricBadgeKey = "lowStock" | "pendingOrders" | "activeStaff" | "systemLogs";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badgeKey?: MetricBadgeKey;
  badgeType?: "warning" | "espresso" | "neutral" | "accent";
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface SidebarMetrics {
  lowStock?: number;
  pendingOrders?: number;
  activeStaff?: number;
  systemLogs?: number;
}

// 1. Admin Portal Navigation Configuration
export const adminNavSections: NavSection[] = [
  {
    id: "main",
    title: "Main Menu",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/admin/dashboard",
        icon: BarChart2,
        description: "High-level summary with KPI cards and quick revenue charts.",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations Modules",
    items: [
      {
        id: "inventory",
        label: "Inventory & Products",
        href: "/admin/inventory",
        icon: Package,
        description: "View products, stock levels, categories, and low-stock alerts.",
        badgeKey: "lowStock",
        badgeType: "warning",
      },
      {
        id: "sales",
        label: "Sales & Orders",
        href: "/admin/sales",
        icon: ShoppingCart,
        description: "View transactions, pending orders, invoices, histories.",
        badgeKey: "pendingOrders",
        badgeType: "espresso",
      },
      {
        id: "finance",
        label: "Finance & Reports",
        href: "/admin/finance",
        icon: Banknote,
        description: "Ledgers, revenue vs. expense, export summary reports.",
      },
    ],
  },
  {
    id: "administration",
    title: "Administration (Admin-Only)",
    items: [
      {
        id: "users",
        label: "User Management",
        href: "/admin/users",
        icon: Users,
        description: "View active staff, register employees, assign roles.",
        badgeKey: "activeStaff",
        badgeType: "accent",
      },
      {
        id: "logs",
        label: "Audit & System Logs",
        href: "/admin/logs",
        icon: FileText,
        description: "Logs every major system action across modules.",
      },
      {
        id: "settings",
        label: "System Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Store profile, currencies, tax defaults & system status.",
      },
    ],
  },
];

// Flat list for icon rail
export const adminRailItems: NavItem[] = [
  { id: "home", label: "Dashboard Overview", href: "/admin/dashboard", icon: Home },
  { id: "inventory", label: "Inventory & Products", href: "/admin/inventory", icon: Package, badgeKey: "lowStock" },
  { id: "sales", label: "Sales & Orders", href: "/admin/sales", icon: Receipt, badgeKey: "pendingOrders" },
  { id: "finance", label: "Finance & Reports", href: "/admin/finance", icon: Banknote },
  { id: "users", label: "User Management", href: "/admin/users", icon: Users, badgeKey: "activeStaff" },
  { id: "logs", label: "Audit & System Logs", href: "/admin/logs", icon: FileText },
  { id: "settings", label: "System Settings", href: "/admin/settings", icon: Settings },
];

// 2. Inventory Portal Navigation Configuration
export const inventoryNavSections: NavSection[] = [
  {
    id: "main",
    title: "Main Menu",
    items: [
      {
        id: "overview",
        label: "Stock Overview",
        href: "/inventory/overview",
        icon: Boxes,
        description: "Macro metrics, SKUs, restock alerts & categories.",
      },
    ],
  },
  {
    id: "catalog",
    title: "Catalog & Logs",
    items: [
      {
        id: "catalog",
        label: "Products & Catalog",
        href: "/inventory/catalog",
        icon: Package,
        description: "Full Access: Add SKUs, edit stock, pricing & images.",
      },
      {
        id: "low_stock",
        label: "Low Stock & Restock",
        href: "/inventory/low-stock",
        icon: AlertTriangle,
        description: "Items below defined reorder thresholds.",
        badgeKey: "lowStock",
        badgeType: "warning",
      },
      {
        id: "logs",
        label: "Stock Movement History",
        href: "/inventory/stock-logs",
        icon: History,
        description: "Log of stock deductions & supplier additions.",
      },
    ],
  },
];

export const inventoryRailItems: NavItem[] = [
  { id: "overview", label: "Stock Overview", href: "/inventory/overview", icon: Boxes },
  { id: "catalog", label: "Products & Catalog", href: "/inventory/catalog", icon: Package },
  { id: "low_stock", label: "Low Stock & Restock", href: "/inventory/low-stock", icon: AlertTriangle, badgeKey: "lowStock" },
  { id: "logs", label: "Stock Movement History", href: "/inventory/stock-logs", icon: History },
];

// 3. Sales Portal Navigation Configuration
export const salesNavSections: NavSection[] = [
  {
    id: "main",
    title: "Main Menu",
    items: [
      {
        id: "overview",
        label: "Sales Performance",
        href: "/sales/overview",
        icon: TrendingUp,
        description: "Personal sales targets, pending invoices & quotes.",
      },
    ],
  },
  {
    id: "operations",
    title: "Operations Modules",
    items: [
      {
        id: "orders",
        label: "Sales & Orders",
        href: "/sales/orders",
        icon: ShoppingCart,
        description: "Full Access: Create orders, customer details & invoices.",
        badgeKey: "pendingOrders",
        badgeType: "espresso",
      },
      {
        id: "inventory",
        label: "View Product Stock",
        href: "/sales/inventory",
        icon: Package,
        description: "Read-Only: Check stock availability & pricing.",
      },
    ],
  },
];

export const salesRailItems: NavItem[] = [
  { id: "overview", label: "Sales Performance", href: "/sales/overview", icon: TrendingUp },
  { id: "orders", label: "Sales & Orders", href: "/sales/orders", icon: Receipt, badgeKey: "pendingOrders" },
  { id: "inventory", label: "View Product Stock (Read-Only)", href: "/sales/inventory", icon: Package },
];

/**
 * Intelligent route matching helper to handle exact and nested routes.
 */
export function isActiveRoute(currentPath: string, targetHref: string): boolean {
  if (!currentPath || !targetHref) return false;
  if (currentPath === targetHref) return true;

  // Root or base overview matches
  if (
    (targetHref === "/admin/dashboard" || targetHref === "/admin") &&
    (currentPath === "/admin" || currentPath === "/admin/dashboard")
  ) {
    return true;
  }
  if (
    (targetHref === "/inventory/overview" || targetHref === "/inventory") &&
    (currentPath === "/inventory" || currentPath === "/inventory/overview")
  ) {
    return true;
  }
  if (
    (targetHref === "/sales/overview" || targetHref === "/sales") &&
    (currentPath === "/sales" || currentPath === "/sales/overview")
  ) {
    return true;
  }

  // Handle nested sub-routes (e.g. /admin/inventory/123 matches /admin/inventory)
  if (
    targetHref !== "/" &&
    targetHref !== "/admin" &&
    targetHref !== "/admin/dashboard" &&
    targetHref !== "/inventory" &&
    targetHref !== "/inventory/overview" &&
    targetHref !== "/sales" &&
    targetHref !== "/sales/overview" &&
    currentPath.startsWith(`${targetHref}/`)
  ) {
    return true;
  }

  return false;
}
