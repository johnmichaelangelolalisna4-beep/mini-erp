# Project Memory & Session Status

## 1. Project Overview
* **Project Name:** Mini-ERP Web System (`mini-erp-app`)
* **Business Domain:** Luxury Furniture & Interior Living Enterprise Operations
* **Repository:** `https://github.com/johnmichaelangelolalisna4-beep/mini-erp.git` (branch: `master`)
* **Workspace Path:** `c:\Users\ADMIN\Desktop\Folder1\mini-erp` (Clean root level, flattened)
* **Tech Stack:** Next.js 16.3.0 (App Router, Turbopack), React 19, TypeScript 5, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS v4, shadcn/ui primitives, Recharts, Lucide Icons, Google Gemini AI (`gemini-3.5-flash-lite`).
* **Database & Auth:** Supabase (`https://qaodmynygehskbxsouvs.supabase.co`)

---

## 2. Design System Tokens (`agent/DESIGN.md`)
All UI components strictly adhere to the Warm Espresso & Timber color palette:
* **FOAM (`#fff7e8`)**: Main app canvas background (`bg-[#fff7e8]`), search/date input backings, toggle containers.
* **CREMA (`#cfab71`)**: Golden accent highlights, active tags, secondary chart accents, focus rings.
* **ROAST (`#7f5e35`)**: Subtitles, metadata, secondary text headers, table head labels.
* **ESPRESSO (`#713105`)**: Primary CTA buttons, active navigation highlights, main chart bars/lines.
* **GROUNDS (`#4f351c`)**: Dark section headings, table headers.
* **NOIR (`#341100`)**: Page titles (*"Dashboard Overview"*), primary data values, main text.
* **SUCCESS (`#065f46` / `#ecfdf5`)**: Completed badges, positive trends, green notification toasts.
* **ALERT / DESTRUCTIVE (`#991b1b` / `#fef2f2`)**: Out of stock badges, cancel/delete actions, red error toasts.

---

## 3. Database, Realtime & Supabase Architecture

### A. Environment Configuration (`.env.local`)
* `NEXT_PUBLIC_SUPABASE_URL`: `https://qaodmynygehskbxsouvs.supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key configured
* `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key configured
* `GEMINI_API_KEY`: Rotated Google Gemini API Key configured
* `GEMINI_MODEL`: `gemini-3.5-flash-lite`

### B. SSR Client Helpers & Proxy
* [`lib/supabase/client.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/lib/supabase/client.ts): Browser client helper (`createBrowserClient`).
* [`lib/supabase/server.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/lib/supabase/server.ts): Server component & admin service role client helper (`createAdminClient`).
* [`lib/supabase/proxy.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/lib/supabase/proxy.ts) & [`proxy.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/proxy.ts): Next.js session refresh proxy (Next.js 16+ convention).

