import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import {
  ArrowLeft,
  Share2,
  Heart,
  Users,
  Star,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Calendar,
  Clock,
  Edit3,
  Check,
} from 'lucide-react';

export default function VehicleDetailView() {
  const {
    vehicles,
    selectedVehicle: ctxSelectedVehicle,
    searchQuery,
    updateTimeline,
    navigateTo,
    savedVehicleIds,
    toggleSaveVehicle,
    user,
    connectedWallet,
    setCheckoutStep,
    setSelectedRentalId,
    refreshBackendData,
  } = useApp();
  const selectedVehicle = ctxSelectedVehicle || vehicles[0];

  const [isEditingDates, setIsEditingDates] = useState(false);

  if (!selectedVehicle) {
    if (vehicles.length === 0) {
      return (
        <div className="p-16 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-[#06372d] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading vehicle specifications...</p>
        </div>
      );
    }
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600 mb-4">No vehicle selected.</p>
        <button
          onClick={() => navigateTo('explore')}
          className="text-[#06372d] font-bold underline"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const isSaved = savedVehicleIds.includes(selectedVehicle.id);
  const durationHours = searchQuery.durationHours || 26;
  const rentalFee = (selectedVehicle.hourlyRate * durationHours).toFixed(2);
  const securityDeposit = selectedVehicle.securityDeposit.toFixed(2);
  const totalDueNow = (Number(rentalFee) + Number(securityDeposit)).toFixed(2);

  const images = selectedVehicle.images || ['/cars/gwagon.jpg'];

  const applyHours = (h) => {
    const targetHours = Math.max(1, Number(h));
    const pDate = searchQuery.pickupDate || '2026-10-14';
    const pTime = searchQuery.pickupTime || '09:00';
    const start = new Date(`${pDate}T${pTime}`);
    const end = new Date(start.getTime() + targetHours * 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const dDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
    const dTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
    updateTimeline({
      dropoffDate: dDate,
      dropoffTime: dTime,
      durationHours: targetHours,
    });
  };

  const handleProceedBooking = async () => {
    const currentAddress = connectedWallet?.address || user?.walletAddress;
    const hasWallet = Boolean(currentAddress);
    setCheckoutStep(hasWallet ? 'approve' : 'connect');

    if (!api.tokens.isAuthenticated() && currentAddress && currentAddress !== 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT') {
      try {
        let authRes = await api.auth.walletLogin(currentAddress).catch(() => null);
        if (!authRes?.tokens) {
          const autoEmail = `${currentAddress.slice(0, 8).toLowerCase()}_${currentAddress.slice(-4).toLowerCase()}@stellar.payarmove.io`;
          authRes = await api.auth.walletSetup({
            public_key: currentAddress,
            name: `User ${currentAddress.slice(0, 4)}...${currentAddress.slice(-4)}`,
            email: autoEmail,
            role: 'RENTER',
            avatar_url: '/default-avatar.svg',
          }).catch(() => null);
        }
        if (authRes?.tokens) {
          api.tokens.setTokens(authRes.tokens.access, authRes.tokens.refresh);
        }
      } catch (authErr) {
        console.warn('Auto auth in booking notice:', authErr);
      }
    }

    // Clear any previous rental id selection so fresh booking uses clean agreement
    setSelectedRentalId('');
    navigateTo('checkout-wallet');
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Vehicle Details matching desktop_vehicle_detail.png */}
          <div className="lg:col-span-8 space-y-6">
            {/* Big Main Photo with back arrow, share, heart, and photo counter */}
            <div className="relative aspect-[16/10] bg-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04]">
              <img
                src={images[0] || '/cars/gwagon.jpg'}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                className="w-full h-full object-cover"
              />

              {/* Back Arrow button (top-left) */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    window.history.back();
                  } else {
                    navigateTo('explore');
                  }
                }}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/[0.04] hover:scale-105 transition"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Top-Right: Share & Heart buttons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/[0.04] hover:scale-105 transition"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleSaveVehicle(selectedVehicle.id)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/[0.04] hover:scale-105 transition"
                  title="Save"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved ? 'text-[#06372d] fill-[#06372d]' : 'text-gray-700'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom-Right Photo Counter: 1 / N */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-xs border border-black/[0.04]">
                1 / {images.length}
              </div>
            </div>

            {/* Row 1: Category badge & location */}
            <div className="flex items-center justify-between">
              <span className="border border-black/[0.06] bg-white text-gray-900 font-semibold text-xs px-3 py-1 rounded-full shadow-2xs">
                {selectedVehicle.category || 'Luxury'}
              </span>
              <span className="text-xs text-gray-500">
                {selectedVehicle.location || `${selectedVehicle.distanceKm || '1.2'} km away`}
              </span>
            </div>

            {/* Row 2: Car model & Year */}
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
              {selectedVehicle.name || `${selectedVehicle.make} ${selectedVehicle.model}`} {selectedVehicle.year}
            </h1>

            {/* Row 3: Three soft cards: seats, rating, trips */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f0f6f4]/80 border border-emerald-500/10 rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>{selectedVehicle.specs?.seats || 5} seats</span>
              </div>
              <div className="bg-[#f0f6f4]/80 border border-emerald-500/10 rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                <Star className="w-4 h-4 text-emerald-800" />
                <span>★ {selectedVehicle.rating?.toFixed(1) || '5.0'}</span>
              </div>
              <div className="bg-[#f0f6f4]/80 border border-emerald-500/10 rounded-2xl p-3 sm:p-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>{selectedVehicle.tripsCount || selectedVehicle.reviewsCount || 24} trips</span>
              </div>
            </div>

            {/* Row 4: Hosted by Host name */}
            <div className="bg-white border border-black/[0.04] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-2xs">
                  <img
                    src={selectedVehicle.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={selectedVehicle.host?.name || 'Host'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    Hosted by {selectedVehicle.host?.name || 'Verified Host'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Verified Host · Fast Response (under 1 hr)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Row 5: Pick-up point & timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-950">Pick-up point & Timeline</h3>
                <span className="text-xs font-semibold text-emerald-800 bg-[#e2f4ed] px-3 py-0.5 rounded-full shadow-2xs">
                  {durationHours} hrs trip
                </span>
              </div>
              <div className="h-40 bg-[#c8d9d4] rounded-2xl relative flex items-center justify-center overflow-hidden shadow-xs">
                <div className="w-8 h-8 rounded-full bg-[#06372d] text-white flex items-center justify-center shadow-lg">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-black/[0.04] shadow-xs rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-800 shrink-0" />
                  <p className="text-xs font-bold text-gray-900">
                    {selectedVehicle.location || 'Westlands, Nairobi, Kenya'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-black/[0.04] text-xs">
                  <div className="bg-white rounded-xl p-2.5 border border-black/[0.04] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Pick-up</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      {searchQuery.pickupDate || '2026-10-14'} · {searchQuery.pickupTime || '09:00'}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-black/[0.04] shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Drop-off</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      {searchQuery.dropoffDate || '2026-10-15'} · {searchQuery.dropoffTime || '11:00'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {selectedVehicle.pickup_instructions || 'Instant unlock via Stellar Soroban smart lock code after escrow funding.'}
                </p>
              </div>
            </div>

            {/* Row 6: About your security deposit */}
            <div className="bg-[#f0faf6] border border-emerald-500/10 shadow-[0_4px_20px_rgba(6,55,45,0.03)] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">About your security deposit</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The deposit is separate from the rental fee. It's held while you have the car and released when the rental is completed.
              </p>

              <div className="flex items-center justify-between max-w-sm pt-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#06372d] shadow-2xs" />
                  <span className="text-[11px] font-semibold text-gray-800">Paid</span>
                </div>
                <div className="h-0.5 flex-1 bg-gray-200 mx-2 -mt-4" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white" />
                  <span className="text-[11px] font-semibold text-gray-500">Held</span>
                </div>
                <div className="h-0.5 flex-1 bg-gray-200 mx-2 -mt-4" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-400 bg-white" />
                  <span className="text-[11px] font-semibold text-gray-500">Released</span>
                </div>
              </div>
            </div>

            {/* Row 7: Cancellation */}
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-950">Cancellation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                [{selectedVehicle.cancellationTerms || 'Free cancellation up to 24 hours before pickup. After that, cancel for a partial refund minus a small processing fee.'}]
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Trip Summary & Price Details */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            {/* Card 1: Your trip with interactive date/time timeline editor */}
            <div className="bg-white border border-black/[0.04] rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#06372d]" />
                  <span>Your trip</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingDates(!isEditingDates)}
                    className="text-xs font-semibold text-[#06372d] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingDates ? 'Close' : 'Edit dates'}</span>
                  </button>
                  <span className="bg-[#e2f4ed] text-[#06372d] text-xs font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                    {durationHours} hrs
                  </span>
                </div>
              </div>

              {/* Collapsed / Summary View */}
              {!isEditingDates ? (
                <div className="space-y-3 text-xs">
                  <div
                    onClick={() => setIsEditingDates(true)}
                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#06372d] shrink-0" />
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Pick up</span>
                        <span className="text-gray-900 font-bold">
                          {searchQuery.pickupDate || '2026-10-14'} · {searchQuery.pickupTime || '09:00'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>

                  <div
                    onClick={() => setIsEditingDates(true)}
                    className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-[#06372d] bg-white shrink-0" />
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Drop off</span>
                        <span className="text-gray-900 font-bold">
                          {searchQuery.dropoffDate || '2026-10-15'} · {searchQuery.dropoffTime || '11:00'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div>
              ) : (
                /* Expanded Interactive Date & Time Picker */
                <div className="space-y-4 pt-1 animate-in fade-in">
                  {/* Quick duration presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Quick Duration Presets</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: '4 hrs', hours: 4 },
                        { label: '8 hrs', hours: 8 },
                        { label: '24 hrs', hours: 24 },
                        { label: '48 hrs', hours: 48 },
                        { label: '3 days', hours: 72 },
                        { label: '5 days', hours: 120 },
                        { label: '1 week', hours: 168 },
                        { label: '2 weeks', hours: 336 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyHours(preset.hours)}
                          className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold border transition text-center ${
                            durationHours === preset.hours
                              ? 'bg-[#06372d] text-white border-[#06372d] shadow-xs'
                              : 'bg-gray-50/80 text-gray-700 border-black/[0.05] hover:bg-gray-100/80'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom hours direct adjuster */}
                  <div className="bg-gray-50/70 p-3 rounded-xl border border-black/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#06372d]" />
                        <span>Custom duration</span>
                      </span>
                      <span className="font-mono font-bold text-xs text-[#06372d]">
                        {durationHours} {durationHours === 1 ? 'hr' : 'hrs'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyHours(Math.max(1, durationHours - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-black/[0.06] text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition shadow-2xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="720"
                        value={durationHours}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            applyHours(val);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-center text-xs font-bold text-gray-900 bg-white border border-black/[0.06] rounded-lg focus:outline-none focus:border-[#06372d] shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => applyHours(durationHours + 1)}
                        className="w-8 h-8 rounded-lg bg-white border border-black/[0.06] text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center transition shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pick up Inputs */}
                  <div className="bg-gray-50/70 p-3 rounded-xl border border-black/[0.04] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <span className="w-2 h-2 rounded-full bg-[#06372d] shrink-0" />
                      <span>Pick up date & time</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={searchQuery.pickupDate || '2026-10-14'}
                        onChange={(e) => updateTimeline({ pickupDate: e.target.value })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-black/[0.06] rounded-lg focus:outline-none focus:border-[#06372d] shadow-2xs"
                      />
                      <input
                        type="time"
                        value={searchQuery.pickupTime || '09:00'}
                        onChange={(e) => updateTimeline({ pickupTime: e.target.value })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-black/[0.06] rounded-lg focus:outline-none focus:border-[#06372d] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Drop off Inputs */}
                  <div className="bg-gray-50/70 p-3 rounded-xl border border-black/[0.04] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                      <span className="w-2 h-2 rounded-full border border-[#06372d] bg-white shrink-0" />
                      <span>Drop off date & time</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={searchQuery.dropoffDate || '2026-10-15'}
                        min={searchQuery.pickupDate}
                        onChange={(e) => updateTimeline({ dropoffDate: e.target.value })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-black/[0.06] rounded-lg focus:outline-none focus:border-[#06372d] shadow-2xs"
                      />
                      <input
                        type="time"
                        value={searchQuery.dropoffTime || '11:00'}
                        onChange={(e) => updateTimeline({ dropoffTime: e.target.value })}
                        className="px-2.5 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-black/[0.06] rounded-lg focus:outline-none focus:border-[#06372d] shadow-2xs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditingDates(false)}
                    className="w-full bg-[#06372d] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#09473b] transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Dates & Recalculate ({durationHours} hrs)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: Price details */}
            <div className="bg-white border border-black/[0.04] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-bold text-gray-950">Price details</h3>

              <div className="space-y-1">
                <div className="text-xs text-gray-500">
                  Rental fee ({Number(selectedVehicle.hourlyRate || 25).toFixed(2)} USDC × {durationHours} hrs)
                </div>
                <div className="font-bold text-base text-gray-950 font-mono">
                  {rentalFee} USDC
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-gray-600">Security deposit</span>
                <span className="font-semibold text-gray-900 font-mono">
                  {securityDeposit} USDC
                </span>
              </div>

              <div className="border-t border-black/[0.04] pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Total due now</span>
                <span className="text-base font-black text-gray-950 font-mono">
                  {totalDueNow} USDC
                </span>
              </div>

              <div className="text-[11px] text-gray-400">
                Paid in USDC via Stellar Escrow.
              </div>

              {/* Big Price & Total */}
              <div className="pt-2">
                <div className="text-2xl font-black text-gray-950 font-mono">
                  {totalDueNow} USDC
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  / total incl. deposit ({durationHours} hrs)
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleProceedBooking}
                className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 rounded-full font-bold text-xs sm:text-sm transition shadow-sm text-center"
              >
                Reserve and pay {totalDueNow} USDC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
