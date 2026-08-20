# SESSION CONTEXT & WORKSPACE OVERVIEW

## 1. Environment & Workspace Configuration
* **Project Name:** `mini-erp-app`
* **Business Domain:** Luxury Furniture & Interior Design Enterprise Operations (Living Room, Dining, Bedroom, Office, Showrooms & Woodcraft Inventory)
* **Workspace Path:** `c:\Users\Acer\Downloads\Mini-ERP-master (2)\Mini-ERP-master`
* **Tech Stack:** Next.js 16.3.0 (App Router), React 19, TypeScript 5, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS v4, Lucide React, Radix UI Primitives, Recharts
* **Development Server:** `npm run dev` (Runs locally on `http://localhost:3000`)
* **Supabase Project:** `https://qaodmynygehskbxsouvs.supabase.co`

---

## 2. Recent Session Actions & Completed Features

### 1. Dynamic Admin Sidebar Navigation
* **Centralized Configuration:** Created [`lib/config/navigation.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/lib/config/navigation.ts) defining structured navigation sections (`Main Menu`, `Operations Modules`, `Administration`).
* **Live Counter Badges:** Implemented [`lib/hooks/use-sidebar-metrics.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/lib/hooks/use-sidebar-metrics.ts) to query real-time counts from Supabase (e.g. low stock alerts, pending orders, registered staff).
* **Sidebar Sync:** Synchronized expanded [`MainSidebar`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/components/main-sidebar.tsx) and slim [`SidebarRail`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/components/sidebar-rail.tsx) with accurate sub-route active matching.

### 2. Full Removal of Hardcoded Data
* **Revenue Analytics:** `RevenueBarChart` dynamically groups real completed orders across a rolling 6-month window.
* **Category Distribution:** `CategoryPieChart` dynamically computes collection shares and stock valuation directly from live products.
* **Finance & Reports:** `FinancePage` calculates live Gross Revenue, Operating Expenses, Net Profit, and Estimated Tax, and constructs real-time General Ledger entries.
* **User Management:** `UserManagementPage` removed `defaultProfiles` and renders live database profiles exclusively.

### 3. Transformation to Furniture & Interior Living Enterprise
* Replaced coffee shop domain with **Luxury Furniture & Interior Living Operations**.
* Configured furniture categories: *Living Room, Dining & Kitchen, Bedroom, Office & Workspace, Outdoor & Patio, Lighting & Decor, Storage & Cabinets*.
* Updated Landing Page ([`app/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/app/page.tsx)), inventory forms, sales studio client placeholders, and showroom settings.

### 4. Idempotent DDL Database Schema ([`supabase/schema.sql`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/supabase/schema.sql))
* Removed all sample `INSERT INTO` seed data to maintain a pure DDL schema.
* Added `DROP POLICY IF EXISTS` before every Row Level Security (RLS) policy, making the script safe and re-runnable in Supabase SQL Editor without error 42710.

### 5. Input Usability & Stepper Removal
* **Global CSS Fix:** Hidden native browser number input spinners in [`app/globals.css`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/app/globals.css).
* **No Sticky Zeros:** Form states accept empty strings (`"" | number`) allowing fields to be completely cleared with Backspace.
* **Auto-Select on Focus:** Added `onFocus={(e) => e.target.select()}` for instant typing and value replacement.

### 6. Furniture Product Edit Feature
* Added **Edit** button (`Edit2` icon) to every product row in [`app/admin/inventory/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/app/admin/inventory/page.tsx).
* Pre-filled **Edit Furniture Details** modal allowing modification of piece name, SKU, collection, unit price, stock count, and reorder threshold with live Supabase synchronization.

### 7. Auto-Calculated Order Amounts & Custom Dropdowns
* **Auto-Calculation:** The *Create Client Order* modal in [`app/admin/sales/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20(2)/Mini-ERP-master/app/admin/sales/page.tsx) automatically pre-fills and computes `Total Amount = Unit Price × Quantity`.
* **Clean Option Display:** Product dropdown displays strictly the **Furniture Piece Name** and styled **SKU Code** badge.
* **Custom Dropdown Menus:** Replaced native select elements with custom **Warm Espresso** styled interactive dropdowns with click-outside detection and active checkmark highlights.
* **Live Stock Deduction:** Automatically deducts ordered quantities from live product inventory when an order is created as `COMPLETED`.

---

## 3. Architecture & Design Tokens (`agent/DESIGN.md`)
All UI components adhere strictly to the Warm Espresso & Timber palette:
* **FOAM (`#fff7e8`)**: Background canvas (`bg-[#fff7e8]`), input backing, toggle surfaces.
* **CREMA (`#cfab71`)**: Warm golden highlights, active badges, secondary accents.
* **ROAST (`#7f5e35`)**: Subtitles, metadata details, secondary text headers.
* **ESPRESSO (`#713105`)**: Primary CTA buttons, active navigation highlights, chart elements.
* **GROUNDS (`#4f351c`)**: Dark section headings, table headers.
* **NOIR (`#341100`)**: Page titles, primary data values, main text.

---

## 4. Operational Guidelines & Agent Preferences
1. **Design Alignment:** Always reference `agent/DESIGN.md` for UI component styling.
2. **No Auto Builds:** Do NOT run `npm run build` after every file edit unless explicitly requested by the user.
3. **No Auto Git Commits:** Do NOT execute git commit or push commands without user instructions.
4. **Options Guidance:** Always provide 3 or more options when suggesting solutions or recommendations.
