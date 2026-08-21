# Folder Structure

**Product Name:** CrowdShield AI  
**Architecture:** Next.js App Router, Feature-Based, Atomic Design, TypeScript  

## Directory Tree

```text
src/
├── app/                              # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                       # Authentication routes group
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Main application routes group
│   │   ├── dashboard/                # Main Overview
│   │   ├── monitoring/               # Live Monitoring
│   │   ├── analytics/                # Reports & Analytics
│   │   ├── simulation/               # Crowd Simulation
│   │   ├── digital-twin/             # 3D Digital Twin View
│   │   ├── security/                 # Security Deployment
│   │   ├── alerts/                   # Alerts & Risks
│   │   ├── incident-management/      # Incidents
│   │   ├── iot/                      # IoT Sensors
│   │   ├── gate-control/             # Gate Control
│   │   ├── settings/                 # App Settings
│   │   ├── users/                    # Users & Roles
│   │   └── layout.tsx                # Main Dashboard Layout (Sidebar, Topbar)
│   ├── api/                          # Next.js Route Handlers
│   ├── globals.css                   # Global styles
│   └── layout.tsx                    # Root Layout
│
├── features/                         # Feature-Based Architecture
│   ├── dashboard/
│   │   ├── components/               # Feature-specific components
│   │   ├── hooks/
│   │   ├── services/                 # API calls for this feature
│   │   └── types.ts
│   ├── monitoring/
│   ├── analytics/
│   ├── simulation/
│   ├── digital-twin/
│   ├── security/
│   ├── alerts/
│   ├── reports/
│   ├── settings/
│   ├── users/
│   ├── iot/
│   └── gate-control/
│
├── components/                       # Shared / Reusable Components (Atomic Design)
│   ├── atoms/                        # Buttons, Inputs, Typography, Badges, Icons
│   ├── molecules/                    # Form fields, Search bars, Alert banners
│   ├── organisms/                    # Navigation, Topbar, Data Tables, Modal Dialogs
│   ├── templates/                    # Page layouts, generic grid structures
│   ├── charts/                       # Reusable Chart components (Area, Line, Bar)
│   ├── maps/                         # Map and GIS components
│   └── heatmaps/                     # Heatmap overlays and canvas components
│
├── hooks/                            # Shared Custom React Hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── usePagination.ts
│
├── contexts/                         # React Contexts (Global state)
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── state/                            # Global State Management (e.g., Zustand/Redux)
│   ├── useAlertStore.ts
│   └── useCameraStore.ts
│
├── types/                            # Global TypeScript Declarations and Interfaces
│   ├── index.d.ts
│   ├── api.types.ts
│   └── models.types.ts
│
├── utils/                            # Utilities (Helper functions)
│   ├── formatters.ts                 # Date, number, currency formatting
│   ├── validators.ts
│   └── constants.ts
│
├── theme/                            # Design System Configuration
│   ├── colors.ts                     # Color tokens from Design System
│   ├── typography.ts                 # Typography scale
│   └── spacing.ts                    # 8px grid configuration
│
├── assets/                           # Static Assets (Images, Icons, Fonts)
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── config/                           # Environment and App Configuration
    └── env.ts
```

## Description of Architecture

1. **App Router (`src/app/`)**: Handles all routing. We use route groups like `(dashboard)` to share layouts without adding path segments to the URL, keeping the UI structure clean.
2. **Feature-Based Architecture (`src/features/`)**: Each major domain of the application (e.g., `monitoring`, `alerts`, `gate-control`) encapsulates its own logic, state, and specific components. This makes the codebase highly scalable, maintainable, and prevents the components folder from becoming bloated.
3. **Atomic Design (`src/components/`)**: Only *shared* and *reusable* components live here, strictly categorized by complexity (Atoms -> Molecules -> Organisms -> Templates).
4. **Specialized Shared Components (`src/components/charts/`, `maps/`, `heatmaps/`)**: Given the data-heavy and spatial nature of CrowdShield AI, data visualization components are explicitly separated for easy maintenance and reuse across different features.
5. **State Management (`src/state/` & `src/contexts/`)**: Global application state that spans across multiple features (like user session, themes, or global websocket connections) lives here.
6. **Design System Integration (`src/theme/`)**: The tokens defined in our Design System document are stored here as constants/variables to provide a single source of truth for styling across the application.
