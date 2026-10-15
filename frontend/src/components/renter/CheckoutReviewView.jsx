import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ArrowLeft, Calendar } from 'lucide-react';
import api from '../../services/api';

export default function CheckoutReviewView() {
  const {
    selectedVehicle,
    searchQuery,
    navigateTo,
    setCheckoutStep,
    setSelectedRentalId,
    connectedWallet,
    user,
    refreshBackendData,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicle = selectedVehicle || {
    make: 'Mercedes-Benz',
    model: 'GLE Coupe',
    year: 2024,
    category: 'SUV',
    area: 'Kilimani',
    hourlyRate: 35.0,
    securityDeposit: 200.0,
    host: { name: 'Verified Host' },
    images: ['/cars/gle.jpg'],
  };

  const durationHours = searchQuery.durationHours || 26;
  const rentalFee = (vehicle.hourlyRate * durationHours).toFixed(2);
  const securityDeposit = vehicle.securityDeposit.toFixed(2);
  const fees = '0.00';
  const totalAmount = (Number(rentalFee) + Number(securityDeposit) + Number(fees)).toFixed(2);

  const handleProceedToWallet = () => {
    const hasWallet = Boolean(connectedWallet?.address || user?.walletAddress);
    setCheckoutStep(hasWallet ? 'approve' : 'connect');
    setSelectedRentalId('');
    navigateTo('checkout-wallet');
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      {/* Top Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-black/[0.04] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] py-4 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-black text-xl tracking-wider text-gray-950 uppercase">
            PAYAR MOVE
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <Lock className="w-3.5 h-3.5 text-gray-500" />
            <span>Secure checkout</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight mb-8">
          Review and pay
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Card 1: Car Summary */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <img
                src={vehicle.images?.[0] || '/cars/gle.jpg'}
                alt={vehicle.model}
                className="w-24 h-20 object-cover rounded-2xl bg-gray-100 shrink-0 shadow-2xs"
              />
              <div>
                <h3 className="font-bold text-gray-950 text-base">
                  {vehicle.name || `${vehicle.make} ${vehicle.model}`} {vehicle.year}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {vehicle.location || 'Nairobi, Kenya'}
                </p>
                <p className="text-xs text-gray-500">
                  Hosted by {vehicle.host?.name || 'Verified Host'}
                </p>
              </div>
            </div>

            {/* Card 2: Rental dates */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-950">Rental dates</h3>
                <span className="bg-[#e2f4ed] text-[#06372d] text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                  {durationHours} hrs
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400 font-medium">Pick up</div>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {searchQuery.pickupDate || 'Tue, 6 Oct'}
                  </div>
                  <div className="text-gray-500">
                    {searchQuery.pickupTime || '7:00 am'}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 font-medium">Drop off</div>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {searchQuery.dropoffDate || 'Wed, 7 Oct'}
                  </div>
                  <div className="text-gray-500">
                    {searchQuery.dropoffTime || '9:00 am'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Payment method */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-bold text-gray-950 mb-3">Payment method</h3>
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 border border-emerald-500/15 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    $
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">USDC</div>
                    <div className="text-[11px] text-gray-500">
                      Pay from your digital wallet
                    </div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-4 border-[#06372d] bg-white" />
              </div>
            </div>

            {/* Card 4: Payment details */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-2.5 text-xs">
              <h3 className="text-sm font-bold text-gray-950 mb-2">Payment details</h3>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient</span>
                <span className="font-semibold text-gray-900">
                  {vehicle.host?.name || 'Verified Host'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Asset</span>
                <span className="font-semibold text-gray-900">USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Network</span>
                <span className="font-semibold text-gray-900">Stellar Testnet</span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] space-y-4">
              <h3 className="text-sm font-bold text-gray-950">Payment breakdown</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Rental fee ({Number(vehicle.hourlyRate || 25).toFixed(2)} USDC × {durationHours} hrs)</span>
                  <span className="font-mono font-medium text-gray-900">{rentalFee} USDC</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Security deposit</span>
                  <span className="font-mono font-medium text-gray-900">{securityDeposit} USDC</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee (Stellar gas)</span>
                  <span className="font-mono font-medium text-gray-900">{fees} USDC</span>
                </div>
              </div>

              <div className="border-t border-black/[0.04] pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-950">Total</span>
                <span className="text-lg font-black text-gray-950 font-mono">
                  {totalAmount} USDC
                </span>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                Your security deposit is locked in the Soroban Escrow Smart Contract and released automatically upon car return.
              </p>

              {/* Pay button */}
              <button
                type="button"
                onClick={handleProceedToWallet}
                disabled={isSubmitting}
                className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 rounded-full font-bold text-xs sm:text-sm transition shadow-sm text-center flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Securing booking...</span>
                  </>
                ) : (
                  <span>Pay {totalAmount} USDC</span>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400">
                You'll confirm the payment in your wallet next
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
