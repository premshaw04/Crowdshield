export const apiConfig = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000/ws',
  get IS_DEMO_MODE() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crowdshield_demo_mode');
      if (stored !== null) return stored === 'true';
    }
    // Default to true if undefined, ensuring the frontend works out-of-the-box without a backend
    return process.env.NEXT_PUBLIC_IS_DEMO_MODE !== 'false';
  },
  setDemoMode(isDemo: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('crowdshield_demo_mode', String(isDemo));
      window.location.reload();
    }
  },
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  TIMEOUT: 10000,
  MAP_TILES: {
    DARK: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    STREET: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    SATELLITE: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  }
};
