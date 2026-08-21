'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface EventSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const EventSearch: React.FC<EventSearchProps> = ({ 
  onSearch, 
  placeholder = "Search events...",
  debounceMs = 300 
}) => {
  const [localValue, setLocalValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onSearch, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full md:max-w-xs group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2.5 bg-[#0c1018] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/30 focus:ring-1 focus:ring-orange-500/30 transition-all shadow-sm"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
