# Workspace Rules & Instructions

All page designs, UI components, layout structures, and color/typography specifications in this repository MUST strictly follow the design system defined in [agent/DESIGN.md](file:///c:/Users/ADMIN/Desktop/Folder1/mini-erp-app/agent/DESIGN.md).

## Core Palette Tokens:
- **FOAM**: `#fff7e8` (Canvas background)
- **CREMA**: `#cfab71` (Golden accent highlights, active tags)
- **ROAST**: `#7f5e35` (Subtitles, metadata, secondary text)
- **ESPRESSO**: `#713105` (CTA buttons, active state accents)
- **GROUNDS**: `#4f351c` (Dark component frames, section headers)
- **NOIR**: `#341100` (Page titles, primary actions, main data)

## Core Design Rules:
1. **Background Canvas**: Always use `FOAM` `#fff7e8` (`bg-[#fff7e8]`).
2. **Surface Elements**: Cards, grids, and containers use `#FFFFFF` (`bg-white`) with `border-[#e8decf]`.
3. **Primary Action**: Buttons, active highlights, CTA elements use `ESPRESSO` `#713105` or `NOIR` `#341100`.
4. **Typography Hierarchy**:
   * Page Header: `text-2xl font-bold text-[#341100]`
   * Section Heading: `text-sm font-semibold text-[#4f351c]`
   * Primary Data Row: `text-sm font-medium text-[#341100]`
   * Metadata Details: `text-xs font-normal text-[#7f5e35]`
   * Pill Badges: `text-[11px] font-semibold uppercase tracking-wide`

## Execution & Interaction Rules:
5. **No Build On Every Edit**: Do not run `npm run build` after every file edit. Run only when requested.
6. **No Auto Dev Server**: Do not run `npm run dev` automatically.
7. **No Auto Git Commits**: Do not commit or push automatically.
8. **Follow agent/DESIGN.md**: Always depend on `agent/DESIGN.md` for UI implementations.
9. **Provide 3+ Options on Suggestions**: When providing suggestions or recommendations to the user, always present 3 or more clear options.
