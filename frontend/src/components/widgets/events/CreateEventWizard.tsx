'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EventZone, EventGate, EventCamera, EventSafetyThresholds, EventType, Event as CrowdEvent } from '@/types/event';
import { Venue } from '@/types/venue';
import { MOCK_VENUES } from '@/lib/constants/venues';
import { eventService, venuesApi } from '@/lib/services';
import { CreateVenueForm } from './CreateVenueForm';

const STEPS = [
  'Basic Info',
  'Venue',
  'Zones',
  'Gates',
  'Cameras',
  'Safety',
  'Review'
];

interface WizardState {
  name: string;
  description: string;
  eventType: EventType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  expectedVisitors: string;
  estimatedPeakVisitors: string;
  organizer: string;
  emergencyContact: string;
  venueId: string;
  venueName: string;
  zones: EventZone[];
  gates: EventGate[];
  cameras: EventCamera[];
  safetyThresholds: EventSafetyThresholds;
}

const INITIAL_STATE: WizardState = {
  name: '',
  description: '',
  eventType: 'PUBLIC_EVENT',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  expectedVisitors: '',
  estimatedPeakVisitors: '',
  organizer: '',
  emergencyContact: '',
  venueId: '',
  venueName: '',
  zones: [],
  gates: [],
  cameras: [],
  safetyThresholds: {
    warningDensity: 4,
    highDensity: 6,
    criticalDensity: 7,
    minCrowdSpeed: 0.5,
    maxZoneOccupancy: 85,
    maxEntryRate: 1000,
    predictionHorizon: 15
  }
};

