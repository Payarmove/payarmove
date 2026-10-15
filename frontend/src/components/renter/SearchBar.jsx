import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Calendar, Clock, Search, Navigation, ChevronDown, Check } from 'lucide-react';

export default function SearchBar({ compact = false }) {
  const { searchQuery, setSearchQuery, updateTimeline, navigateTo } = useApp();

  const [locationOpen, setLocationOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const locations = [
    'Westlands, Nairobi',
    'Kilimani, Nairobi',
    'Karen, Nairobi',
    'CBD, Nairobi',
    'Lavington, Nairobi',
    'Gigiri, Nairobi',
  ];

  const handleSelectLocation = (loc) => {
    setSearchQuery((prev) => ({ ...prev, location: loc }));
    setLocationOpen(false);
  };

  const handleSearch = () => {
    setLocationOpen(false);
    setCalendarOpen(false);
    navigateTo('search');
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Desktop Capsule Search Bar (Soft Modern Pill) */}
      <div className={`hidden md:flex items-center bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04] p-2 gap-2 ${compact ? 'shadow-sm py-1' : ''}`}>
        {/* Location Picker */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setLocationOpen(!locationOpen);
              setCalendarOpen(false);
            }}
            className="w-full text-left px-5 py-2 rounded-full hover:bg-gray-50 transition flex items-center gap-2.5"
          >
            <MapPin className="w-4 h-4 text-[#06372d] shrink-0" />
            <div className="overflow-hidden">
              <div className="text-[11px] font-semibold text-gray-800 leading-tight">
                Pick up location
              </div>
              <div className="text-xs text-gray-400 truncate font-normal">
                {searchQuery.location || 'Select your location'}
              </div>
            </div>
          </button>
        </div>

        <div className="w-px h-8 bg-black/[0.05]" />

        {/* Pick-up Date & Time */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setLocationOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-full hover:bg-gray-50 transition flex items-center gap-2"
          >
            <div className="overflow-hidden">
              <div className="text-[11px] text-gray-400 font-medium leading-tight">
                Pick up
              </div>
              <div className="text-xs text-gray-700 truncate font-medium">
                {searchQuery.pickupDate ? `${searchQuery.pickupDate} · ${searchQuery.pickupTime}` : 'Select time and date'}
              </div>
            </div>
          </button>
        </div>

        <div className="w-px h-8 bg-black/[0.05]" />

        {/* Drop-off Date & Time */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setLocationOpen(false);
            }}
            className="w-full text-left px-4 py-2 rounded-full hover:bg-gray-50 transition flex items-center gap-2"
          >
            <div className="overflow-hidden">
              <div className="text-[11px] text-gray-400 font-medium leading-tight">
                Drop off
              </div>
              <div className="text-xs text-gray-700 truncate font-medium">
                {searchQuery.dropoffDate ? `${searchQuery.dropoffDate} · ${searchQuery.dropoffTime}` : 'Select time and date'}
              </div>
            </div>
          </button>
        </div>

        {/* Hours badge */}
        <div className="flex items-center px-1">
          <span className="bg-[#b2e5d5] text-[#06372d] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-2xs">
            {searchQuery.durationHours ? `${searchQuery.durationHours} hrs` : '-hrs'}
          </span>
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="border border-black/[0.08] hover:border-black/20 bg-white hover:bg-gray-50 text-gray-800 px-7 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-sm shrink-0"
        >
          <span>Search cars</span>
        </button>
      </div>

      {/* Mobile Card Search Bar */}
      <div className="md:hidden bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04] p-4 space-y-3">
        {/* Row 1: Location + GPS button */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
          <button
            type="button"
            onClick={() => {
              setLocationOpen(!locationOpen);
              setCalendarOpen(false);
            }}
            className="flex items-center gap-3 text-left flex-1"
          >
            <MapPin className="w-5 h-5 text-[#06372d] shrink-0" />
            <div>
              <div className="text-[11px] font-semibold text-gray-500">Pick up location</div>
              <div className="text-sm font-normal text-gray-700">
                {searchQuery.location || 'Select your location'}
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleSelectLocation('Westlands, Nairobi')}
            className="p-1.5 text-[#06372d] hover:bg-emerald-50 rounded-full transition"
            title="Use current location"
          >
            <Navigation className="w-4 h-4 rotate-45" />
          </button>
        </div>

        {/* Row 2: Pick up, - hrs pill badge, Drop off */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setLocationOpen(false);
            }}
            className="text-left"
          >
            <div className="text-[11px] text-gray-400 font-medium">Pick up</div>
            <div className="text-xs text-gray-800 font-medium">
              {searchQuery.pickupDate ? `${searchQuery.pickupDate} · ${searchQuery.pickupTime}` : 'Select date & time'}
            </div>
          </button>

          <div className="px-2">
            <span className="bg-[#b2e5d5] text-[#06372d] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              {searchQuery.durationHours ? `${searchQuery.durationHours} hrs` : '- hrs'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setLocationOpen(false);
            }}
            className="text-right"
          >
            <div className="text-[11px] text-gray-400 font-medium">Drop off</div>
            <div className="text-xs text-gray-800 font-medium">
              {searchQuery.dropoffDate ? `${searchQuery.dropoffDate} · ${searchQuery.dropoffTime}` : 'Select date & time'}
            </div>
          </button>
        </div>

        {/* Row 3: Full width Search cars button */}
        <button
          type="button"
          onClick={handleSearch}
          className="w-full mt-2 border border-black/[0.08] hover:border-black/20 bg-white hover:bg-gray-50 text-gray-800 py-2.5 rounded-xl font-semibold text-xs transition shadow-2xs text-center"
        >
          Search cars
        </button>
      </div>

      {/* Location Dropdown Popover */}
      {locationOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] border border-black/[0.05] p-3 z-50 animate-in fade-in slide-in-from-top-1">
          <button
            type="button"
            onClick={() => handleSelectLocation('Westlands, Nairobi')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-left text-xs font-semibold text-[#06372d] border border-emerald-500/20 bg-emerald-50/40 mb-2 transition"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Use my current location</span>
          </button>
          <div className="text-[11px] font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">
            Popular areas near you
          </div>
          <div className="space-y-0.5 mt-1 max-h-56 overflow-y-auto">
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleSelectLocation(loc)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between transition"
              >
                <span>{loc}</span>
                {searchQuery.location === loc && <Check className="w-3.5 h-3.5 text-[#06372d]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Rental Timeline & Date/Time Popover */}
      {calendarOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-black/[0.05] p-6 z-50 animate-in fade-in slide-in-from-top-1 max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#06372d]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Choose Rental Timeline
              </span>
            </div>
            <span className="bg-[#e2f4ed] text-[#06372d] text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
              {searchQuery.durationHours || 26} hours
            </span>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Quick Duration Presets</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: '4 hrs', hours: 4 },
                { label: '8 hrs', hours: 8 },
                { label: '24 hrs', hours: 24 },
                { label: '48 hrs', hours: 48 },
                { label: '3 days', hours: 72 },
                { label: '1 week', hours: 168 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const pDate = searchQuery.pickupDate || '2026-10-14';
                    const pTime = searchQuery.pickupTime || '09:00';
                    const start = new Date(`${pDate}T${pTime}`);
                    const end = new Date(start.getTime() + preset.hours * 60 * 60 * 1000);
                    const pad = (n) => String(n).padStart(2, '0');
                    const dDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
                    const dTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
                    updateTimeline({
                      dropoffDate: dDate,
                      dropoffTime: dTime,
                      durationHours: preset.hours,
                    });
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition text-center ${
                    searchQuery.durationHours === preset.hours
                      ? 'bg-[#06372d] text-white border-[#06372d] shadow-xs'
                      : 'bg-gray-50/80 text-gray-700 border-black/[0.05] hover:bg-gray-100/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pick-up and Drop-off Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pick up */}
            <div className="bg-[#f8fafc] p-4 rounded-2xl border border-black/[0.04] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06372d] shrink-0" />
                <span>Pick-up</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Date</label>
                  <input
                    type="date"
                    value={searchQuery.pickupDate || '2026-10-14'}
                    onChange={(e) => updateTimeline({ pickupDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-black/[0.06] rounded-xl focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Time</label>
                  <input
                    type="time"
                    value={searchQuery.pickupTime || '09:00'}
                    onChange={(e) => updateTimeline({ pickupTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-black/[0.06] rounded-xl focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Drop off */}
            <div className="bg-[#f8fafc] p-4 rounded-2xl border border-black/[0.04] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#06372d] bg-white shrink-0" />
                <span>Drop-off</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Date</label>
                  <input
                    type="date"
                    value={searchQuery.dropoffDate || '2026-10-15'}
                    min={searchQuery.pickupDate}
                    onChange={(e) => updateTimeline({ dropoffDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-black/[0.06] rounded-xl focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-semibold block mb-0.5">Time</label>
                  <input
                    type="time"
                    value={searchQuery.dropoffTime || '11:00'}
                    onChange={(e) => updateTimeline({ dropoffTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 bg-white border border-black/[0.06] rounded-xl focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                updateTimeline({
                  pickupDate: '2026-10-14',
                  dropoffDate: '2026-10-15',
                  pickupTime: '09:00',
                  dropoffTime: '11:00',
                });
                setCalendarOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setCalendarOpen(false)}
              className="px-6 py-2.5 text-xs font-bold bg-[#06372d] text-white rounded-xl hover:bg-[#09473b] transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Timeline ({searchQuery.durationHours || 26} hrs)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
