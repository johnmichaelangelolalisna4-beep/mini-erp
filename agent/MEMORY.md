# Project Memory & Session Status

## 1. Project Overview
* **Project Name:** Mini-ERP Web System (`mini-erp-app`)
* **Business Domain:** Luxury Furniture & Interior Living Enterprise Operations
* **Repository:** `https://github.com/johnmichaelangelolalisna4-beep/mini-erp.git` (branch: `master`)
* **Workspace Path:** `c:\Users\ADMIN\Desktop\Folder1\mini-erp\mini-erp` (Root level)
* **Tech Stack:** Next.js 16.3.0 (App Router, Turbopack), React 19, TypeScript 5, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS v4, shadcn/ui primitives, Recharts, Lucide Icons.
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

## 3. Database & Supabase Authentication Architecture

### A. Environment Configuration (`.env.local`)
* `NEXT_PUBLIC_SUPABASE_URL`: `https://qaodmynygehskbxsouvs.supabase.co`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key configured
* `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key configured

### B. SSR Client Helpers & Proxy
* [`lib/supabase/client.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/lib/supabase/client.ts): Browser client helper (`createBrowserClient`).
* [`lib/supabase/server.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/lib/supabase/server.ts): Server component & admin service role client helper.
* [`lib/supabase/proxy.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/lib/supabase/proxy.ts) & [`proxy.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/proxy.ts): Next.js session refresh proxy (Next.js 16+ convention).

### C. Admin Auth API Endpoints
* **[`app/api/admin/create-user/route.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/app/api/admin/create-user/route.ts)**: Registers employee in Supabase Authentication (`auth.users`) with `email_confirm: true` and syncs with `public.profiles`.
* **[`app/api/admin/delete-user/route.ts`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/app/api/admin/delete-user/route.ts)**: Deletes user from both `auth.users` and `public.profiles`.
* **[`supabase/admin-seed.sql`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/supabase/admin-seed.sql)**: SQL script to seed or update Admin accounts safely in SQL Editor.
* **[`supabase/schema.sql`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/supabase/schema.sql)**: Pure idempotent DDL database schema with `DROP POLICY IF EXISTS` handling for safe re-runs.

---

## 4. Portals & Application Routes

### A. Root Landing & Dynamic Login Page (`app/page.tsx`)
* **Hero Showcase**: Brand presentation with system operational badge and furniture collections showcase.
* **Strict Dynamic Supabase Authentication**: Uses `supabase.auth.signInWithPassword()`. Validates credentials against Supabase.
* **Interactive Loading State**: Spinning Lucide `Loader2` indicator and disabled input fields during authentication.
* **Database Role-Driven Routing**: Resolves role from Supabase `public.profiles` and routes employee to:
  * `Admin` ➔ `/admin/dashboard`
  * `Sales` ➔ `/sales/overview`
  * `Inventory` ➔ `/inventory/overview`

### B. Administrator Portal (`/admin/*`)
* **`/admin/dashboard`**: Store overview with live Supabase KPI computations, shimmering card skeletons, and dynamic current date.
* **`/admin/inventory`**: Full CRUD furniture inventory with *"Add Furniture Piece"*, *"Edit Furniture Details"*, `ConfirmDialog` SKU deletion, and `TableSkeleton`.
* **`/admin/sales`**: Transaction and order management with `CustomSelect`, piece selection, auto-calculated order total, status toggles, and `TableSkeleton`.
* **`/admin/finance`**: General ledger, revenue vs expense breakdown, multi-sheet Excel exports, and `TableSkeleton`.
* **`/admin/users`**: Dynamic Employee Directory synced to Supabase Auth & Database with role modification and `ConfirmDialog` account removals.
* **`/admin/logs`**: Real-time Unified Audit & Stock Movement Logs with Excel export.
* **`/admin/settings`**: Showroom system configuration.

