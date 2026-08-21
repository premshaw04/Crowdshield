'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { UploadCloud, MapPin, Building, Globe, Map as MapIcon, Image as ImageIcon, Search, CheckCircle2, Loader2, Maximize2, X, Eye, Trash2, RefreshCw } from 'lucide-react';
import { geocodingApi, GeocodingResult, venuesApi, UploadResult } from '@/lib/services';
import { FloorPlan, Venue } from '@/types/venue';

// Dynamically import the Leaflet map so it only renders on client
const VenueMap = dynamic(() => import('@/components/maps/VenueMap'), { ssr: false });

interface CreateVenueFormProps {
  onCancel: () => void;
  onSave: (venue: Venue) => void;
}

export function CreateVenueForm({ onCancel, onSave }: CreateVenueFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    address: '',
    city: '',
    state: '',
    country: '',
    latitude: null as number | null,
    longitude: null as number | null,
    mapType: 'GEOGRAPHIC' as 'GEOGRAPHIC' | 'FLOOR_PLAN',
    floorPlan: undefined as FloorPlan | undefined
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  // Map Picker Modal State
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);

  const inputClass = "w-full bg-[#0a0d14] border border-[#212b3e] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all";
  const labelClass = "flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await geocodingApi.searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search location', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: GeocodingResult) => {
    setFormData(prev => ({
      ...prev,
      address: result.address || prev.address,
      city: result.city || prev.city,
      state: result.state || prev.state,
      country: result.country || prev.country,
      latitude: result.latitude,
      longitude: result.longitude
    }));
    setSearchResults([]);
    setSearchQuery('');
    setIsLocationSelected(true);
    // Reset location selected state after a delay if they want to search again
    setTimeout(() => setIsLocationSelected(false), 3000);
  };

  const handleSave = () => {
    if (!formData.name || !formData.capacity) return;
    
    const newVenue: Venue = {
      id: `v_${Date.now()}`,
      name: formData.name,
      capacity: parseInt(formData.capacity, 10) || 0,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      latitude: formData.latitude ?? undefined,
      longitude: formData.longitude ?? undefined,
      mapType: formData.mapType,
      floorPlan: formData.floorPlan,
      stats: {
        zones: 0,
        gates: 0,
        cameras: 0,
        sensors: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(newVenue);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const tempVenueId = `v_${Date.now()}`;
        const floorPlan = await venuesApi.uploadFloorPlan(tempVenueId, file);
        
        setUploadResult({
          url: floorPlan.fileUrl,
          filename: floorPlan.fileName,
          sizeBytes: file.size,
          width: floorPlan.width,
          height: floorPlan.height
        });
        setFormData(prev => ({ ...prev, mapType: 'FLOOR_PLAN', floorPlan }));
      } catch (error) {
        console.error('Failed to upload floor plan', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeFloorPlan = () => {
    setUploadResult(null);
    setFormData(prev => ({ ...prev, mapType: 'GEOGRAPHIC', floorPlan: undefined }));
  };

  const openMapPicker = () => {
    setTempLocation({ 
      lat: formData.latitude !== null ? formData.latitude : 40.7128, 
      lng: formData.longitude !== null ? formData.longitude : -74.0060 
    });
    setIsMapPickerOpen(true);
  };

  const confirmMapPicker = () => {
    if (tempLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: tempLocation.lat,
        longitude: tempLocation.lng
      }));
      setIsLocationSelected(true);
      setTimeout(() => setIsLocationSelected(false), 3000);
    }
    setIsMapPickerOpen(false);
  };

  return (
    <div className="bg-[#111622] border border-[#212b3e] rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-5 border-b border-[#1a2334] flex items-center justify-between bg-[#0c1018]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building className="text-orange-500" size={20} />
          Venue Configuration
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.name || !formData.capacity}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Save Venue
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh] overflow-y-auto custom-scrollbar">
        
        {/* Left Column: Basic Info & Address */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-[#212b3e] pb-2">Basic Information</h3>
            
            <div>
              <label className={labelClass}>Venue Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className={inputClass} 
                placeholder="e.g. Grand Exhibition Hall"
              />
            </div>
            
            <div>
              <label className={labelClass}>Maximum Capacity *</label>
              <input 
                type="number" 
                value={formData.capacity} 
                onChange={e => setFormData({...formData, capacity: e.target.value})}
                className={inputClass} 
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#212b3e] pb-2">
              <h3 className="text-sm font-bold text-white">Location Details</h3>
              {isLocationSelected && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 animate-in fade-in slide-in-from-right-2">
                  <CheckCircle2 size={14} />
                  Location Selected
                </div>
              )}
            </div>

            {/* Geocoding Search */}
            <div className="relative">
              <label className={labelClass}>Search Location</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search venue or address..."
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 bg-[#212b3e] hover:bg-[#2b3952] disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors min-w-[80px] flex items-center justify-center"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c1018] border border-[#212b3e] rounded-lg shadow-2xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectLocation(result)}
                      className="w-full text-left p-3 border-b border-[#1a2334] hover:bg-[#111622] transition-colors flex flex-col last:border-0"
                    >
                      <span className="font-bold text-white text-sm">{result.name}</span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {result.address}{result.city ? `, ${result.city}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className={labelClass}>
                <MapPin size={14} className="text-slate-500" />
                Physical Address
              </label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})}
                className={inputClass} 
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input 
                  type="text" 
                  value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className={inputClass} 
                  placeholder="e.g. New York"
                />
              </div>
              <div>
                <label className={labelClass}>State / Province</label>
                <input 
                  type="text" 
                  value={formData.state} 
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className={inputClass} 
                  placeholder="e.g. NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <Globe size={14} className="text-slate-500" />
                  Country
                </label>
                <input 
                  type="text" 
                  value={formData.country} 
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className={inputClass} 
                  placeholder="e.g. USA"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Maps & Floor Plan */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#212b3e] pb-2">
              <h3 className="text-sm font-bold text-white flex items-center justify-between w-full">
                <span>Geographic Location</span>
                {formData.latitude !== null && formData.longitude !== null && (
                  <span className="text-[10px] font-mono text-slate-500 bg-[#0a0d14] px-2 py-1 rounded border border-[#212b3e]">
                    {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </span>
                )}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Latitude</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={formData.latitude !== null ? formData.latitude : ''} 
                  onChange={e => setFormData({...formData, latitude: e.target.value ? parseFloat(e.target.value) : null})}
                  className={inputClass} 
                />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input 
                  type="number" 
                  step="0.0001"
                  value={formData.longitude !== null ? formData.longitude : ''} 
                  onChange={e => setFormData({...formData, longitude: e.target.value ? parseFloat(e.target.value) : null})}
                  className={inputClass} 
                />
              </div>
            </div>

            <button 
              onClick={openMapPicker}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0d14] border border-[#212b3e] hover:border-blue-500/50 hover:bg-blue-950/10 text-blue-400 text-sm font-bold rounded-lg transition-all shadow-sm"
            >
              <Maximize2 size={16} />
              Select Location on Map
            </button>

            {/* Outdoor Map Preview */}
            {formData.latitude !== null && formData.longitude !== null ? (
              <div className="h-[220px] w-full mt-2 rounded-lg border border-[#212b3e] overflow-hidden relative group shadow-inner">
                <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 rounded flex items-center gap-1.5 text-[10px] text-white font-bold uppercase tracking-wider shadow-lg">
                  <MapIcon size={12} className="text-blue-400" />
                  Outdoor Map
                </div>
                <VenueMap mode="GEOGRAPHIC" latitude={formData.latitude} longitude={formData.longitude} />
                <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-blue-500/30 transition-colors rounded-lg"></div>
              </div>
            ) : (
              <div className="h-[220px] w-full mt-2 rounded-lg border-2 border-dashed border-[#2b3952] bg-[#0a0d14] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 bg-[#1a2334] rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-300">Location not configured</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Please search for an address or select a location on the map.</p>
                </div>
                <button 
                  onClick={openMapPicker}
                  className="mt-2 px-4 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded border border-blue-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Maximize2 size={14} />
                  Select Location
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#212b3e] pb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Indoor Floor Plan</h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Upload the venue floor plan used to configure zones, gates, cameras and safe routes.
            </p>
            
            {formData.floorPlan && uploadResult ? (
              <div className="relative w-full rounded-xl border border-[#212b3e] bg-[#0c1018] overflow-hidden shadow-lg p-4">
                
                {/* Floor Plan Leaflet Preview */}
                <div className="relative w-full h-[260px] rounded-lg border border-[#1a2334] bg-black overflow-hidden mb-4">
                  <VenueMap 
                    mode="FLOOR_PLAN" 
                    floorPlanUrl={formData.floorPlan.fileUrl} 
                    floorPlanWidth={uploadResult.width} 
                    floorPlanHeight={uploadResult.height}
                    interactive={true}
                  />
                </div>
                
                {/* Metadata & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[250px]" title={uploadResult.filename}>
                      {uploadResult.filename}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-mono text-slate-400 bg-[#1a2334] px-2 py-0.5 rounded border border-[#212b3e]">
                        {(uploadResult.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {uploadResult.width && uploadResult.height && (
                        <span className="text-[10px] font-mono text-slate-400 bg-[#1a2334] px-2 py-0.5 rounded border border-[#212b3e]">
                          {uploadResult.width} x {uploadResult.height}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => window.open(formData.floorPlan?.fileUrl, '_blank')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#212b3e] hover:bg-[#2b3952] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors border border-[#2b3952]"
                    >
                      <Eye size={14} /> Full Image
                    </button>
                    <label className="flex-1 sm:flex-none px-4 py-2 bg-[#212b3e] hover:bg-[#2b3952] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors border border-[#2b3952] cursor-pointer">
                      <RefreshCw size={14} /> Replace
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <button 
                      onClick={removeFloorPlan}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors border border-red-900/30"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center min-h-[160px] w-full border-2 border-dashed ${isUploading ? 'border-orange-500/50 bg-orange-950/10' : 'border-[#2b3952] bg-[#0a0d14] hover:border-orange-500/50 hover:bg-orange-950/10'} rounded-xl cursor-pointer transition-all group`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isUploading ? 'bg-orange-500/20' : 'bg-[#1a2334] group-hover:bg-orange-500/20'}`}>
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-orange-400 transition-colors" />
                    )}
                  </div>
                  <h4 className="text-white text-sm font-bold mb-1">
                    {isUploading ? 'Uploading Floor Plan...' : 'Upload Floor Plan'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {isUploading ? 'Processing image metadata' : 'PNG, JPG, JPEG, SVG (MAX. 10MB)'}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* Full Screen Map Picker Modal */}
      {isMapPickerOpen && tempLocation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200">
          <div className="bg-[#0c1018] border border-[#212b3e] rounded-2xl w-full max-w-5xl h-full max-h-[800px] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1a2334] flex items-center justify-between bg-[#111622]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/30">
                  <MapPin size={16} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Select Precise Location</h2>
                  <p className="text-xs text-slate-400">Click anywhere on the map or drag the marker to update coordinates.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMapPickerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#212b3e] text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Interactive Map */}
            <div className="flex-1 relative">
              <VenueMap
                mode="GEOGRAPHIC"
                latitude={tempLocation.lat} 
                longitude={tempLocation.lng} 
                interactive={true}
                onChangeLocation={(lat, lng) => setTempLocation({ lat, lng })}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                <span className="text-xs font-mono text-slate-300">
                  Lat: <span className="text-white font-bold">{tempLocation.lat.toFixed(6)}</span>
                </span>
                <span className="w-px h-4 bg-[#212b3e]"></span>
                <span className="text-xs font-mono text-slate-300">
                  Lng: <span className="text-white font-bold">{tempLocation.lng.toFixed(6)}</span>
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1a2334] bg-[#111622] flex justify-end gap-3">
              <button 
                onClick={() => setIsMapPickerOpen(false)}
                className="px-6 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMapPicker}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