### C. Native Realtime WebSocket Sync (`supabase_realtime`)
* **Publication Setup (`supabase/schema.sql`)**: Core tables published to `supabase_realtime` (`orders`, `products`, `order_items`, `stock_logs`, `profiles`).
* **Live Sidebar Notification Badges ([`lib/hooks/use-sidebar-metrics.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/lib/hooks/use-sidebar-metrics.ts))**: Subscribes to live database changes with unique channel IDs to update `1 PENDING`, `4 STAFF`, and low-stock count badges in `<50ms` across all open tabs.
* **Live Portals Sync**: Admin Dashboard, Admin Inventory, Sales Performance, Warehouse Catalog, Showroom Inventory, and Sales Orders update in real-time without page reload.

### D. Automated Real-Time Stock Deduction & Auto-Restoration
* **Order Placement (`deductProductStock`)**: Deducting items immediately updates `products.stock_count`, transitions status (`IN STOCK` ➔ `LOW STOCK` ➔ `OUT OF STOCK`), and writes a `DEDUCTION` entry to `stock_logs`.
* **Order Cancellation & Deletion (`restoreProductStock`)**: Automatically restores reserved units to warehouse inventory, recalculates `IN STOCK` status, and logs an `ADDITION` restoration entry.

### E. Dual-Sync Employee Role Switching & Database-First Login
* **Server API Route ([`app/api/admin/update-role/route.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/api/admin/update-role/route.ts))**: Uses `createAdminClient()` (Service Role) to simultaneously update `public.profiles` (`role` column) and `auth.users` encrypted session metadata (`auth.admin.updateUserById`).
* **Database-First Login ([`app/page.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/page.tsx))**: Prioritizes live database `profiles` table lookup on sign-in, instantly routing switched employees to their newly assigned portal (`Admin` ➔ `/admin/dashboard`, `Sales` ➔ `/sales/overview`, `Inventory` ➔ `/inventory/overview`).

---

## 4. AI Chatbot Architecture & Capabilities

### A. Core Engine & Role-Based Access Control (RBAC)
* **Model & Dynamic Execution**: Exclusively powered by `gemini-3.5-flash-lite`. Reads `process.env.GEMINI_API_KEY` dynamically per request in [`app/api/chat/route.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/api/chat/route.ts).
* **Executive Brevity**: Responds directly in 1–3 punchy sentences with bold highlights (**₱2,400.00**, **5 units**, **COMPLETED**). No conversational filler phrases.
* **Admin Full Access Persona (`ADMIN_TOOLS`)**: Access to enterprise financials, system audit logs, employee directory, catalog lookups, and stock adjustment proposals.
* **Sales-Designated Persona (`SALES_TOOLS` & `SALES_SYSTEM_PROMPT`)**: Mounted in `SalesLayout` (`role="Sales"`). Strictly scoped to showroom commerce: Retail & Wholesale pricing lookups, customer order tracking, showroom stock checks, and personal sales quota & 10% commission calculations. Guardrails block access to enterprise ledgers, system audit logs, and staff management.
* **Thought Signature & Tool Response Handling**: Multi-turn tool execution preserves raw model `thought_signature` tokens and returns results under `role: "user"` per Gemini REST specifications.

### B. Interactive Human-in-the-Loop Stock Actions (Admin Only)
* **Proposal Flow**: Asking to add or deduct stock calls `prepare_stock_adjustment` to calculate stock progression (`Current: 15 ➔ New: 35 units`) with structured payload (`action_type: "STOCK_ADJUSTMENT"`, `action_id`, `product_id`, `quantity`, `change_type`).
* **In-Chat Confirmation Card ([`components/ui/action-confirmation-card.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ui/action-confirmation-card.tsx))**: Renders directly inside the chat message with **[Confirm & Apply Stock]** and **[Cancel]** buttons.
* **Execution & Logging ([`app/api/chat/execute-action/route.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/api/chat/execute-action/route.ts))**: Validates action payload, mutates `products.stock_count` & `status`, writes a `stock_logs` audit row, and broadcasts cache invalidation across the app.
* **Chat Input UI Polish ([`components/ai-chat-assistant.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ai-chat-assistant.tsx) & [`app/globals.css`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/globals.css))**: Textarea features smooth auto-resizing up to `max-h-24` with native browser scrollbar button suppression (`::-webkit-scrollbar-button`) and `scrollbar-none`.

---

## 5. Portals & Application Routes

### A. Landing & Authentication (`/`)
* **[`app/page.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/page.tsx)**: Architectural drafting grid background with 40px `CREMA` grid lines, blueprint crosshairs (`+ 01. LIVING & TIMBER OPERATIONS`), multi-point ambient radial glows, and elevated Warm Espresso staff sign-in card.

### B. Administrator Portal (`/admin/*`)
* **`/admin/dashboard`**: Live KPI cards, Monthly Enterprise Sales Quota progress card with `[ Adjust Target Quota ]` modal, Revenue Analytics bar chart, and Category Sales Distribution donut chart.
* **`/admin/inventory`**: Full CRUD furniture inventory with Segmented Table / Grid switcher, responsive Luxury Gallery Cards, 1080p image uploads, and `ConfirmDialog` SKU deletion.
* **`/admin/sales`**: Transaction and order management with 100% Clip-Proof React Portal Status Badge (`OrderStatusPill`), automated stock deduction, clean reference Sales Order Invoice Modal with separate Print & PDF Download buttons.
* **`/admin/finance`**: General ledger, COGS / procurement restock expense tracking, dynamic running balances, revenue vs expense breakdown, multi-sheet Excel exports, and `TableSkeleton`.
* **`/admin/users`**: Dynamic Employee Directory synced via server dual-sync API (`/api/admin/update-role`) with role modification and `ConfirmDialog` account removals.
* **`/admin/logs`**: Real-time Unified Audit & Stock Movement Logs with Excel export.
* **`/admin/settings`**: Showroom system configuration.

### C. Inventory Portal (`/inventory/*`)
* **`/inventory/overview`**: Live inventory KPIs, Category Sales Distribution, low stock alerts, and quick replenishment actions.
* **`/inventory/catalog`**: Live catalog CRUD with Table/Grid view switcher, `CustomSelect` category filtering, and `ConfirmDialog` deletion.
* **`/inventory/low-stock`**: Live replenishment intake with clean dual-action stock shift logging.
* **`/inventory/stock-logs`**: Real-time stock movement ledger with movement type filtering (`ADDITION` / `DEDUCTION`) and Excel export.

### D. Sales Portal (`/sales/*`)
* **`/sales/overview`**: Personal performance KPIs, customizable Monthly Sales Quota with preset chips (`₱20k`, `₱50k`, `₱100k`, `₱250k`) & custom amount input, 10% earned commission calculations, and recent order history.
* **`/sales/orders`**: Sales order management with `created_by_role: "Sales"`, automatic `Sales Representative` • `Showroom Commerce` invoice branding, and status workflow.
* **`/sales/inventory`**: Real-time showroom catalog with Table/Grid switcher, dual pricing (Retail & Wholesale), and 1-Click Fast Showroom Ordering (`[ 🛍️ Sell Piece ]`) with real-time stock deduction.

---

## 6. UI Primitives & Custom Components
* **`OrderStatusPill` ([`app/admin/sales/page.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/admin/sales/page.tsx))**: 100% Clip-Proof React Portal Status Badge Dropdown rendered via `createPortal` to `document.body` with dynamic bounding client rect positioning.
* **Clean Reference Invoice Modal ([`app/admin/sales/page.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/app/admin/sales/page.tsx))**: Sales Order invoice modal matching reference layout with 4-column metadata card, clean line-item breakdown, terms & conditions, subtotal/tax/grand total breakdown, and separate `[ Print Invoice ]` and `[ Download PDF ]` buttons.
* **Interactive Quota Customizer Modal**: Warm Espresso modal with quick preset chips and custom numeric input on both `/sales/overview` and `/admin/dashboard`, sharing synchronized `localStorage` state.
* **Category Sales Distribution Donut Chart ([`components/category-pie-chart.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/category-pie-chart.tsx))**: Array-safe unpacking and multi-layer category resolution with distinct Warm Espresso palette slice colors per collection.
* **Main Sidebar ([`components/main-sidebar.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/main-sidebar.tsx))**: Widened to `w-72` (288px) with full label visibility for badges (`Low Stock & Restock` with `1 ALERT`).
* **Table & Grid View Switcher**: Segmented toggle with `List` and `LayoutGrid` icons and responsive Luxury Product Gallery Cards across all inventory portals.
* **`CustomSelect` ([`components/ui/custom-select.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ui/custom-select.tsx))**: Warm Espresso floating dropdown primitive.
* **`ConfirmDialog` ([`components/ui/confirm-dialog.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ui/confirm-dialog.tsx))**: Warm Espresso modal dialog for destructive confirmation.
* **`Skeleton` & `TableSkeleton` ([`components/ui/skeleton.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ui/skeleton.tsx))**: Shimmering animated placeholders across all platform tables and metric cards.
* **`ToastNotification` ([`components/ui/toast-notification.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/components/ui/toast-notification.tsx))**: Emerald success and Red error toast notification system accepting `toast={toast}`.

---

## 7. Strict Operational Guidelines
1. **No Auto Builds**: Do NOT run `npm run build` after file edits; only run when explicitly requested by the user.
2. **No Auto Dev Server**: Do NOT start `npm run dev` automatically; user manages dev server in their terminal.
3. **No Auto Git Commits**: Do NOT perform git commit or push commands without explicit user instruction.
4. **No Auto Memory Updates**: Do NOT update `MEMORY.md` automatically unless explicitly instructed by the user.
5. **No Emojis**: Always use Lucide / Shadcn icons; never use raw emoji icons.
6. **No Default Unstyled Components**: Never leave buttons, dropdowns, dialogs, or alerts in default or unstyled browser states.
7. **Always Follow DESIGN.md**: Strictly use the Warm Espresso & Timber palette design tokens.
8. **Always Provide 3+ Options**: Provide 3 or more options when suggesting solutions or recommendations.
9. **Always Create Implementation Plan**: Create an implementation plan before adding or removing code.
