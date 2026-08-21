'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, LayersControl, ImageOverlay, Polygon, Polyline } from 'react-leaflet';
import { LocateFixed, ImageOff, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Venue } from '@/types/venue';
import { apiConfig } from '@/lib/api/config';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export type MapMode = 'GEOGRAPHIC' | 'FLOOR_PLAN';

export interface VenueMapProps {
  mode: MapMode;
  className?: string;
  interactive?: boolean;
  venue?: Venue;
  
  // GEOGRAPHIC props
  latitude?: number;
  longitude?: number;
  onChangeLocation?: (lat: number, lng: number) => void;
  
  // FLOOR_PLAN props
  floorPlanUrl?: string;
  floorPlanWidth?: number;
  floorPlanHeight?: number;

  children?: React.ReactNode;
}

// Map Updater Component to change center when lat/lng change
function MapUpdater({ center, interactive }: { center: [number, number]; interactive?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!interactive) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map, interactive]);
  return null;
}

// Event handler for clicking the map
function MapClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom Recenter Button for Geographic Mode
function LocateButton({ center }: { center: [number, number] }) {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-right mt-14 mr-2.5 z-[1000] absolute">
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.flyTo(center, 16);
        }}
        className="w-[34px] h-[34px] bg-[#0c1018]/90 backdrop-blur border border-[#212b3e] rounded shadow-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1a2334] transition-colors"
        title="Locate Venue"
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}

// Geographic Map Renderer
function GeographicMapRenderer({ latitude, longitude, interactive, onChangeLocation, venue, children }: VenueMapProps) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null && onChangeLocation) {
          const position = marker.getLatLng();
          onChangeLocation(position.lat, position.lng);
        }
      },
    }),
    [onChangeLocation],
  );

  const center: [number, number] = [latitude || 0, longitude || 0];

  return (
    <MapContainer 
      center={center} 
      zoom={16} 
      zoomControl={interactive} 
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      style={{ height: '100%', width: '100%', background: '#09090B' }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Dark Map">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url={apiConfig.MAP_TILES.DARK}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Street / Terrain">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url={apiConfig.MAP_TILES.STREET}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url={apiConfig.MAP_TILES.SATELLITE}
          />
        </LayersControl.BaseLayer>

        {/* Venue Extents & Surroundings Layers */}
        {venue?.boundary && (
          <LayersControl.Overlay checked name="Venue Boundary">
            <Polygon 
              positions={venue.boundary.coordinates.map(c => [c.lat, c.lng]) as L.LatLngExpression[]} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }} 
            />
          </LayersControl.Overlay>
        )}

        {venue?.parkingLocations && venue.parkingLocations.length > 0 && (
          <LayersControl.Overlay checked name="Parking">
            {venue.parkingLocations.map(parking => (
              <Polygon 
                key={parking.id}
                positions={parking.coordinates.map(c => [c.lat, c.lng]) as L.LatLngExpression[]}
                pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.2, weight: 2 }}
              />
            ))}
          </LayersControl.Overlay>
        )}

        {venue?.externalGates && venue.externalGates.length > 0 && (
          <LayersControl.Overlay checked name="External Gates">
            {venue.externalGates.map(gate => (
              <Marker 
                key={gate.id}
                position={[gate.coordinates[0].lat, gate.coordinates[0].lng]}
                icon={new L.Icon({
                  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                  iconSize: [20, 32],
                  iconAnchor: [10, 32],
                  className: 'hue-rotate-[140deg] saturate-200' // Make gate markers green-ish via CSS filter
                })}
              />
            ))}
          </LayersControl.Overlay>
        )}

        {venue?.emergencyAccessRoutes && venue.emergencyAccessRoutes.length > 0 && (
          <LayersControl.Overlay checked name="Emergency Access">
            {venue.emergencyAccessRoutes.map(route => (
              <Polyline 
                key={route.id}
                positions={route.coordinates.map(c => [c.lat, c.lng]) as L.LatLngExpression[]}
                pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 10' }}
              />
            ))}
          </LayersControl.Overlay>
        )}

        {venue?.nearbyRoads && venue.nearbyRoads.length > 0 && (
          <LayersControl.Overlay checked name="Nearby Roads">
            {venue.nearbyRoads.map(road => (
              <Polyline 
                key={road.id}
                positions={road.coordinates.map(c => [c.lat, c.lng]) as L.LatLngExpression[]}
                pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.7 }}
              />
            ))}
          </LayersControl.Overlay>
        )}
      </LayersControl>

      {latitude !== undefined && longitude !== undefined && (
        <Marker 
          position={center} 
          icon={customIcon} 
          draggable={interactive} 
          eventHandlers={interactive ? eventHandlers : undefined}
          ref={markerRef}
        />
      )}
      
      <MapUpdater center={center} interactive={interactive} />
      {interactive && onChangeLocation && <MapClickHandler onChange={onChangeLocation} />}
      {interactive && <LocateButton center={center} />}
      {children}
    </MapContainer>
  );
}

// Floor Plan Map Renderer
function FloorPlanMapRenderer({ floorPlanUrl, floorPlanWidth, floorPlanHeight, interactive, children }: VenueMapProps) {
  if (!floorPlanUrl || !floorPlanWidth || !floorPlanHeight) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#0a0e14] text-slate-500 text-sm border border-dashed border-[#222e42] rounded-lg">
        <ImageOff size={40} className="mb-3 opacity-40 text-slate-600" />
        <p className="mb-1 font-medium text-slate-400">No Floor Plan Configured</p>
        <p className="text-xs text-slate-500">Please upload a valid blueprint in the Venue Settings.</p>
      </div>
    );
  }

  // Define local coordinate system bounds: [[0, 0], [height, width]]
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [floorPlanHeight, floorPlanWidth]
  ];

  return (
    <MapContainer 
      crs={L.CRS.Simple}
      bounds={bounds}
      maxZoom={3}
      minZoom={-3}
      zoomControl={interactive} 
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      style={{ height: '100%', width: '100%', background: '#0a0d14' }}
    >
      <ImageOverlay 
        url={floorPlanUrl}
        bounds={bounds}
      />
      {children}
    </MapContainer>
  );
}

export default function VenueMap(props: VenueMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-[#0a0d14] flex flex-col items-center justify-center border border-[#1a2334] rounded-lg ${props.className || 'w-full h-full'}`}>
        <Loader2 className="animate-spin text-slate-600 mb-2" size={24} />
        <span className="text-slate-500 text-sm font-medium">Initializing Map Engine...</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-[#212b3e] relative ${props.className || 'w-full h-full'}`}>
      {props.mode === 'GEOGRAPHIC' ? (
        <GeographicMapRenderer {...props} />
      ) : (
        <FloorPlanMapRenderer {...props} />
      )}
    </div>
  );
}
