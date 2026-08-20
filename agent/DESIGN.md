# System UI Design Specification: Colors & Typography
**Project:** Mini-ERP Web System  
**Theme:** Warm Warm Coffee & Espresso Palette  

---

## 1. Color Palette Blueprint

This system utilizes high contrast between soft cream foam backgrounds, crisp white element surfaces, and deep espresso/noir tones for primary actions and data visualizations.

### Core Color Tokens

| Token Name | Hex Code | Tailwind Usage | Description |
| :--- | :--- | :--- | :--- |
| **FOAM** | `#fff7e8` | `bg-[#fff7e8]` | Application canvas backing layer |
| **CREMA** | `#cfab71` | `bg-[#cfab71]`, `text-[#cfab71]` | Warm golden accent highlights, badges |
| **ROAST** | `#7f5e35` | `text-[#7f5e35]`, `border-[#7f5e35]` | Subtitles, table headers, secondary text |
| **ESPRESSO** | `#713105` | `bg-[#713105]`, `text-[#713105]` | Rich espresso CTA buttons, active accents |
| **GROUNDS** | `#4f351c` | `bg-[#4f351c]`, `text-[#4f351c]` | Dark element surfaces, secondary dark actions |
| **NOIR** | `#341100` | `bg-[#341100]`, `text-[#341100]` | Highly legible titles, primary actions, main data |

### Core Surfaces & Borders
* **Surface Base:** `#FFFFFF` (`bg-white`)
* **Border / Line:** `#e8decf` (`border-[#e8decf]`)
* **Hover State:** `#fcf3e3` (`hover:bg-[#fcf3e3]`)

### Contextual Status Colors
* **In Stock / Fulfilled:** `#EBF5ED` background | `#15803D` text (`bg-emerald-50 text-emerald-700`)
* **Low Stock / Pending:** `#FDF0E6` background | `#713105` text (`bg-amber-50 text-[#713105]`)
* **Out of Stock / Alerts:** `#FEF2F2` background | `#B91C1C` text (`bg-red-50 text-red-700`)

---

## 2. Typography Specification

### Font Family Selection
* **Primary Font:** `Plus Jakarta Sans`
* **Display Font:** `Playfair Display` or `Georgia` for dashboard titles

### Typography Scale Hierarchy

| Context / Level | Font Size | Weight | Color Token | Application Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Page Header** | `24px` (`text-2xl`) | **Bold** (`font-bold`) | `text-[#341100]` | Module main titles |
| **Section Heading** | `14px` (`text-sm`) | **Semibold** (`font-semibold`) | `text-[#4f351c]` | Filter panel labels, chart headings |
| **Primary Data Row** | `14px` (`text-sm`) | **Medium** (`font-medium`) | `text-[#341100]` | Product names, active entity labels |
| **Metadata Details** | `13px` (`text-xs`) | Normal (`font-normal`) | `text-[#7f5e35]` | Subtitles, descriptions, SKU records |
| **Pill System Badges** | `11px` (`text-[11px]`) | **Semibold** (`font-semibold`) | Contextual | Status labels (`uppercase tracking-wide`) |