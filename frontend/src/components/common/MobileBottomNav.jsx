import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Heart,
  User,
  LayoutDashboard,
  Receipt,
  Car,
} from 'lucide-react';

export default function MobileBottomNav({ forceMobile = false }) {
  const { currentView, navigateTo, mode, previewDevice } = useApp();

  // Don't show bottom nav on auth, admin, or full-screen checkout flows
  const hiddenViews = [
    'login',
    'signup',
    'forgot-password',
    'admin-signin',
    'checkout-wallet',
  ];
  if (hiddenViews.includes(currentView)) return null;

  const isMobile = forceMobile || previewDevice === 'mobile';

  return (
    <nav className={`${isMobile ? 'flex absolute' : 'md:hidden fixed'} bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.04] px-6 py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]`}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mode === 'host' ? (
          <>
            {/* Dashboard */}
            <button
              onClick={() => navigateTo('host-dashboard')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'host-dashboard'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${currentView === 'host-dashboard' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Dashboard</span>
            </button>

            {/* Payments */}
            <button
              onClick={() => navigateTo('host-payments')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'host-payments'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <Receipt className={`w-5 h-5 ${currentView === 'host-payments' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Payments</span>
            </button>

            {/* Vehicles */}
            <button
              onClick={() => navigateTo('host-vehicles')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'host-vehicles' ||
                currentView === 'host-add-vehicle' ||
                currentView === 'host-vehicle-manage'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <Car className={`w-5 h-5 ${currentView === 'host-vehicles' || currentView === 'host-add-vehicle' || currentView === 'host-vehicle-manage' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Vehicles</span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigateTo('host-account')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'host-account'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <User className={`w-5 h-5 ${currentView === 'host-account' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Account</span>
            </button>
          </>
        ) : (
          <>
            {/* Explore */}
            <button
              onClick={() => navigateTo('explore')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'explore' || currentView === 'search' || currentView === 'vehicle-detail'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <Compass className={`w-5 h-5 ${currentView === 'explore' || currentView === 'search' || currentView === 'vehicle-detail' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Explore</span>
            </button>

            {/* Saved */}
            <button
              onClick={() => navigateTo('saved')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'saved'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <Heart className={`w-5 h-5 ${currentView === 'saved' ? 'stroke-[2.5] fill-[#06372d]/10' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Saved</span>
            </button>

            {/* Account */}
            <button
              onClick={() => navigateTo('renter-profile')}
              className={`flex flex-col items-center gap-1 py-1 transition ${
                currentView === 'renter-profile' || currentView === 'my-rentals' || currentView === 'rental-detail' || currentView === 'become-host'
                  ? 'text-[#06372d] font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              <User className={`w-5 h-5 ${currentView === 'renter-profile' || currentView === 'my-rentals' || currentView === 'rental-detail' || currentView === 'become-host' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] tracking-tight">Account</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
