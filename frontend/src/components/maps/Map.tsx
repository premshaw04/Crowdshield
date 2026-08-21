'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const heatPoints = [
  { pos: [51.505, -0.09] as [number, number], intensity: 0.9, radius: 40 },
  { pos: [51.503, -0.092] as [number, number], intensity: 0.7, radius: 30 },
  { pos: [51.508, -0.088] as [number, number], intensity: 0.8, radius: 35 },
  { pos: [51.506, -0.085] as [number, number], intensity: 0.6, radius: 25 },
  { pos: [51.502, -0.082] as [number, number], intensity: 0.4, radius: 20 },
];

const getColor = (intensity: number) => {
  if (intensity > 0.8) return '#ef4444'; // Red
  if (intensity > 0.5) return '#eab308'; // Yellow
  return '#22c55e'; // Green
};

export default function Map() {
  return (
    <MapContainer 
      center={[51.505, -0.09]} 
      zoom={15} 
      zoomControl={false}
      style={{ height: '100%', width: '100%', background: '#09090B' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {heatPoints.map((point, idx) => (
        <CircleMarker
          key={idx}
          center={point.pos}
          radius={point.radius}
          pathOptions={{
            fillColor: getColor(point.intensity),
            fillOpacity: 0.4 * point.intensity,
            color: getColor(point.intensity),
            weight: 0,
          }}
        />
      ))}
    </MapContainer>
  );
}