### C. Inventory Portal (`/inventory/*`)
* **`/inventory/overview`**: Live inventory KPIs, stock level distribution charts, low stock alerts, and quick actions.
* **`/inventory/catalog`**: Live catalog CRUD with `CustomSelect` category filtering, `ConfirmDialog` deletion, and `TableSkeleton`.
* **`/inventory/low-stock`**: Live replenishment intake modal with auto stock log addition and safety threshold indicators.
* **`/inventory/stock-logs`**: Real-time stock movement ledger with movement type filtering (`ADDITION` / `DEDUCTION`) and Excel export.

### D. Sales Portal (`/sales/*`)
* **`/sales/overview`**: Personal performance KPIs, commission calculations, recent order history, and quick order creation.
* **`/sales/orders`**: Sales order management with status workflow.
* **`/sales/inventory`**: Read-only real-time catalog stock lookup with category filters and stock availability badges.

---

## 5. UI Architecture & Custom Components

### A. Custom Dropdown Primitive ([`components/ui/custom-select.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/components/ui/custom-select.tsx))
* Replaced 100% of native `<select>` tags across all modules.
* Floating menu styled with FOAM background, CREMA focus rings, checkmark active states, `max-h-52 overflow-y-auto` scroll container, and click-outside listeners.
* Modal containers kept `overflow-visible relative` so dropdowns float seamlessly without boundary clipping.

### B. Warm Espresso Confirmation Dialog ([`components/ui/confirm-dialog.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/components/ui/confirm-dialog.tsx))
* Replaced 100% of native `window.confirm()` browser popups across SKU, catalog piece, and employee deletions.
* Modal backdrop blur, Lucide `Trash2` / `AlertTriangle` icons, warm red destructive buttons, and Warm Espresso outline cancel buttons.

### C. Skeleton Loading System ([`components/ui/skeleton.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/components/ui/skeleton.tsx))
* `Skeleton`: Base animated pulse shimmer component (`bg-[#e8decf]/60 animate-pulse rounded-xl`).
* `TableSkeleton`: Configurable multi-row and multi-column shimmering table rows replacing raw text loaders across all 10 platform tables.
* `CardSkeleton`: Shimmering placeholder for dashboard metric cards.
* Submit buttons feature spinning Lucide `Loader2` icons and input locking during mutations to prevent duplicate submissions.

### D. Green (Success) & Red (Error) Toast Notifications ([`components/ui/toast-notification.tsx`](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp/mini-erp/components/ui/toast-notification.tsx))
* Replaced 100% of native `window.alert()` calls and static notification banners.
* **Green (Success) Toast**: `bg-emerald-50 border-emerald-300 text-emerald-950` with Lucide `CheckCircle2`, custom title/message, 4-second auto-dismiss, and manual `X` button.
* **Red (Error) Toast**: `bg-red-50 border-red-300 text-red-950` with Lucide `AlertCircle`, custom error message, 4-second auto-dismiss, and manual `X` button.

---

## 6. Strict Operational Guidelines
1. **No Auto Builds**: Do NOT run `npm run build` after file edits; only run when explicitly requested by the user.
2. **No Auto Dev Server**: Do NOT start `npm run dev` automatically; user manages dev server in their terminal.
3. **No Auto Git Commits**: Do NOT perform git commit or push commands without explicit user instruction.
4. **No Auto Memory Updates**: Do NOT update `MEMORY.md` automatically unless explicitly instructed by the user.
5. **No Emojis**: Always use Lucide / Shadcn icons; never use raw emoji icons.
6. **No Default Unstyled Components**: Never leave buttons, dropdowns, dialogs, or alerts in default or unstyled browser states.
7. **Always Follow DESIGN.md**: Strictly use the Warm Espresso & Timber palette design tokens.
8. **Always Provide 3+ Options**: Provide 3 or more options when suggesting solutions or recommendations.
9. **Always Create Implementation Plan**: Create an implementation plan before adding or removing code.
