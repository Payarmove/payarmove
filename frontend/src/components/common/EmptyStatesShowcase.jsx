import React from 'react';
import { useApp } from '../../context/AppContext';
import { Car, Heart, Clock, Sparkles, ArrowLeft, Paintbrush } from 'lucide-react';

export default function EmptyStatesShowcase() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-[#333333] py-12 px-4 sm:px-8 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between text-white pb-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('explore')}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">
              Empty states (Exact Figma Clone)
            </h1>
          </div>
          <span className="text-xs text-gray-400">All 6 states from Empty states.png</span>
        </div>

        {/* 6 Cards Grid (Matches Empty states.png) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. No cars available for these times */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                No cars available for these times
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                Try different times, or look in another pick up location
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => navigateTo('explore')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-sm"
              >
                Change times
              </button>
              <button
                onClick={() => navigateTo('explore')}
                className="w-full py-2.5 rounded-full text-gray-800 font-semibold text-xs border border-black/[0.06] hover:bg-gray-50 transition shadow-2xs"
              >
                Change location
              </button>
            </div>
          </div>

          {/* 2. No saved cars yet */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                No saved cars yet
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                Tap the heart on a car to keep it here
              </p>
            </div>

            <div className="w-full pt-6">
              <button
                onClick={() => navigateTo('explore')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-sm"
              >
                Explore cars
              </button>
            </div>
          </div>

          {/* 3. No active rental */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                No active rental
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                When you book a car, it appears here
              </p>
            </div>

            <div className="w-full pt-6">
              <button
                onClick={() => navigateTo('explore')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-sm"
              >
                Find a car
              </button>
            </div>
          </div>

          {/* 4. No past rentals yet */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                No past rentals yet
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                Completed and active rentals appear here
              </p>
            </div>

            <div className="w-full pt-6">
              <button
                onClick={() => navigateTo('explore')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-sm"
              >
                Find a car
              </button>
            </div>
          </div>

          {/* 5. Add your first vehicle */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                Add your first vehicle
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                List a car to start getting rentals paid in USDC
              </p>
            </div>

            <div className="w-full pt-6">
              <button
                onClick={() => navigateTo('host-add-vehicle')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-sm"
              >
                Add vehicle
              </button>
            </div>
          </div>

          {/* 6. No rental payments yet */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center justify-between space-y-5 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-12 h-12 rounded-full border border-emerald-500/15 bg-[#f0faf6] text-[#06372d] flex items-center justify-center shadow-2xs">
              <Paintbrush className="w-5 h-5 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-gray-900">
                No rental payments yet
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                payments appear here as renters book cars
              </p>
            </div>

            <div className="w-full pt-10">
              <span className="text-[11px] text-gray-400 block text-center italic">
                Waiting for bookings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
