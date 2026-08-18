# SESSION CONTEXT & WORKSPACE OVERVIEW

## 1. Environment & Workspace Configuration
* **Project Name:** `mini-erp-app`
* **Workspace Path:** `c:\Users\Acer\Downloads\Mini-ERP-master (2)\Mini-ERP-master`
* **Tech Stack:** Next.js 16.3.0 (App Router), React 19, TypeScript 5, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Tailwind CSS v4, Lucide React, Radix UI Primitives, Recharts
* **Development Server:** `npm run dev` (Runs locally on `http://localhost:3000`)
* **Supabase Project:** `https://qaodmynygehskbxsouvs.supabase.co`

---

## 2. Recent Session Actions & Completed Features

### 1. Supabase Database & Auth Integration
* Configured `.env.local` with Supabase Project URL, Anon Key, and Service Role Key.
* Created SSR client helpers ([`lib/supabase/client.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/lib/supabase/client.ts), [`lib/supabase/server.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/lib/supabase/server.ts), [`middleware.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/middleware.ts)).
* Created Admin API routes ([`app/api/admin/create-user/route.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/api/admin/create-user/route.ts), [`app/api/admin/delete-user/route.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/api/admin/delete-user/route.ts)) for registering employees into Supabase Authentication (`auth.users`) and syncing with `public.profiles`.

### 2. Admin Side Functionality & CRUD Operations
* Created API service layer [`lib/services/admin.ts`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/lib/services/admin.ts) for products, orders, invoices, profiles, and stock logs.
* Dynamic Dashboard ([`/admin/dashboard`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/admin/dashboard/page.tsx)) with real-time KPI calculations.
* Inventory workspace ([`/admin/inventory`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/admin/inventory/page.tsx)) with *"Add Product"* Modal & Delete actions.
* Sales workspace ([`/admin/sales`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/admin/sales/page.tsx)) with *"Create Order"* Modal & status toggles.
* User Management ([`/admin/users`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/admin/users/page.tsx)) with *"Register Employee"* Modal (Full Name, Password with eye toggle, Email, Role), role assignment dropdowns, and delete profile actions.

### 3. Root Landing & Employee Login Page
* Built Landing Page ([`app/page.tsx`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/app/page.tsx)) styled with Warm Espresso Design System tokens.
* Clean Employee Login Form featuring strictly **Employee Email** and **Password** inputs with eye toggle.
* Fixed browser password eye duplicate bug in `app/globals.css`.
* Removed manual role buttons from the login form: role is automatically retrieved from the Supabase database profile assigned in the User Management tab.
* Automatic portal routing (`Admin` ➔ `/admin/dashboard`, `Sales` ➔ `/sales/overview`, `Inventory` ➔ `/inventory/overview`).

### 4. Global Sidebar Log Out
* Pinned Log Out button at the bottom of both [`MainSidebar`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/components/main-sidebar.tsx) and [`SidebarRail`](file:///c:/Users/Acer/Downloads/Mini-ERP-master%20%282%29/Mini-ERP-master/components/sidebar-rail.tsx) to sign out and return to the root landing page.

---

## 3. Architecture & Key Features

### Warm Espresso Design System Tokens (`agent/DESIGN.md`)
All UI components strictly adhere to a warm coffee color palette:
* **FOAM (`#fff7e8`)**: Main application background (`bg-[#fff7e8]`), search/date input backings, toggle containers.
* **CREMA (`#cfab71`)**: Golden accent highlights, active tags, secondary chart accents.
* **ROAST (`#7f5e35`)**: Subtitles, metadata, secondary text headers.
* **ESPRESSO (`#713105`)**: Primary CTA buttons, active navigation highlights, main chart bars/lines.
* **GROUNDS (`#4f351c`)**: Dark section headings, table headers.
* **NOIR (`#341100`)**: Page titles (*"Dashboard Overview"*), primary data values, main text.

---

## 4. Operational Guidelines & Agent Preferences
1. **Design Alignment:** Always reference `agent/DESIGN.md` for UI component styling.
2. **No Auto Builds:** Do NOT run `npm run build` after every file edit unless explicitly requested by the user.
3. **No Auto Git Commits:** Do NOT execute git commit or push commands without user instructions.
4. **Options Guidance:** Always provide 3 or more options when suggesting solutions or recommendations.
