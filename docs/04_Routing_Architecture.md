# Routing Architecture (Next.js App Router)

**Product Name:** CrowdShield AI  
**Framework:** Next.js (App Router)

This document maps out the exact route structure for the application, specifying both the pages (URLs) and where layouts are applied to persist UI elements (like sidebars and topbars) across navigations. No implementation code is included.

---

## Root Architecture

The `src/app/` directory utilizes Route Groups (folders in parentheses) to organize sections of the application without affecting the URL path.

```text
src/app/
├── layout.tsx                     # Root Layout (applies to EVERYTHING: HTML, Body, Providers)
├── page.tsx                       # Root Page (Redirects to /login or /dashboard based on auth state)
│
├── (auth)/                        # Authentication Route Group
│   ├── layout.tsx                 # Auth Layout (Minimal layout, centered card, no sidebar)
│   ├── login/
│   │   └── page.tsx               # Route: /login
│   └── forgot-password/
│       └── page.tsx               # Route: /forgot-password
│
└── (dashboard)/                   # Dashboard Route Group
    ├── layout.tsx                 # Dashboard Layout (Contains main Sidebar and Topbar)
    └── dashboard/
        ├── page.tsx               # Route: /dashboard (Main Overview)
        │
        ├── live-monitoring/
        │   └── page.tsx           # Route: /dashboard/live-monitoring
        │
        ├── heatmap/
        │   └── page.tsx           # Route: /dashboard/heatmap
        │
        ├── digital-twin/
        │   └── page.tsx           # Route: /dashboard/digital-twin (3D View)
        │
        ├── simulation/
        │   └── page.tsx           # Route: /dashboard/simulation
        │
        ├── security-deployment/
        │   └── page.tsx           # Route: /dashboard/security-deployment (Personnel Map)
        │
        ├── gate-control/
        │   └── page.tsx           # Route: /dashboard/gate-control
        │
        ├── iot-sensors/
        │   └── page.tsx           # Route: /dashboard/iot-sensors
        │
        ├── alerts/
        │   ├── page.tsx           # Route: /dashboard/alerts (List of all alerts)
        │   └── [id]/
        │       └── page.tsx       # Route: /dashboard/alerts/[id] (Dynamic route for alert details)
        │
        ├── incident-management/
        │   ├── page.tsx           # Route: /dashboard/incident-management
        │   └── [id]/
        │       └── page.tsx       # Route: /dashboard/incident-management/[id]
        │
        ├── reports/
        │   └── page.tsx           # Route: /dashboard/reports
        │
        ├── users/
        │   ├── page.tsx           # Route: /dashboard/users (User Management & Roles)
        │   └── [id]/
        │       └── page.tsx       # Route: /dashboard/users/[id] (User Profile/Edit)
        │
        └── settings/
            ├── layout.tsx         # Settings Layout (Secondary sidebar for settings navigation)
            ├── page.tsx           # Route: /dashboard/settings (General Settings redirect)
            ├── general/
            │   └── page.tsx       # Route: /dashboard/settings/general
            ├── notifications/
            │   └── page.tsx       # Route: /dashboard/settings/notifications
            └── system/
                └── page.tsx       # Route: /dashboard/settings/system
```

---

## Layout Hierarchy

### 1. Root Layout (`app/layout.tsx`)
- **Scope:** Wraps every page in the application.
- **Responsibilities:** 
  - `<html>` and `<body>` tags.
  - Global Context Providers (ThemeContext, AuthProvider, StoreProvider).
  - Global CSS imports.
  - Metadata definition.

### 2. Auth Layout (`app/(auth)/layout.tsx`)
- **Scope:** Wraps `/login` and `/forgot-password`.
- **Responsibilities:** 
  - Minimalistic UI container.
  - Dark background with subtle CrowdShield branding.
  - Centered content container.

### 3. Dashboard Layout (`app/(dashboard)/layout.tsx`)
- **Scope:** Wraps all routes starting with `/dashboard`.
- **Responsibilities:** 
  - **Sidebar Navigation:** The primary navigation menu containing links to all modules (Live Monitoring, Heatmap, etc.).
  - **Topbar (Header):** Contains the global search, notifications bell, user profile dropdown, and current view title.
  - **Main Content Area:** The scrolling area where the child pages (`page.tsx`) are rendered.

### 4. Settings Layout (`app/(dashboard)/dashboard/settings/layout.tsx`)
- **Scope:** Wraps all nested routes under `/dashboard/settings`.
- **Responsibilities:** 
  - Injects a secondary vertical or horizontal tab menu specifically for navigating between settings categories (General, Notifications, System).
