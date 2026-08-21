# Design System

**Product Name:** CrowdShield AI  
**Theme:** Premium Enterprise SaaS, Dark Theme, Minimal, Modern, Glassy, Professional

---

## 1. Color Tokens

The color palette is designed to minimize eye strain during long monitoring sessions while using vibrant accents to draw attention to critical insights.

### Base Colors
- **Primary Background:** `#09090B` (Deep Void) - Used for the main app background.
- **Secondary Background:** `#111215` (Obsidian) - Used for sidebars, headers, and nested panels.
- **Surface / Cards:** `#16181D` (Carbon) - Used for widget containers and floating elements.
- **Border / Divider:** `rgba(255, 255, 255, 0.08)` - Subtle separation lines.

### Accent Colors
- **Primary Accent:** `#9333EA` (Electric Purple) - Used for primary actions, active states, and primary data visualization.
- **Primary Accent (Glow):** `rgba(147, 51, 234, 0.15)` - Soft purple glow for active cards and buttons.
- **Secondary Accent:** `#F97316` (Neon Orange) - Used for secondary data points and warnings.

### Semantic Colors
- **Danger / Critical:** `#EF4444` (Crimson Red) - Used for high-risk alerts, stampede risks, and critical system failures.
- **Warning:** `#F59E0B` (Amber) - Used for medium-risk congestion or approaching thresholds.
- **Success / Healthy:** `#10B981` (Emerald Green) - Used for normal flow, online status, and resolved incidents.
- **Info:** `#3B82F6` (Azure Blue) - Used for general notifications.

### Text Colors
- **Primary Text:** `#F8FAFC` - Headings, active values, and primary body text.
- **Secondary Text:** `#94A3B8` - Labels, subtext, and inactive tabs.
- **Disabled Text:** `#475569` - Disabled states and placeholders.

---

## 2. Typography Scale

**Font Family:** Inter (Clean, modern, highly legible for data-heavy interfaces)

- **H1 (Dashboard Titles):** 32px / 40px line-height / SemiBold (600)
- **H2 (Widget Headers):** 24px / 32px line-height / SemiBold (600)
- **H3 (Section Titles):** 20px / 28px line-height / Medium (500)
- **Data Highlight (KPI Values):** 36px / 44px line-height / Bold (700) / Tracking: -0.02em
- **Body Large:** 16px / 24px line-height / Regular (400)
- **Body Base:** 14px / 20px line-height / Regular (400) - *Primary UI font size*
- **Body Small (Labels/Captions):** 12px / 16px line-height / Medium (500)
- **Micro (Badges):** 10px / 12px line-height / Bold (700) / Uppercase

---

## 3. Spacing (8px Grid System)

All margins, paddings, and structural dimensions must follow the 8px grid to maintain rhythm.

- **Micro (0.5x):** 4px - Between icons and text
- **XS (1x):** 8px - Between stacked list items
- **SM (2x):** 16px - Standard component padding (buttons, inputs)
- **MD (3x):** 24px - Standard card internal padding
- **LG (4x):** 32px - Spacing between widgets/cards
- **XL (6x):** 48px - Section breaks
- **2XL (8x):** 64px - Major page layout margins

---

## 4. Component Styles

### Card Styles
- **Background:** `#16181D`
- **Border:** 1px solid `rgba(255, 255, 255, 0.08)`
- **Border Radius:** `16px`
- **Shadow (Soft Glow):** `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.02)`
- **Glassmorphism (Optional for overlays):** `backdrop-filter: blur(12px)` with `background: rgba(22, 24, 29, 0.7)`

### Button Styles
- **Border Radius:** `8px`
- **Primary Button:** 
  - Background: `#9333EA`
  - Text: `#FFFFFF`
  - Hover: `#A855F7`
  - Shadow: `0 4px 12px rgba(147, 51, 234, 0.3)`
- **Secondary / Ghost Button:**
  - Background: Transparent
  - Border: 1px solid `rgba(255, 255, 255, 0.08)`
  - Text: `#F8FAFC`
  - Hover Background: `rgba(255, 255, 255, 0.04)`
- **Danger Button (For actions like "Close Gate"):**
  - Background: `rgba(239, 68, 68, 0.1)`
  - Border: 1px solid `rgba(239, 68, 68, 0.3)`
  - Text: `#EF4444`

### Input Styles (Search, Forms, Selects)
- **Background:** `#111215`
- **Border:** 1px solid `rgba(255, 255, 255, 0.08)`
- **Border Radius:** `8px`
- **Text:** `#F8FAFC`
- **Placeholder:** `#475569`
- **Focus State:** Border changes to `#9333EA` with a soft outer glow `0 0 0 3px rgba(147, 51, 234, 0.2)`

### Table Styles (Incident Logs, Alerts)
- **Header:** Background `#111215`, Text `#94A3B8`, Font 12px Uppercase.
- **Row:** Background `#16181D`, Bottom border `1px solid rgba(255, 255, 255, 0.04)`.
- **Row Hover:** Background `#1C1E24` (slight lightening).
- **Cell Padding:** `12px 16px`
- **Status Badges:** Pill-shaped, 12px radius, colored background with 15% opacity and matching text color (e.g., Red bg 15% / Red text for "High Risk").

---

## 5. Data Visualization & Maps

### Chart Colors (Area, Line, Bar)
- **Primary Metric (e.g., Crowd Density):** `#9333EA` (Purple). For area charts, use a vertical linear gradient from `rgba(147, 51, 234, 0.4)` at the top to `rgba(147, 51, 234, 0)` at the bottom.
- **Secondary Metric (e.g., Inflow Rate):** `#F97316` (Orange).
- **Threshold Lines:** Dashed red line `#EF4444` with a small red glow to indicate danger zones.
- **Grid Lines:** `rgba(255, 255, 255, 0.04)` - Keep them extremely faint to maximize the data-ink ratio.

### Map Theme (Digital Twin & Heatmaps)
- **Base Map:** `#09090B` (Dark void) for outer areas, `#111215` for floor plans / building structures.
- **Wall / Structure Outlines:** `rgba(255, 255, 255, 0.15)`
- **Heatmap Layer:** 
  - Low density: Transparent / No color
  - Medium density: `#F59E0B` (Amber/Orange gradient)
  - High density / Congestion: `#EF4444` (Crimson red) with heavy blur/glow.
- **Camera/Node Markers:** `#9333EA` dots with a subtle pulsing animation for active cameras.

---

## 6. Component Guidelines & Best Practices

1. **Minimize Borders:** Rely on the `16px` card backgrounds and the `32px` spacing grid to separate content visually. Only use borders when absolutely necessary to define interactive elements.
2. **Glassmorphism:** Use glass effects sparingly. Apply it to modals, dropdown menus, and floating map overlays to maintain context without losing focus.
3. **Hierarchy through Opacity:** Instead of introducing new shades of gray, use `#FFFFFF` at different opacities (`100%`, `70%`, `40%`) to establish text hierarchy.
4. **Action-Oriented Design:** The dashboard is for emergency response. Critical actions (Approve, Deploy, Broadcast) must always be visible without scrolling and colored contextually (e.g., Purple for AI recommendation approval, Red for emergency stops).
5. **Animation:** Keep animations under `200ms`. Use subtle ease-out transitions for hover states and modal entrances. Red elements (Danger) may have a slow, infinite pulse (`opacity 0.8 to 1.0`) to draw operator attention.
