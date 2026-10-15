import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';

export default function RentalDetailView() {
  const { selectedRental, navigateTo } = useApp();

  const rental = selectedRental || {
    id: 'PM-8921',
    rentalId: 'PM-8921',
    vehicleName: 'Mercedes-Benz G63 AMG (2024)',
    status: 'Active',
    vehiclePhoto: '/cars/gwagon.jpg',
    durationHours: 26,
    pickupDate: 'Tue, 6 Oct · 7:00 am',
    dropoffDate: 'Wed, 7 Oct · 9:00 am',
    pickupAddress: 'Westlands Station, Nairobi, Kenya',
    host: {
      name: 'Verified Host',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      hostSince: '2023',
      responseTime: 'Under 1 hr',
    },
    rentalFee: 260.0,
    securityDeposit: 300.0,
    totalPaid: 560.0,
    paymentId: 'PM-0000-00000',
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigateTo('my-rentals')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to rentals</span>
            <span className="sm:hidden font-mono">Rental ID: {rental.rentalId || rental.id || 'PM-8921'}</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              {rental.vehicleName || `${rental.vehicle?.make || 'Vehicle'} ${rental.vehicle?.model || ''}`}
            </h1>
            <span className="bg-emerald-50 text-[#06372d] border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {rental.status || 'Active'}
            </span>
          </div>
          <div className="hidden sm:block text-xs text-gray-400 font-mono">
            {rental.rentalId || rental.id || 'PM-8921'}
          </div>
        </div>

        {/* Car Image Cover */}
        <div className="aspect-[16/8] sm:aspect-[21/9] w-full bg-gray-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-black/[0.04]">
          <img
            src={rental.vehiclePhoto || '/cars/gwagon.jpg'}
            alt="Vehicle"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 2-Column Grid on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Trip, Pick-up point, Hosted by */}
          <div className="lg:col-span-7 space-y-6">
            {/* Trip Details Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-950">Trip</h2>
                <span className="bg-emerald-50 text-[#06372d] border border-emerald-500/15 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {rental.durationHours || 26} hrs
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-gray-400 font-medium text-[11px]">Pick-up</div>
                  <div className="font-bold text-gray-900 mt-0.5 text-sm">
                    {rental.pickupDate || 'Tue, 6 Oct · 7:00 am'}
                  </div>
                </div>

                <div className="pt-2 border-t border-black/[0.04]">
                  <div className="text-gray-400 font-medium text-[11px]">Drop-off</div>
                  <div className="font-bold text-gray-900 mt-0.5 text-sm">
                    {rental.dropoffDate || 'Wed, 7 Oct · 9:00 am'}
                  </div>
                </div>
              </div>
            </div>

            {/* Pick-up Point Card with Map Preview */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <h2 className="text-sm font-bold text-gray-950">Pick-up point</h2>

              {/* Map Preview Graphic */}
              <div className="relative h-44 bg-[#e8f1ee] rounded-2xl overflow-hidden border border-emerald-900/10 flex items-center justify-center shadow-xs">
                <div className="w-9 h-9 rounded-full bg-[#06372d] text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                </div>
              </div>

              <p className="text-xs text-gray-600 font-medium">
                {rental.pickupAddress || '100 Ocean Drive, Miami Beach, FL 33139'}
              </p>
            </div>

            {/* Hosted By Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border border-black/[0.06] shrink-0 shadow-2xs">
                <img
                  src={rental.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Host"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs text-gray-900">
                  Hosted by {rental.host?.name || 'Verified Host'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {rental.host?.hostSince || 'Host since 2022'} · {rental.host?.responseTime || '1 hr response'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Security deposit & Payment breakdown */}
          <div className="lg:col-span-5 space-y-6">
            {/* Security Deposit Card with Stepper */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
              <h2 className="text-sm font-bold text-gray-950">Security deposit</h2>

              {/* Stepper: Paid -> Held -> Released */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold px-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#06372d] shadow-2xs" />
                    <span className="text-gray-900 text-[11px]">Paid</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-[#06372d] mx-2 -mt-4" />
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#06372d] ring-4 ring-emerald-100 shadow-2xs" />
                    <span className="text-[#06372d] font-bold text-[11px]">Held</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4" />
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 bg-white" />
                    <span className="text-gray-400 text-[11px]">Released</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 text-center mt-5 leading-relaxed">
                  Held while you have the car. Released when the rental is completed.
                </p>
              </div>
            </div>

            {/* Payment Breakdown Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <h2 className="text-sm font-bold text-gray-950">Payment</h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Rental fee</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {rental.rentalFee ? rental.rentalFee.toFixed(2) : '380.00'} USDC
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Security deposit</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {rental.securityDeposit ? rental.securityDeposit.toFixed(2) : '500.00'} USDC
                  </span>
                </div>

                <div className="flex justify-between text-gray-600 pt-2 border-t border-black/[0.04] font-bold">
                  <span className="text-gray-950">Total paid</span>
                  <span className="font-mono text-gray-950 text-sm">
                    {rental.totalPaid ? rental.totalPaid.toFixed(2) : '880.00'} USDC
                  </span>
                </div>

                <div className="flex justify-between text-gray-400 text-[11px] pt-1">
                  <span>Payment ID</span>
                  <span className="font-mono">{rental.paymentId || 'PM-PAY-8921'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('tx-details')}
                  className="w-full py-2.5 rounded-xl border border-black/[0.08] text-xs font-semibold text-gray-800 hover:bg-gray-50 transition shadow-2xs"
                >
                  Transaction details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
