# Task 2-3-4: Major Layout Restructuring

**Agent**: Code Agent (Task 2-3-4)
**Date**: 2025-01-XX

## Summary
Major restructuring of the Kalikan calculator app layout. Moved result tab navigation into the sticky header, combined input cards into a single Tabs component, removed the hero section, and eliminated duplicate mobile/desktop code.

## Changes Made

### Step A: Modified `result-tabs.tsx`
1. **Removed TabsList**: The `<TabsList>` with 6 TabsTrigger buttons (Ringkasan, Produksi, Pakan, Profit, Kualitas Air, Kalender) was completely removed from the ResultTabs component. This navigation is now handled by the header in `page.tsx`.
2. **Added `activeTab` and `onTabChange` props**: The `ResultTabsProps` interface now includes `activeTab: string` and `onTabChange: (tab: string) => void`. The component uses these props to control tab state instead of internal `useState`.
3. **Changed Tabs component**: `<Tabs value={activeTab} onValueChange={onTabChange}>` instead of `<Tabs value={activeTab} onValueChange={setActiveTab}>`.
4. **Removed internal state**: Removed `const [activeTab, setActiveTab] = useState("summary")` and `useState` import.
5. **Removed unused imports**: Removed `TabsList`, `TabsTrigger` from shadcn/ui/tabs import, and `Wallet`, `CalendarDays`, `Activity` from lucide-react import.

### Step B: Modified `page.tsx` (The Big One)
1. **Added new state variables**: `resultTab` (default "summary") and `inputTab` (default "kolam") to replace the old `inputExpanded` state.
2. **Removed `inputExpanded` state**: No longer needed since Collapsible component is removed.
3. **Added result tab navigation to header**: Second row in the sticky header containing 6 buttons (Ringkasan, Produksi, Pakan, Profit, Kualitas Air, Kalender) with active/inactive styling. Scrollable horizontally on mobile, centered on desktop.
4. **Removed hero section entirely**: The section with "Hitung Padat Tebar Ikan, Akurat & Mudah" heading, badge, description, and 3 feature items was removed.
5. **Removed Collapsible section**: The entire mobile input section wrapped in `<Collapsible>` with its trigger button and all 3 mobile input cards (~535 lines) was removed.
6. **Removed desktop-only wrapper**: The `<div className="hidden lg:block space-y-6">` wrapper around desktop input cards was removed. Desktop card content is now inside TabsContent.
7. **Combined input cards into Tabs**: Three input cards (Ukuran Kolam, Ikan & Sistem Budidaya, Parameter Produksi) are now inside a single `<Tabs>` component with 3 TabsContent:
   - Tab 1: "kolam" (Ruler icon) → Ukuran Kolam card
   - Tab 2: "ikan" (Fish icon) → Ikan & Sistem Budidaya card
   - Tab 3: "parameter" (TrendingUp icon) → Parameter Produksi card
8. **Updated ResultTabs call**: Added `activeTab={resultTab}` and `onTabChange={setResultTab}` props.
9. **Left column closing div**: Added `</div>` closing tag for `<div className="lg:col-span-2">`.

### Step C: Cleanup
1. **Removed unused imports**: `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger`, `ChevronDown`, `ChevronUp`, `CardFooter`, `SheetClose`, `WeeklyFeedTable`, `GrowthChart`, `ProfitCalculator`, `WaterQualityForm`, `HarvestCalendar`, `ShareButtons`, `SaveScenarioButton`.
2. **Added needed imports**: `Wallet`, `Activity`, `CalendarDays` (for header tab navigation).
3. **Removed unused components**: `FeatureItem`, `StatCard`, `Row` function components at the bottom of page.tsx.

### File Size Changes
- `page.tsx`: Reduced from ~2061 lines to ~1428 lines (removed ~633 lines of duplicate code and unused components)
- `result-tabs.tsx`: Reduced from ~628 lines to ~588 lines (removed TabsList section and unused imports)

## New Layout Structure

### Desktop (lg+):
```
┌──────────────────────────────────────────────────┐
│ [Logo] Kalikan  [Dashboard] [History] [Compare]  │ ← Row 1 (sticky)
│ [Ringkasan] [Produksi] [Pakan] [Profit] [Air] [Kal] │ ← Row 2 (sticky)
├──────────────────────────────────────────────────┤
│ Fish Banner                                       │
│ ┌─────────────────┬──────────────────────────────┐│
│ │ Input Tabs      │  Result Content              ││
│ │ Kolam|Ikan|Par  │  Hero result card            ││
│ │ [card content]  │  Warnings                    ││
│ │                 │  Save + Share                 ││
│ │                 │  [tab content]                ││
│ └─────────────────┴──────────────────────────────┘│
├──────────────────────────────────────────────────┤
│ Footer                                           │
└──────────────────────────────────────────────────┘
```

### Mobile:
```
┌────────────────────┐
│ [Logo]  [☰]        │ ← Row 1 (sticky)
│ [Ringkas][Prod]... │ ← Row 2 sticky (scrollable)
├────────────────────┤
│ Fish Banner        │
│ ┌────────────────┐ │
│ │Kolam│Ikan│Param│ │ ← Input Tabs
│ └────────────────┘ │
│ [input content]    │
│                    │
│ [Result Content]   │ ← Result tab content
│                    │
├────────────────────┤
│ Footer             │
└────────────────────┘
```

## Verification
- ESLint: Passes with no errors
- Dev server: Compiles successfully on port 3000
- No functionality was removed - all calculator logic preserved
- All state variables and handlers preserved
- Footer still sticks to bottom with `mt-auto`
