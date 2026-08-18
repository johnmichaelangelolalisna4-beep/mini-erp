# Project Memory & Session Status

## 1. Project Overview
* **Project Name:** Mini-ERP Web System (`mini-erp-app`)
* **Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, Recharts, Lucide Icons.
* **Workspace Location:** `c:\Users\ADMIN\Desktop\Folder1\mini-erp-app`

---

## 2. Design System Tokens (`agent/DESIGN.md`)
All UI components strictly adhere to the warm coffee/espresso color palette:
* **FOAM (`#fff7e8`)**: Main app background (`bg-[#fff7e8]`), search/date input backings, toggle containers.
* **CREMA (`#cfab71`)**: Golden accent highlights, active tags, secondary chart accents.
* **ROAST (`#7f5e35`)**: Subtitles, metadata, secondary text headers.
* **ESPRESSO (`#713105`)**: Primary CTA buttons, active navigation highlights, main chart bars/lines.
* **GROUNDS (`#4f351c`)**: Dark section headings, table headers.
* **NOIR (`#341100`)**: Page titles (*"Dashboard Overview"*), primary data values (`$124,592.00`), main text.

---

## 3. Triple Portal Architecture & Dedicated Route Namespaces

### A. Administrator Portal (`/admin/*`)
Complete uniform `/admin/*` namespace for system administrators with `ADMINISTRATOR PORTAL` header badge.
* **`/admin/dashboard`** ([app/admin/dashboard/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/dashboard/page.tsx)): High-level store overview with system-wide KPI cards and charts.
* **`/admin/inventory`** ([app/admin/inventory/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/inventory/page.tsx)): Full Read/Write inventory management.
* **`/admin/sales`** ([app/admin/sales/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/sales/page.tsx)): Transaction management and invoicing.
* **`/admin/finance`** ([app/admin/finance/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/finance/page.tsx)): General ledger, revenue vs expense breakdown, tax provisions.
* **`/admin/users`** ([app/admin/users/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/users/page.tsx)): User Management panel for employee registration and role assignment (`Admin`, `Sales`, `Inventory`).
* **`/admin/logs`** ([app/admin/logs/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/logs/page.tsx)): Real-time Audit & System Logs.
* **`/admin/settings`** ([app/admin/settings/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/admin/settings/page.tsx)): System Settings.

### B. Sales Representative Portal (`/sales/*`)
Dedicated top-level `/sales/*` URL namespace for sales representatives (e.g. John Miller) with `SALES REPRESENTATIVE PORTAL` header badge.
* **`/sales/overview`** ([app/sales/overview/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/sales/overview/page.tsx)): Personal sales performance, quota progress bar ($15,450 / $20,000), pending invoices count (4), orders created today (8), and total commission ($1,545).
* **`/sales/orders`** ([app/sales/orders/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/sales/orders/page.tsx)): **Full Read/Write Access** workspace for adding new sales orders, inputting customer details, selecting products, processing invoices, and modal order generation.
* **`/sales/inventory`** ([app/sales/inventory/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/sales/inventory/page.tsx)): **Read-Only Access** product lookup panel for checking stock availability and wholesale/retail pricing (**"+ Add Product" button hidden**).

### C. Inventory Manager Portal (`/inventory/*`)
Dedicated top-level `/inventory/*` URL namespace for warehouse and inventory managers with `INVENTORY MANAGER PORTAL` header badge.
* **`/inventory/overview`** ([app/inventory/overview/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/inventory/overview/page.tsx)): Macro warehouse metrics (Total Active SKUs: 482, Items Requiring Restock: 14, Out-of-Stock Items: 3, Categories Distribution).
* **`/inventory/catalog`** ([app/inventory/catalog/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/inventory/catalog/page.tsx)): **Full Read/Write Access** primary workspace for adding new SKUs, editing stock counts, updating categories, unit pricing, and uploading product images.
* **`/inventory/low-stock`** ([app/inventory/low-stock/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/inventory/low-stock/page.tsx)): Dedicated action view highlighting items below reorder levels with restock actions.
* **`/inventory/stock-logs`** ([app/inventory/stock-logs/page.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/app/inventory/stock-logs/page.tsx)): Operational log showing every stock deduction (from customer orders) and addition (from supplier shipments).

---

## 4. Key UI Fixes & Enhancements Completed
1. **Explicit Role-Based Routing**: `/admin/*` vs. `/sales/*` vs. `/inventory/*`.
2. **3-Way Portal Switcher**: `MainSidebar` footer features an instant 3-button role switcher (`Admin` | `Sales` | `Inventory`).
3. **Status Pill Formatting**: Fixed status pills (`OUT OF STOCK`, `LOW STOCK`, `IN STOCK`) with `whitespace-nowrap inline-flex items-center justify-center shrink-0` in [badge.tsx](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/components/ui/badge.tsx) so text never wraps onto multiple lines.
4. **Fixed Sticky Sidebar Position**: Applied `h-screen sticky top-0 z-20` on `SidebarRail` and `MainSidebar` so sidebars stay anchored while page content scrolls.
5. **Clean Typography & Emojis Stripped**: Professional ERP styling with clean text and no inline emojis in navigation labels.

---

## 5. Strict User Preferences (`agent/SKILLS.md` & `agent/AGENTS.md`)
1. **No Auto Build**: Do NOT run `npm run build` after every file change; run only when explicitly requested by the user.
2. **No Auto Dev Server**: Do NOT start `npm run dev` automatically; user handles local dev server.
3. **No Auto Git Commits**: Do NOT perform git commit or push operations; user handles repository management.
4. **Design Alignment**: Always reference `agent/DESIGN.md` for any UI implementations or styling changes.
5. **Always Provide 3+ Options**: Provide 3 or more options whenever making suggestions or recommendations.
