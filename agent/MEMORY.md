# Project Memory & Session Status

## 1. Project Overview
* **Project Name:** Mini-ERP Web System (`mini-erp-app`)
* **Business Domain:** Luxury Furniture & Interior Living Enterprise Operations
* **Repository:** `https://github.com/johnmichaelangelolalisna4-beep/mini-erp.git` (branch: `master`)
* **Workspace Path:** `c:\Users\Acer\Downloads\Mini-ERP-master (2)` (Root level)
* **Tech Stack:** Next.js 16.3.0 (App Router), React 19, TypeScript 5, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS v4, shadcn/ui primitives, Recharts, Lucide Icons.
* **Database & Auth:** Supabase (`https://qaodmynygehskbxsouvs.supabase.co`)

---

## 2. Design System Tokens (`agent/DESIGN.md`)
All UI components strictly adhere to the Warm Espresso & Timber color palette:
* **FOAM (`#fff7e8`)**: Main app background (`bg-[#fff7e8]`), search/date input backings, toggle containers.
* **CREMA (`#cfab71`)**: Golden accent highlights, active tags, secondary chart accents.
* **ROAST (`#7f5e35`)**: Subtitles, metadata, secondary text headers.
* **ESPRESSO (`#713105`)**: Primary CTA buttons, active navigation highlights, main chart bars/lines.
* **GROUNDS (`#4f351c`)**: Dark section headings, table headers.
* **NOIR (`#341100`)**: Page titles (*"Dashboard Overview"*), primary data values, main text.

---

## 3. Database & Supabase Authentication Architecture

### A. Environment Configuration (`.env.local`)
* `NEXT_PUBLIC_SUPABASE_URL`: `https://qaodmynygehskbxsouvs.supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key configured
* `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key configured

### B. SSR Client Helpers & Proxy
* [`lib/supabase/client.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/supabase/client.ts): Browser client helper (`createBrowserClient`).
* [`lib/supabase/server.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/supabase/server.ts): Server component & admin service role client helper.
* [`lib/supabase/proxy.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/supabase/proxy.ts) & [`proxy.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/proxy.ts): Next.js session refresh proxy (Next.js 16+ convention).

### C. Admin Auth API Endpoints
* **[`app/api/admin/create-user/route.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/api/admin/create-user/route.ts)**: Registers employee in Supabase Authentication (`auth.users`) with `email_confirm: true` and syncs with `public.profiles`.
* **[`app/api/admin/delete-user/route.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/api/admin/delete-user/route.ts)**: Deletes user from both `auth.users` and `public.profiles`.
* **[`supabase/admin-seed.sql`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/supabase/admin-seed.sql)**: SQL script to seed or update Admin accounts safely in SQL Editor.
* **[`supabase/schema.sql`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/supabase/schema.sql)**: Pure idempotent DDL database schema with `DROP POLICY IF EXISTS` handling for safe re-runs.

---

## 4. Portals & Application Routes

### A. Root Landing & Dynamic Login Page (`app/page.tsx`)
* **Hero Showcase**: Brand presentation with system operational badge and furniture collections showcase.
* **Strict Dynamic Supabase Authentication**: Uses `supabase.auth.signInWithPassword()`. Validates credentials against Supabase.
* **Database Role-Driven Routing**: Resolves role from Supabase `public.profiles` and routes employee to:
  * `Admin` ➔ `/admin/dashboard`
  * `Sales` ➔ `/sales/overview`
  * `Inventory` ➔ `/inventory/overview`

### B. Administrator Portal (`/admin/*`)
* **`/admin/dashboard`**: Store overview with live Supabase KPI computations and dynamic current date.
* **`/admin/inventory`**: Full CRUD furniture inventory with *"Add Furniture Piece"*, *"Edit Furniture Details"*, and delete actions with live status computation.
* **`/admin/sales`**: Transaction and order management with custom styled dropdowns, piece selection, auto-calculated order total, and status toggles.
* **`/admin/finance`**: General ledger, revenue vs expense breakdown, export reports.
* **`/admin/users`**: Dynamic Employee Directory synced to Supabase Auth & Database.
* **`/admin/logs`**: Real-time Audit & Stock Movement Logs.
* **`/admin/settings`**: Showroom system configuration.

---

## 5. Key UI Fixes & Enhancements Completed
1. **Workspace Flattening**: Removed inner `Mini-ERP-master` subfolder; all source code and configs are located at root.
2. **Dynamic Navigation & Live Badges**: Centralized config in `lib/config/navigation.ts` with real-time Supabase counter badges in `lib/hooks/use-sidebar-metrics.ts`.
3. **Hardcoded Data Removal**: 100% of static dummy mock data eliminated across charts, KPIs, finance ledgers, and user directories.
4. **No Sticky Zeros**: Numeric inputs accept empty strings so Backspace completely clears the field.
5. **No Browser Stepper Spinners**: Globally suppressed spin buttons on `input[type="number"]` in `app/globals.css`.
6. **Product Edit Feature**: Full editing modal for SKU, Name, Collection, Price, Stock, and Threshold in Admin Inventory.
7. **Auto-Calculated Order Totals**: Automatically computes and fills out `Total Amount = Unit Price × Quantity` in Create Order modal.
8. **Custom Warm Espresso Dropdowns**: Replaced native browser select elements with custom styled interactive dropdowns.
9. **Dynamic Excel Summary & Sales Report Export**: Multi-sheet formatted Excel workbook export (`.xlsx`) via [`lib/services/excel-export.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/services/excel-export.ts) with live Supabase data (Executive Summary, Detailed Sales Orders, General Ledger, and Product Catalog Valuation).
10. **Dynamic Enterprise Audit & System Logs with Excel Export**: Real-time unified activity trail tracking stock additions, deductions, order fulfillments, staff registrations, and security triggers ([`fetchUnifiedAuditLogs`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/services/admin.ts)) with dynamic multi-sheet Excel export ([`exportAuditLogsReport`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/lib/services/excel-export.ts)).
11. **Order Quantity Monitoring Column**: Added styled **Quantity** column between *Total Amount* and *Status* in Sales & Orders table and Excel export, joined directly with `order_items` in Supabase.
12. **Sales Portal 100% Dynamic Overhaul**: Removed all hardcoded mock arrays (`myRecentOrders`, `mockProducts`, placeholder quotas, and fake names like John Miller) across [`app/sales/overview/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/sales/overview/page.tsx) and [`app/sales/inventory/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/sales/inventory/page.tsx), tying all metrics, commission calculations, and recent order tables directly to authenticated Supabase user profiles and orders.
13. **Inventory Manager Portal 100% Dynamic Overhaul**: Removed all hardcoded mock arrays (`warehouseAlertItems`, `initialCatalog`, `lowStockItems`) across [`app/inventory/overview/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/inventory/overview/page.tsx), [`app/inventory/catalog/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/inventory/catalog/page.tsx), and [`app/inventory/low-stock/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/app/inventory/low-stock/page.tsx). Connected live Supabase CRUD, real-time KPI metrics, dynamic restock intake modal with automatic stock log additions, and live category/revenue charts.

---

## 6. Strict Operational Guidelines
1. **No Auto Builds**: Do NOT run `npm run build` after file edits; only run when explicitly requested by the user.
2. **No Auto Dev Server**: Do NOT start `npm run dev` automatically; user manages dev server.
3. **No Auto Git Commits**: Do NOT perform git commit or push commands without explicit user instruction.
4. **Design Alignment**: Always reference `agent/DESIGN.md` for UI component styling and color palette.
5. **Always Provide 3+ Options**: Provide 3 or more options when suggesting solutions or recommendations.
