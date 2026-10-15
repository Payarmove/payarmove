import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export default function BecomeHostSuccessView() {
  const { navigateTo, switchMode, user, connectedWallet } = useApp();

  return (
    <div className="min-h-screen bg-[#f7f8f8] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-black/[0.04] max-w-lg w-full p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-8 animate-in fade-in zoom-in-95">
        {/* Checkmark icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            You're now a host
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your account now has a host side. Here's how to get started.
          </p>
        </div>

        {/* 2 Step Action Boxes (Exact Figma Text) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f0faf6] border border-emerald-500/15 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">Payout wallet configured</h2>
                <p className="text-[11px] text-gray-500 font-mono">
                  {user?.walletAddress || connectedWallet?.address
                    ? `${(user?.walletAddress || connectedWallet?.address).slice(0, 6)}...${(user?.walletAddress || connectedWallet?.address).slice(-4)}`
                    : 'Freighter Payout Wallet'} · USDC Payouts
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('host-account')}
              className="px-3.5 py-1.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition shadow-2xs"
            >
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/70 border border-black/[0.04] shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-xs font-bold text-gray-900">Add your first vehicle</h2>
                <p className="text-[11px] text-gray-500">
                  Cars you list appear in renters' search results.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('host-add-vehicle')}
              className="px-3.5 py-1.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition shadow-2xs"
            >
              Add vehicle
            </button>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => switchMode('host')}
            style={{ backgroundColor: '#06372d' }}
            className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs flex items-center justify-center gap-2"
          >
            <span>Go to host dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-gray-400">
            You can switch back to renting anytime from the top bar.
          </p>
        </div>
      </div>
    </div>
  );
}
