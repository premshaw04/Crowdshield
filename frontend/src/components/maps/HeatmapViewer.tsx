'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface HeatmapViewerProps {
  activeZone: string;
}

const generateHeatmapPoints = (centerLat: number, centerLng: number, count: number, spread: number, baseIntensity: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    // Generate random points around the center using Gaussian-like distribution
    const r = spread * Math.sqrt(-2 * Math.log(Math.random()));
    const theta = 2 * Math.PI * Math.random();
    const lat = centerLat + r * Math.cos(theta);
    const lng = centerLng + r * Math.sin(theta);
    
    // Closer to center = higher intensity
    const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
    const intensity = Math.max(0.1, baseIntensity * (1 - (dist / spread)));

    points.push({ pos: [lat, lng] as [number, number], intensity, radius: Math.random() * 20 + 20 });
  }
  return points;
};

const getColor = (intensity: number) => {
  if (intensity > 0.75) return '#ef4444'; // Red
  if (intensity > 0.4) return '#f59e0b'; // Amber/Orange
  return '#22c55e'; // Green
};

export const HeatmapViewer: React.FC<HeatmapViewerProps> = React.memo(({ activeZone }) => {
  
  // Center of our "mall/venue"
  const baseCenter = [51.505, -0.09];

  // Generate dynamic clusters based on activeZone
  const heatPoints = useMemo(() => {
    let clusters: { lat: number, lng: number, count: number, spread: number, intensity: number }[] = [];
    
    if (activeZone === 'All Zones') {
      clusters = [
        { lat: 51.505, lng: -0.09, count: 60, spread: 0.003, intensity: 0.9 }, // Main hotspot (Food court)
        { lat: 51.502, lng: -0.086, count: 40, spread: 0.002, intensity: 0.7 }, // Secondary (Entrance)
        { lat: 51.507, lng: -0.094, count: 30, spread: 0.0025, intensity: 0.5 }, // Medium area
        { lat: 51.504, lng: -0.082, count: 20, spread: 0.004, intensity: 0.3 }, // Low density area
      ];
    } else if (activeZone === 'Zone A') {
      clusters = [{ lat: 51.505, lng: -0.09, count: 80, spread: 0.003, intensity: 0.9 }];
    } else if (activeZone === 'Zone B') {
      clusters = [{ lat: 51.502, lng: -0.086, count: 70, spread: 0.002, intensity: 0.8 }];
    } else if (activeZone === 'Zone C') {
      clusters = [{ lat: 51.507, lng: -0.094, count: 50, spread: 0.0025, intensity: 0.6 }];
    } else {
      clusters = [{ lat: 51.504, lng: -0.082, count: 30, spread: 0.004, intensity: 0.4 }];
    }

    let allPoints: { pos: [number, number]; intensity: number; radius: number }[] = [];
    clusters.forEach(c => {
      allPoints = [...allPoints, ...generateHeatmapPoints(c.lat, c.lng, c.count, c.spread, c.intensity)];
    });
    return allPoints;
  }, [activeZone]);

  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      <MapContainer 
        center={[51.5045, -0.088]} 
        zoom={15} 
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          opacity={0.6} // Darken the tiles further to match Deep Dark Red theme
        />
        
        {/* Custom pane for heatmap points to ensure they render above tiles but below controls if any */}
        <Pane name="heatmapPane" style={{ zIndex: 400 }}>
          {heatPoints.map((point, idx) => (
            <CircleMarker
              key={idx}
              center={point.pos}
              radius={point.radius}
              pathOptions={{
                fillColor: getColor(point.intensity),
                fillOpacity: 0.15 + (point.intensity * 0.2), // Layering creates the hotspot effect
                color: 'transparent', // No border
                weight: 0,
              }}
            />
          ))}
        </Pane>
      </MapContainer>
    </div>
  );
});

HeatmapViewer.displayName = 'HeatmapViewer';
