import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Car,
  Wallet,
  FileText,
  UserPlus,
  Settings,
  ShieldAlert,
  KeyRound,
  Sparkles,
  Smartphone,
  Monitor,
} from 'lucide-react';

export default function DesignNavigator() {
  const { currentView, navigateTo, checkoutStep, setCheckoutStep, previewDevice, setPreviewDevice } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // If inside an iframe device frame, don't show navigator inside
  if (typeof window !== 'undefined' && window.self !== window.top) {
    return null;
  }

  const groups = [
    {
      title: 'Search and book a car',
      icon: Car,
      screens: [
        { label: 'Explore Landing', view: 'explore' },
        { label: 'Search Results', view: 'search' },
        { label: 'Vehicle Details', view: 'vehicle-detail' },
        { label: 'Review & Pay', view: 'checkout-review' },
      ],
    },
    {
      title: 'Connect wallet (Stellar Kit)',
      icon: Wallet,
      screens: [
        {
          label: '1. Choose Wallet',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('connect');
            navigateTo('checkout-wallet');
          },
        },
        {
          label: '2. Approve in Wallet',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('approve');
            navigateTo('checkout-wallet');
          },
        },
        {
          label: '3. Processing Payment',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('processing');
            navigateTo('checkout-wallet');
          },
        },
        {
          label: '4. Payment Confirmed',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('confirmed');
            navigateTo('checkout-wallet');
          },
        },
        {
          label: '5. Payment Failed',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('failed');
            navigateTo('checkout-wallet');
          },
        },
        {
          label: '6. Confirming (Delayed)',
          view: 'checkout-wallet',
          action: () => {
            setCheckoutStep('delayed');
            navigateTo('checkout-wallet');
          },
        },
      ],
    },
    {
      title: 'My rentals & Account',
      icon: FileText,
      screens: [
        { label: 'My Rentals (Active & History)', view: 'my-rentals' },
        { label: 'Rental Details', view: 'rental-detail' },
        { label: 'Transaction Details (Stellar)', view: 'tx-details' },
        { label: 'Saved Cars (Wishlist)', view: 'saved' },
        { label: 'Renter Profile', view: 'renter-profile' },
      ],
    },
    {
      title: 'Become a host',
      icon: UserPlus,
      screens: [
        { label: 'Host Pitch & Form', view: 'become-host' },
        { label: 'Host Success Welcome', view: 'become-host-success' },
      ],
    },
    {
      title: 'Host - Add a vehicle & Dashboard',
      icon: Settings,
      screens: [
        { label: 'Host Dashboard (Overview)', view: 'host-dashboard' },
        { label: 'Host Rental Payments', view: 'host-payments' },
        { label: 'My Vehicles List', view: 'host-vehicles' },
        { label: 'Add Vehicle Form + Preview', view: 'host-add-vehicle' },
        { label: 'Manage Vehicle Listing', view: 'host-vehicle-manage' },
        { label: 'Host Account & Payout Wallet', view: 'host-account' },
      ],
    },
    {
      title: 'Admin dashboard',
      icon: ShieldAlert,
      screens: [
        { label: 'Admin Sign In', view: 'admin-signin' },
        { label: 'Payment Overview', view: 'admin-overview' },
        { label: 'Rental Payments Table', view: 'admin-payments' },
        { label: 'Payment Verification [PM-0000]', view: 'admin-payment-detail' },
        { label: 'Host Payout Ledger', view: 'admin-ledger' },
      ],
    },
    {
      title: 'Auth & Password',
      icon: KeyRound,
      screens: [
        { label: 'Log In', view: 'login' },
        { label: 'Sign Up', view: 'signup' },
        { label: 'Forgot Password', view: 'forgot-password' },
      ],
    },
    {
      title: 'Empty states',
      icon: Sparkles,
      screens: [
        { label: 'Empty States Catalog (All 6)', view: 'empty-states' },
      ],
    },
  ];

  return (
    <aside aria-label="Design page switcher" className="fixed bottom-3 right-3 z-50">
      {/* Floating Toggle Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-900/95 text-white hover:bg-black px-4 py-2.5 rounded-full shadow-2xl backdrop-blur border border-gray-700/60 transition text-xs font-semibold"
      >
        <Layers className="w-4 h-4 text-emerald-400" />
        <span>Design Page Switcher ({groups.reduce((acc, g) => acc + g.screens.length, 0)} screens)</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Drawer */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-[92vw] max-w-xl max-h-[75vh] overflow-y-auto bg-gray-900/95 text-white rounded-2xl shadow-2xl border border-gray-800 p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Pixel-Perfect Clone Navigator
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              Active: <code className="text-emerald-400">{currentView}</code>
            </span>
          </div>

          {/* Viewport Device Toggle */}
          <div className="bg-gray-800/80 rounded-xl p-2.5 mb-3 border border-gray-750 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-300">Device Frame:</span>
            <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-lg border border-gray-700">
              <button
                type="button"
                onClick={() => setPreviewDevice('responsive')}
                className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition ${
                  previewDevice === 'responsive'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Responsive / Full</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition ${
                  previewDevice === 'mobile'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>iPhone 15 (393px)</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {groups.map((group, idx) => {
              const Icon = group.icon;
              return (
                <div key={idx} className="bg-gray-850/50 p-2.5 rounded-xl border border-gray-800/80">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-300 mb-2">
                    <Icon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{group.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.screens.map((screen, sIdx) => {
                      const isActive =
                        currentView === screen.view &&
                        (!screen.action ||
                          (screen.view === 'checkout-wallet' &&
                            screen.label.toLowerCase().includes(checkoutStep)));
                      return (
                        <button
                          key={sIdx}
                          onClick={() => {
                            if (screen.action) {
                              screen.action();
                            } else {
                              navigateTo(screen.view);
                            }
                            setIsOpen(false);
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg transition font-medium text-left ${
                            isActive
                              ? 'bg-emerald-600 text-white font-semibold shadow'
                              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {screen.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