export const CreateEventWizard = () => {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<CrowdEvent | null>(null);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);

  React.useEffect(() => {
    const fetchVenues = async () => {
      setIsLoadingVenues(true);
      try {
        const data = await venuesApi.getAllVenues();
        setVenues(data);
      } catch (err) {
        console.error('Failed to fetch venues', err);
        setVenues(MOCK_VENUES); // fallback for demo if needed
      } finally {
        setIsLoadingVenues(false);
      }
    };
    fetchVenues();
  }, []);

  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Partial<EventZone> | null>(null);
  const [zoneFormErrors, setZoneFormErrors] = useState<Record<string, string>>({});

  const [showGateModal, setShowGateModal] = useState(false);
  const [editingGate, setEditingGate] = useState<Partial<EventGate> | null>(null);
  const [gateFormErrors, setGateFormErrors] = useState<Record<string, string>>({});

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Partial<EventCamera> | null>(null);
  const [cameraFormErrors, setCameraFormErrors] = useState<Record<string, string>>({});

  const [safetyFormErrors, setSafetyFormErrors] = useState<Record<string, string>>({});

  const updateForm = (updates: Partial<WizardState>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (currentStep === 0) setStep1Errors({}); // Clear errors on change
  };

  const handleNext = () => {
    // Basic validation before next
    if (currentStep === 0) {
      const errors: Record<string, string> = {};
      if (!formData.name.trim()) errors.name = 'Event name is required';
      if (!formData.eventType) errors.eventType = 'Event type is required';
      if (!formData.startDate) errors.startDate = 'Start date is required';
      if (!formData.startTime) errors.startTime = 'Start time is required';
      if (!formData.endDate) errors.endDate = 'End date is required';
      if (!formData.endTime) errors.endTime = 'End time is required';
      
      const expected = parseInt(formData.expectedVisitors, 10);
      if (isNaN(expected) || expected <= 0) {
        errors.expectedVisitors = 'Expected visitors must be greater than 0';
      }

      if (formData.estimatedPeakVisitors) {
        const peak = parseInt(formData.estimatedPeakVisitors, 10);
        if (isNaN(peak) || peak < expected) {
          errors.estimatedPeakVisitors = 'Peak visitors must be >= expected visitors';
        }
      }

      if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(`${formData.endDate}T${formData.endTime}`);
        if (end <= start) {
          errors.endDate = 'End date/time must be after start date/time';
          errors.endTime = 'End date/time must be after start date/time';
        }
      }

      if (Object.keys(errors).length > 0) {
        setStep1Errors(errors);
        return;
      }
    }
    
    if (currentStep === 1) {
      if (!formData.venueId) {
        setError('Please select a venue.');
        return;
      }
    }

    if (currentStep === 2) {
      if (formData.zones.length === 0) {
        setError('Please configure at least one monitoring zone.');
        return;
      }
    }

    if (currentStep === 3) {
      if (formData.gates.length === 0) {
        setError('Please configure at least one gate.');
        return;
      }
    }

    if (currentStep === 4) {
      if (formData.cameras.length === 0) {
        setError('Please configure at least one camera.');
        return;
      }
    }

    if (currentStep === 5) {
      const { warningDensity, highDensity, criticalDensity, minCrowdSpeed, maxZoneOccupancy, maxEntryRate, predictionHorizon } = formData.safetyThresholds;
      const errors: Record<string, string> = {};

      if (warningDensity <= 0) errors.warningDensity = 'Must be > 0';
      if (highDensity <= warningDensity) errors.highDensity = 'Must be > Warning Density';
      if (criticalDensity <= highDensity) errors.criticalDensity = 'Must be > High Density';
      if (minCrowdSpeed < 0) errors.minCrowdSpeed = 'Cannot be negative';
      if (maxZoneOccupancy <= 0 || maxZoneOccupancy > 100) errors.maxZoneOccupancy = 'Must be between 1 and 100';
      if (maxEntryRate <= 0) errors.maxEntryRate = 'Must be > 0';
      if (predictionHorizon <= 0) errors.predictionHorizon = 'Must be > 0';

      if (Object.keys(errors).length > 0) {
        setSafetyFormErrors(errors);
        setError('Please fix the errors in the safety thresholds.');
        return;
      }
      setSafetyFormErrors({});
    }
    
    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newEvent = await eventService.createEvent({
        name: formData.name,
        description: formData.description,
        eventType: formData.eventType,
        startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        expectedVisitors: parseInt(formData.expectedVisitors, 10) || 0,
        estimatedPeakVisitors: formData.estimatedPeakVisitors ? parseInt(formData.estimatedPeakVisitors, 10) : undefined,
        organizer: formData.organizer,
        emergencyContact: formData.emergencyContact,
        venueId: formData.venueId,
        venueName: formData.venueName,
        status: 'UPCOMING',
        createdBy: 'usr_admin',
        zones: formData.zones,
        gates: formData.gates,
        cameras: formData.cameras,
        safetyThresholds: formData.safetyThresholds
      });
      setCreatedEvent(newEvent);
    } catch {
      setError('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transition: any = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  };

  const inputClass = "w-full bg-[#111622] border border-[#212b3e] rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

  // --- Step Components ---

  const StepBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="eventName" className={labelClass}>Event Name *</label>
        <input 
          id="eventName"
          type="text" 
          value={formData.name} 
          onChange={e => updateForm({ name: e.target.value })}
          className={`${inputClass} ${step1Errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}`} 
          placeholder="e.g. Summer Music Festival" 
        />
        {step1Errors.name && <p className="text-red-400 text-xs mt-1">{step1Errors.name}</p>}
      </div>
      <div>
        <label htmlFor="eventDesc" className={labelClass}>Description</label>
        <textarea 
          id="eventDesc"
          value={formData.description} 
          onChange={e => updateForm({ description: e.target.value })}
          className={`${inputClass} min-h-[80px]`} 
          placeholder="Brief overview of the event..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventType" className={labelClass}>Event Type *</label>
          <select 
            id="eventType"
            value={formData.eventType} 
            onChange={e => updateForm({ eventType: e.target.value as EventType })}
            className={`${inputClass} ${step1Errors.eventType ? 'border-red-500' : ''}`}
          >
            <option value="PUBLIC_EVENT">Public Event</option>
            <option value="FESTIVAL">Festival</option>
            <option value="CONCERT">Concert</option>
            <option value="SPORTS">Sports</option>
            <option value="SHOPPING">Shopping / Sale</option>
            <option value="RELIGIOUS">Religious Gathering</option>
            <option value="TRANSPORT">Transport</option>
            <option value="OTHER">Other</option>
          </select>
          {step1Errors.eventType && <p className="text-red-400 text-xs mt-1">{step1Errors.eventType}</p>}
        </div>
        <div>
          <label htmlFor="eventOrg" className={labelClass}>Event Organizer</label>
          <input 
            id="eventOrg"
            type="text" 
            value={formData.organizer} 
            onChange={e => updateForm({ organizer: e.target.value })}
            className={inputClass} 
            placeholder="e.g. Acme Corp" 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className={labelClass}>Start Date *</label>
          <input 
            id="startDate"
            type="date" 
            value={formData.startDate} 
            onChange={e => updateForm({ startDate: e.target.value })}
            className={`${inputClass} ${step1Errors.startDate ? 'border-red-500' : ''}`} 
          />
          {step1Errors.startDate && <p className="text-red-400 text-xs mt-1">{step1Errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="startTime" className={labelClass}>Start Time *</label>
          <input 
            id="startTime"
            type="time" 
            value={formData.startTime} 
            onChange={e => updateForm({ startTime: e.target.value })}
            className={`${inputClass} ${step1Errors.startTime ? 'border-red-500' : ''}`} 
          />
          {step1Errors.startTime && <p className="text-red-400 text-xs mt-1">{step1Errors.startTime}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="endDate" className={labelClass}>End Date *</label>
          <input 
            id="endDate"
            type="date" 
            value={formData.endDate} 
            onChange={e => updateForm({ endDate: e.target.value })}
            className={`${inputClass} ${step1Errors.endDate ? 'border-red-500' : ''}`} 
          />
          {step1Errors.endDate && <p className="text-red-400 text-xs mt-1">{step1Errors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="endTime" className={labelClass}>End Time *</label>
          <input 
            id="endTime"
            type="time" 
            value={formData.endTime} 
            onChange={e => updateForm({ endTime: e.target.value })}
            className={`${inputClass} ${step1Errors.endTime ? 'border-red-500' : ''}`} 
          />
          {step1Errors.endTime && <p className="text-red-400 text-xs mt-1">{step1Errors.endTime}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expVisitors" className={labelClass}>Expected Visitors *</label>
          <input 
            id="expVisitors"
            type="number" 
            value={formData.expectedVisitors} 
            onChange={e => updateForm({ expectedVisitors: e.target.value })}
            className={`${inputClass} ${step1Errors.expectedVisitors ? 'border-red-500' : ''}`} 
            placeholder="e.g. 15000" 
          />
          {step1Errors.expectedVisitors && <p className="text-red-400 text-xs mt-1">{step1Errors.expectedVisitors}</p>}
        </div>
        <div>
          <label htmlFor="peakVisitors" className={labelClass}>Estimated Peak Visitors</label>
          <input 
            id="peakVisitors"
            type="number" 
            value={formData.estimatedPeakVisitors} 
            onChange={e => updateForm({ estimatedPeakVisitors: e.target.value })}
            className={`${inputClass} ${step1Errors.estimatedPeakVisitors ? 'border-red-500' : ''}`} 
            placeholder="e.g. 20000" 
          />
          {step1Errors.estimatedPeakVisitors && <p className="text-red-400 text-xs mt-1">{step1Errors.estimatedPeakVisitors}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="emergencyContact" className={labelClass}>Emergency Contact</label>
        <input 
          id="emergencyContact"
          type="text" 
          value={formData.emergencyContact} 
          onChange={e => updateForm({ emergencyContact: e.target.value })}
          className={inputClass} 
          placeholder="e.g. John Doe - +1 234 567 890" 
        />
      </div>
    </div>
  );

  const handleSaveNewVenue = async (created: Venue) => {
    try {
      const newVenue = await venuesApi.createVenue(created);
      setVenues(prev => [...prev, newVenue]);
      updateForm({ venueId: newVenue.id, venueName: newVenue.name });
      setShowVenueModal(false);
    } catch (err) {
      console.error('Failed to create venue', err);
    }
  };

  const StepVenue = () => (
    <div className="space-y-6">
      {!showVenueModal ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Select Existing Venue</h3>
            <button 
              onClick={() => setShowVenueModal(true)}
              className="px-3 py-1.5 text-xs font-bold text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded hover:bg-orange-900/50 transition-colors"
            >
              + Create Venue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venues.map(v => {
              const isSelected = formData.venueId === v.id;
              return (
                <div 
                  key={v.id}
                  onClick={() => updateForm({ venueId: v.id, venueName: v.name })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-orange-950/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                      : 'bg-[#111622] border-[#212b3e] hover:border-[#2b3952]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`font-bold ${isSelected ? 'text-orange-400' : 'text-white'}`}>{v.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{v.address}</p>
                    </div>
                    {isSelected && <CheckCircle2 size={18} className="text-orange-500 shrink-0" />}
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Capacity:</span>
                      <span className="text-slate-200 font-mono ml-1">{v.capacity.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Zones:</span>
                      <span className="text-slate-200 font-mono ml-1">{v.stats.zones}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Gates:</span>
                      <span className="text-slate-200 font-mono ml-1">{v.stats.gates}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cameras:</span>
                      <span className="text-slate-200 font-mono ml-1">{v.stats.cameras}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sensors:</span>
                      <span className="text-slate-200 font-mono ml-1">{v.stats.sensors}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <CreateVenueForm 
          onCancel={() => setShowVenueModal(false)}
          onSave={handleSaveNewVenue}
        />
      )}
    </div>
  );

  const handleSaveZone = () => {
    if (!editingZone) return;
    
    const errors: Record<string, string> = {};
    if (!editingZone.name?.trim()) errors.name = 'Zone Name is required';
    if (!editingZone.capacity || editingZone.capacity <= 0) errors.capacity = 'Capacity must be > 0';
    if (!editingZone.areaSqM || editingZone.areaSqM <= 0) errors.areaSqM = 'Area must be > 0';
    
    const warning = editingZone.warningDensity || 0;
    const high = editingZone.highDensity || 0;
    const critical = editingZone.criticalDensity || 0;

    if (warning <= 0) errors.warningDensity = 'Warning density must be > 0';
    if (high <= warning) errors.highDensity = 'High density must be > warning density';
    if (critical <= high) errors.criticalDensity = 'Critical density must be > high density';

    if (Object.keys(errors).length > 0) {
      setZoneFormErrors(errors);
      return;
    }

    setZoneFormErrors({});
    if (editingZone.id) {
      // Edit existing
      updateForm({ zones: formData.zones.map(z => z.id === editingZone.id ? editingZone as EventZone : z) });
    } else {
      // Add new
      updateForm({ zones: [...formData.zones, { ...editingZone, id: `z_${Date.now()}` } as EventZone] });
    }
    setShowZoneModal(false);
    setEditingZone(null);
  };

  const StepZones = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Configure Event Zones</h3>
        <button 
          onClick={() => {
            setEditingZone({ name: '', capacity: 0, areaSqM: 0, warningDensity: 0, highDensity: 0, criticalDensity: 0 });
            setZoneFormErrors({});
            setShowZoneModal(true);
          }}
          className="px-3 py-1.5 text-xs font-bold text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded hover:bg-orange-900/50 transition-colors"
        >
          + Add Zone
        </button>
      </div>

      {formData.zones.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#1a2334] rounded-lg text-slate-500 text-sm">
          No zones configured yet. Add zones like &quot;Main Stage&quot; or &quot;Food Court&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.zones.map(zone => (
            <div key={zone.id} className="p-4 bg-[#111622] border border-[#212b3e] rounded-xl hover:border-[#2b3952] transition-colors relative group">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-white">{zone.name}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingZone(zone);
                      setZoneFormErrors({});
                      setShowZoneModal(true);
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => updateForm({ zones: formData.zones.filter(z => z.id !== zone.id) })}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs mb-3 pb-3 border-b border-[#1a2334]">
                <div>
                  <span className="text-slate-500">Capacity:</span>
                  <span className="text-slate-200 font-mono ml-1">{zone.capacity?.toLocaleString() || 0}</span>
                </div>
                <div>
                  <span className="text-slate-500">Area:</span>
                  <span className="text-slate-200 font-mono ml-1">{zone.areaSqM?.toLocaleString() || 0} m²</span>
                </div>
                <div>
                  <span className="text-slate-500">Cameras:</span>
                  <span className="text-slate-200 font-mono ml-1">0</span>
                </div>
                <div>
                  <span className="text-slate-500">Population:</span>
                  <span className="text-slate-200 font-mono ml-1">0</span>
                </div>
              </div>
              <div className="flex gap-3 text-[10px] font-mono justify-between">
                <div className="text-amber-500 flex flex-col"><span>WARN</span><span>{zone.warningDensity} p/m²</span></div>
                <div className="text-orange-500 flex flex-col"><span>HIGH</span><span>{zone.highDensity} p/m²</span></div>
                <div className="text-red-500 flex flex-col"><span>CRIT</span><span>{zone.criticalDensity} p/m²</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0c1018] border border-[#1a2334] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">{editingZone?.id ? 'Edit Zone' : 'Add Zone'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Zone Name *</label>
                <input 
                  type="text" 
                  value={editingZone?.name || ''} 
                  onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                  className={`${inputClass} ${zoneFormErrors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g. Food Court"
                />
                {zoneFormErrors.name && <p className="text-red-400 text-xs mt-1">{zoneFormErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Capacity *</label>
                  <input 
                    type="number" 
                    value={editingZone?.capacity || ''} 
                    onChange={e => setEditingZone({ ...editingZone, capacity: parseInt(e.target.value, 10) || 0 })}
                    className={`${inputClass} ${zoneFormErrors.capacity ? 'border-red-500' : ''}`}
                  />
                  {zoneFormErrors.capacity && <p className="text-red-400 text-xs mt-1">{zoneFormErrors.capacity}</p>}
                </div>
                <div>
                  <label className={labelClass}>Area (m²) *</label>
                  <input 
                    type="number" 
                    value={editingZone?.areaSqM || ''} 
                    onChange={e => setEditingZone({ ...editingZone, areaSqM: parseInt(e.target.value, 10) || 0 })}
                    className={`${inputClass} ${zoneFormErrors.areaSqM ? 'border-red-500' : ''}`}
                  />
                  {zoneFormErrors.areaSqM && <p className="text-red-400 text-xs mt-1">{zoneFormErrors.areaSqM}</p>}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1a2334]">
                <h4 className="text-xs uppercase font-bold text-slate-500 mb-3">Density Thresholds (people / m²)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Warning</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingZone?.warningDensity || ''} 
                      onChange={e => setEditingZone({ ...editingZone, warningDensity: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} ${zoneFormErrors.warningDensity ? 'border-red-500' : ''}`}
                    />
                    {zoneFormErrors.warningDensity && <p className="text-red-400 text-xs mt-1 leading-tight">{zoneFormErrors.warningDensity}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>High</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingZone?.highDensity || ''} 
                      onChange={e => setEditingZone({ ...editingZone, highDensity: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} ${zoneFormErrors.highDensity ? 'border-red-500' : ''}`}
                    />
                    {zoneFormErrors.highDensity && <p className="text-red-400 text-xs mt-1 leading-tight">{zoneFormErrors.highDensity}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Critical</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingZone?.criticalDensity || ''} 
                      onChange={e => setEditingZone({ ...editingZone, criticalDensity: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} ${zoneFormErrors.criticalDensity ? 'border-red-500' : ''}`}
                    />
                    {zoneFormErrors.criticalDensity && <p className="text-red-400 text-xs mt-1 leading-tight">{zoneFormErrors.criticalDensity}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowZoneModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveZone}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Save Zone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleSaveGate = () => {
    if (!editingGate) return;
    
    const errors: Record<string, string> = {};
    if (!editingGate.name?.trim()) errors.name = 'Gate Name is required';
    if (!editingGate.gateNumber || editingGate.gateNumber <= 0) errors.gateNumber = 'Gate number must be > 0';
    if (!editingGate.capacityPerHour || editingGate.capacityPerHour <= 0) errors.capacityPerHour = 'Capacity must be > 0';
    if (!editingGate.associatedZoneId) errors.associatedZoneId = 'Please associate a zone';

    // check duplicate gate number
    const isDuplicate = formData.gates.some(g => g.gateNumber === editingGate.gateNumber && g.id !== editingGate.id);
    if (isDuplicate) {
      errors.gateNumber = 'Gate number must be unique';
    }

    if (Object.keys(errors).length > 0) {
      setGateFormErrors(errors);
      return;
    }

    setGateFormErrors({});
    if (editingGate.id) {
      updateForm({ gates: formData.gates.map(g => g.id === editingGate.id ? editingGate as EventGate : g) });
    } else {
      updateForm({ gates: [...formData.gates, { ...editingGate, id: `g_${Date.now()}` } as EventGate] });
    }
    setShowGateModal(false);
    setEditingGate(null);
  };

  const StepGates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Configure Event Gates</h3>
        <button 
          onClick={() => {
            setEditingGate({ name: '', gateNumber: formData.gates.length + 1, type: 'ENTRY', capacityPerHour: 0, initialState: 'CLOSED', associatedZoneId: '' });
            setGateFormErrors({});
            setShowGateModal(true);
          }}
          className="px-3 py-1.5 text-xs font-bold text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded hover:bg-orange-900/50 transition-colors"
        >
          + Add Gate
        </button>
      </div>

      {formData.gates.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#1a2334] rounded-lg text-slate-500 text-sm">
          No gates configured. Add gates to manage crowd flow.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.gates.map(gate => {
            const associatedZone = formData.zones.find(z => z.id === gate.associatedZoneId);
            return (
              <div key={gate.id} className="p-4 bg-[#111622] border border-[#212b3e] rounded-xl hover:border-[#2b3952] transition-colors relative group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white">{gate.name} <span className="text-slate-500 font-normal">#{gate.gateNumber}</span></h4>
                    <p className="text-[10px] text-orange-400 font-bold tracking-wider mt-0.5">{gate.type}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingGate(gate);
                        setGateFormErrors({});
                        setShowGateModal(true);
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => updateForm({ gates: formData.gates.filter(g => g.id !== gate.id) })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Capacity:</span>
                    <span className="text-slate-200 font-mono ml-1">{gate.capacityPerHour?.toLocaleString() || 0}/hr</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Initial:</span>
                    <span className={`font-mono ml-1 ${gate.initialState === 'OPEN' ? 'text-emerald-400' : 'text-red-400'}`}>{gate.initialState}</span>
                  </div>
                  <div className="col-span-2 text-[10px]">
                    <span className="text-slate-500">Zone:</span>
                    <span className="text-slate-300 ml-1">{associatedZone ? associatedZone.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0c1018] border border-[#1a2334] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">{editingGate?.id ? 'Edit Gate' : 'Add Gate'}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Gate Name *</label>
                  <input 
                    type="text" 
                    value={editingGate?.name || ''} 
                    onChange={e => setEditingGate({ ...editingGate, name: e.target.value })}
                    className={`${inputClass} ${gateFormErrors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g. North Entrance"
                  />
                  {gateFormErrors.name && <p className="text-red-400 text-xs mt-1">{gateFormErrors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Number *</label>
                  <input 
                    type="number" 
                    value={editingGate?.gateNumber || ''} 
                    onChange={e => setEditingGate({ ...editingGate, gateNumber: parseInt(e.target.value, 10) || 0 })}
                    className={`${inputClass} ${gateFormErrors.gateNumber ? 'border-red-500' : ''}`}
                  />
                  {gateFormErrors.gateNumber && <p className="text-red-400 text-xs mt-1 leading-tight">{gateFormErrors.gateNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Gate Type *</label>
                  <select 
                    value={editingGate?.type || 'ENTRY'} 
                    onChange={e => setEditingGate({ ...editingGate, type: e.target.value as 'ENTRY' | 'EXIT' | 'BOTH' | 'EMERGENCY' | 'SERVICE' })}
                    className={inputClass}
                  >
                    <option value="ENTRY">Entry</option>
                    <option value="EXIT">Exit</option>
                    <option value="BOTH">Entry & Exit</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Initial State *</label>
                  <select 
                    value={editingGate?.initialState || 'CLOSED'} 
                    onChange={e => setEditingGate({ ...editingGate, initialState: e.target.value as 'OPEN' | 'CLOSED' })}
                    className={inputClass}
                  >
                    <option value="CLOSED">Closed</option>
                    <option value="OPEN">Open</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Capacity / Hour *</label>
                  <input 
                    type="number" 
                    value={editingGate?.capacityPerHour || ''} 
                    onChange={e => setEditingGate({ ...editingGate, capacityPerHour: parseInt(e.target.value, 10) || 0 })}
                    className={`${inputClass} ${gateFormErrors.capacityPerHour ? 'border-red-500' : ''}`}
                  />
                  {gateFormErrors.capacityPerHour && <p className="text-red-400 text-xs mt-1">{gateFormErrors.capacityPerHour}</p>}
                </div>
                <div>
                  <label className={labelClass}>Associated Zone *</label>
                  <select 
                    value={editingGate?.associatedZoneId || ''} 
                    onChange={e => setEditingGate({ ...editingGate, associatedZoneId: e.target.value })}
                    className={`${inputClass} ${gateFormErrors.associatedZoneId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a zone...</option>
                    {formData.zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                  {gateFormErrors.associatedZoneId && <p className="text-red-400 text-xs mt-1">{gateFormErrors.associatedZoneId}</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowGateModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGate}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Save Gate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleSaveCamera = () => {
    if (!editingCamera) return;
    
    const errors: Record<string, string> = {};
    if (!editingCamera.name?.trim()) errors.name = 'Camera Name is required';
    if (!editingCamera.associatedZoneId) errors.associatedZoneId = 'Please associate a zone';
    
    if (editingCamera.sourceType === 'DEMO_VIDEO' || editingCamera.sourceType === 'UPLOADED_VIDEO') {
      if (!editingCamera.videoUrl?.trim()) {
        errors.videoUrl = 'Please provide or upload a video source';
      }
    }

    if (Object.keys(errors).length > 0) {
      setCameraFormErrors(errors);
      return;
    }

    setCameraFormErrors({});
    if (editingCamera.id) {
      updateForm({ cameras: formData.cameras.map(c => c.id === editingCamera.id ? editingCamera as EventCamera : c) });
    } else {
      updateForm({ cameras: [...formData.cameras, { ...editingCamera, id: `c_${Date.now()}` } as EventCamera] });
    }
    setShowCameraModal(false);
    setEditingCamera(null);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app we'd upload to a server. Here we use an object URL for preview.
      const objectUrl = URL.createObjectURL(file);
      setEditingCamera({ ...editingCamera, videoUrl: objectUrl });
    }
  };

  const StepCameras = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Configure Event Cameras</h3>
        <button 
          onClick={() => {
            setEditingCamera({ name: '', associatedZoneId: '', status: 'ONLINE', sourceType: 'DEMO_VIDEO', videoUrl: '' });
            setCameraFormErrors({});
            setShowCameraModal(true);
          }}
          className="px-3 py-1.5 text-xs font-bold text-orange-400 bg-orange-950/30 border border-orange-900/50 rounded hover:bg-orange-900/50 transition-colors"
        >
          + Add Camera
        </button>
      </div>

      {formData.cameras.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[#1a2334] rounded-lg text-slate-500 text-sm">
          No cameras configured. Add cameras to monitor crowd flow.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.cameras.map(cam => {
            const associatedZone = formData.zones.find(z => z.id === cam.associatedZoneId);
            return (
              <div key={cam.id} className="p-4 bg-[#111622] border border-[#212b3e] rounded-xl hover:border-[#2b3952] transition-colors relative group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white">{cam.name}</h4>
                    <p className="text-[10px] text-orange-400 font-bold tracking-wider mt-0.5">{cam.sourceType.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCamera(cam);
                        setCameraFormErrors({});
                        setShowCameraModal(true);
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => updateForm({ cameras: formData.cameras.filter(c => c.id !== cam.id) })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                {cam.sourceType === 'DEMO_VIDEO' && (
                  <div className="mb-3">
                    <span className="inline-block px-2 py-0.5 bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold tracking-wider">
                      DEMO MODE
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <span className={`font-mono ml-1 ${cam.status === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'}`}>{cam.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Zone:</span>
                    <span className="text-slate-300 ml-1 truncate">{associatedZone ? associatedZone.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0c1018] border border-[#1a2334] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">{editingCamera?.id ? 'Edit Camera' : 'Add Camera'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Camera Name *</label>
                <input 
                  type="text" 
                  value={editingCamera?.name || ''} 
                  onChange={e => setEditingCamera({ ...editingCamera, name: e.target.value })}
                  className={`${inputClass} ${cameraFormErrors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g. Cam-01-Main"
                />
                {cameraFormErrors.name && <p className="text-red-400 text-xs mt-1">{cameraFormErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Associated Zone *</label>
                  <select 
                    value={editingCamera?.associatedZoneId || ''} 
                    onChange={e => setEditingCamera({ ...editingCamera, associatedZoneId: e.target.value })}
                    className={`${inputClass} ${cameraFormErrors.associatedZoneId ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a zone...</option>
                    {formData.zones.map(z => (
                      <option key={z.id} value={z.id}>{z.name}</option>
                    ))}
                  </select>
                  {cameraFormErrors.associatedZoneId && <p className="text-red-400 text-xs mt-1">{cameraFormErrors.associatedZoneId}</p>}
                </div>
                <div>
                  <label className={labelClass}>Status *</label>
                  <select 
                    value={editingCamera?.status || 'ONLINE'} 
                    onChange={e => setEditingCamera({ ...editingCamera, status: e.target.value as 'ONLINE' | 'OFFLINE' })}
                    className={inputClass}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Source Type *</label>
                <select 
                  value={editingCamera?.sourceType || 'DEMO_VIDEO'} 
                  onChange={e => {
                    const type = e.target.value as 'DEMO_VIDEO' | 'UPLOADED_VIDEO' | 'RTSP' | 'IP_CAMERA';
                    setEditingCamera({ ...editingCamera, sourceType: type, videoUrl: '' });
                  }}
                  className={inputClass}
                >
                  <option value="DEMO_VIDEO">Demo Video</option>
                  <option value="UPLOADED_VIDEO">Uploaded Video</option>
                  <option value="RTSP">RTSP Stream (Not supported in Demo)</option>
                  <option value="IP_CAMERA">IP Camera (Not supported in Demo)</option>
                </select>
              </div>

              {(editingCamera?.sourceType === 'DEMO_VIDEO' || editingCamera?.sourceType === 'UPLOADED_VIDEO') && (
                <div className="p-4 border border-[#1a2334] bg-[#111622] rounded-lg space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className={`${labelClass} mb-0`}>Video Source</label>
                    <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-400 border border-indigo-500/30 rounded text-[10px] font-bold tracking-wider">
                      DEMO MODE
                    </span>
                  </div>
                  
                  {editingCamera?.sourceType === 'UPLOADED_VIDEO' ? (
                    <div>
                      <input 
                        type="file" 
                        accept="video/mp4,video/quicktime,video/x-msvideo" 
                        onChange={handleVideoUpload}
                        className="block w-full text-sm text-slate-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#1a2334] file:text-slate-300
                          hover:file:bg-[#212b3e] transition-colors cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="text" 
                        value={editingCamera?.videoUrl || ''} 
                        onChange={e => setEditingCamera({ ...editingCamera, videoUrl: e.target.value })}
                        className={`${inputClass} ${cameraFormErrors.videoUrl ? 'border-red-500' : ''}`}
                        placeholder="e.g. /demo/crowd_simulation.mp4"
                      />
                    </div>
                  )}
                  {cameraFormErrors.videoUrl && <p className="text-red-400 text-xs mt-1">{cameraFormErrors.videoUrl}</p>}

                  {editingCamera?.videoUrl && (
                    <div className="mt-3 aspect-video bg-black rounded-lg border border-[#212b3e] overflow-hidden relative group">
                      <video 
                        src={editingCamera.videoUrl} 
                        className="w-full h-full object-cover opacity-80"
                        controls
                        muted
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowCameraModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCamera}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Save Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const StepSafety = () => (
    <div className="space-y-6">
      <div className="p-4 border border-dashed border-orange-500/20 bg-orange-950/10 rounded-lg mb-4">
        <p className="text-xs text-orange-400/80 leading-relaxed">
          <span className="font-bold text-orange-400 mr-2">Disclaimer:</span>
          These are Configured Safety Thresholds used exclusively for triggering local alerts and feeding the risk engine. They do not represent universally validated safety limits. Please consult local authorities for official crowd safety regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Densities */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-500 border-b border-[#1a2334] pb-2">Crowd Density (People / m²)</h4>
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Warning Density</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Density at which monitoring dashboard will flag a warning (amber).
                </div>
              </div>
            </div>
            <input 
              type="number" step="0.1"
              value={formData.safetyThresholds.warningDensity} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, warningDensity: parseFloat(e.target.value) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.warningDensity ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.warningDensity && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.warningDensity}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>High Risk Density</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Density at which active interventions should be prepared (orange).
                </div>
              </div>
            </div>
            <input 
              type="number" step="0.1"
              value={formData.safetyThresholds.highDensity} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, highDensity: parseFloat(e.target.value) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.highDensity ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.highDensity && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.highDensity}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Critical Density</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Danger level indicating potential crush risk. Immediate action required (red).
                </div>
              </div>
            </div>
            <input 
              type="number" step="0.1"
              value={formData.safetyThresholds.criticalDensity} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, criticalDensity: parseFloat(e.target.value) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.criticalDensity ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.criticalDensity && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.criticalDensity}</p>}
          </div>
        </div>

        {/* Right Column - Flow & Timing */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-slate-500 border-b border-[#1a2334] pb-2">Flow & Prediction</h4>
          
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Minimum Crowd Speed (m/s)</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Average flow speed below which congestion alerts are triggered.
                </div>
              </div>
            </div>
            <input 
              type="number" step="0.01"
              value={formData.safetyThresholds.minCrowdSpeed} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, minCrowdSpeed: parseFloat(e.target.value) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.minCrowdSpeed ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.minCrowdSpeed && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.minCrowdSpeed}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Max Zone Occupancy (%)</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Percentage of zone capacity before gate entries are restricted.
                </div>
              </div>
            </div>
            <input 
              type="number"
              value={formData.safetyThresholds.maxZoneOccupancy} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, maxZoneOccupancy: parseInt(e.target.value, 10) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.maxZoneOccupancy ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.maxZoneOccupancy && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.maxZoneOccupancy}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Max Entry Rate (per hour)</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Maximum total flow rate allowed across all active entry gates.
                </div>
              </div>
            </div>
            <input 
              type="number"
              value={formData.safetyThresholds.maxEntryRate} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, maxEntryRate: parseInt(e.target.value, 10) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.maxEntryRate ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.maxEntryRate && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.maxEntryRate}</p>}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`${labelClass} mb-0`}>Prediction Horizon (mins)</label>
              <div className="group relative">
                <AlertCircle size={14} className="text-slate-500 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[#1f293d] border border-[#2b3952] rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                  Timeframe for AI prediction models to forecast crowd conditions.
                </div>
              </div>
            </div>
            <input 
              type="number"
              value={formData.safetyThresholds.predictionHorizon} 
              onChange={e => updateForm({ safetyThresholds: { ...formData.safetyThresholds, predictionHorizon: parseInt(e.target.value, 10) || 0 } })}
              className={`${inputClass} ${safetyFormErrors.predictionHorizon ? 'border-red-500' : ''}`}
            />
            {safetyFormErrors.predictionHorizon && <p className="text-red-400 text-xs mt-1">{safetyFormErrors.predictionHorizon}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const StepReview = () => (
    <div className="space-y-6">
      <div className="p-6 bg-[#111622] border border-[#212b3e] rounded-xl space-y-6">
        
        {/* Basic Information */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Basic Information</h4>
            <button onClick={() => setCurrentStep(0)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Event Name</span>
              <span className="text-white font-medium">{formData.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Event Type</span>
              <span className="text-white font-medium">{formData.eventType}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Expected Visitors</span>
              <span className="text-white font-medium">{parseInt(formData.expectedVisitors || '0').toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Start Time</span>
              <span className="text-white font-medium">{formData.startDate} {formData.startTime}</span>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Venue</h4>
            <button onClick={() => setCurrentStep(1)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="text-sm">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Selected Venue</span>
            <span className="text-white font-medium">{formData.venueName || 'None Selected'}</span>
          </div>
        </div>

        {/* Zones */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Zones</h4>
            <button onClick={() => setCurrentStep(2)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="text-sm">
            <span className="text-white font-medium">{formData.zones.length} Configured</span>
          </div>
        </div>

        {/* Gates */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Gates</h4>
            <button onClick={() => setCurrentStep(3)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="text-sm">
            <span className="text-white font-medium">{formData.gates.length} Configured</span>
          </div>
        </div>

        {/* Cameras */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Cameras</h4>
            <button onClick={() => setCurrentStep(4)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="text-sm">
            <span className="text-white font-medium">{formData.cameras.length} Configured</span>
          </div>
        </div>

        {/* Safety Thresholds */}
        <div>
          <div className="flex justify-between items-center mb-3 border-b border-[#1a2334] pb-2">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">Safety Thresholds</h4>
            <button onClick={() => setCurrentStep(5)} className="text-xs text-orange-400 hover:text-orange-300 font-bold">Edit</button>
          </div>
          <div className="text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-white font-medium">Configured</span>
          </div>
        </div>

      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return StepBasicInfo();
      case 1: return StepVenue();
      case 2: return StepZones();
      case 3: return StepGates();
      case 4: return StepCameras();
      case 5: return StepSafety();
      case 6: return StepReview();
      default: return null;
    }
  };

  if (createdEvent) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Event Created</h2>
        <p className="text-slate-400 mb-8">The event configuration has been successfully saved.</p>
        
        <div className="bg-[#111622] border border-[#212b3e] rounded-xl p-6 text-left mb-8 space-y-4">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Event Name</span>
            <p className="text-white font-medium text-lg mt-1">{createdEvent.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Event ID</span>
              <p className="text-slate-300 font-mono mt-1 text-sm">{createdEvent.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</span>
              <p className="mt-1">
                <span className="px-2 py-1 bg-blue-900/40 text-blue-400 border border-blue-800 rounded text-xs font-bold tracking-wider">
                  {createdEvent.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push(`/dashboard/events/${createdEvent.id}`)}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-orange-900/20"
        >
          Open Event
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wide">Create New Event</h1>
        <p className="text-sm text-slate-400 mt-1">Configure event parameters, venue infrastructure, and safety protocols.</p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          
          return (
            <React.Fragment key={step}>
              <div 
                className={`flex items-center shrink-0 ${
                  isActive ? 'text-orange-400 font-bold' : 
                  isCompleted ? 'text-emerald-400 font-semibold cursor-pointer' : 
                  'text-slate-500 font-medium'
                }`}
                onClick={() => isCompleted && setCurrentStep(idx)}
              >
                <span className="text-sm tracking-wide">{step}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <ChevronRight size={14} className="text-[#212b3e] shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Area */}
      <div className="bg-[#0c1018]/80 border border-[#182130] rounded-2xl p-6 shadow-xl relative min-h-[400px] flex flex-col">
        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-red-300">{error}</p>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden" onKeyDown={(e) => {
          if (e.key === 'Enter' && currentStep < STEPS.length - 1) {
            handleNext();
          }
        }}>
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={currentStep}
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-[#1a2334] flex items-center justify-between">
          <button
            type="button"
            onClick={() => currentStep === 0 ? router.back() : handleBack()}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            {currentStep === 0 ? 'Cancel' : <><ArrowLeft size={16} /> Back</>}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-[#1f293d] hover:bg-[#2b3952] text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 border border-[#2b3952]"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-900/50 disabled:text-orange-300/50 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Create Event
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
