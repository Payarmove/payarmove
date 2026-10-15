import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Renter views
import ExploreView from './components/renter/ExploreView';
import SearchResultsView from './components/renter/SearchResultsView';
import VehicleDetailView from './components/renter/VehicleDetailView';
import CheckoutReviewView from './components/renter/CheckoutReviewView';
import WalletPaymentView from './components/renter/WalletPaymentView';
import MyRentalsView from './components/renter/MyRentalsView';
import RentalDetailView from './components/renter/RentalDetailView';
import TransactionDetailModal from './components/renter/TransactionDetailModal';
import SavedCarsView from './components/renter/SavedCarsView';
import RenterProfileView from './components/renter/RenterProfileView';

// Host views
import BecomeHostView from './components/host/BecomeHostView';
import BecomeHostSuccessView from './components/host/BecomeHostSuccessView';
import HostDashboardView from './components/host/HostDashboardView';
import HostVehiclesView from './components/host/HostVehiclesView';
import AddVehicleView from './components/host/AddVehicleView';
import VehicleManageView from './components/host/VehicleManageView';
import HostAccountView from './components/host/HostAccountView';
import HostPaymentsView from './components/host/HostPaymentsView';

// Admin views
import AdminSignInView from './components/admin/AdminSignInView';
import AdminOverviewView from './components/admin/AdminOverviewView';
import AdminPaymentsView from './components/admin/AdminPaymentsView';
import AdminPaymentDetailView from './components/admin/AdminPaymentDetailView';
import AdminLedgerView from './components/admin/AdminLedgerView';

// Auth views
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import ForgotPasswordView from './components/auth/ForgotPasswordView';

// Common views
import EmptyStatesShowcase from './components/common/EmptyStatesShowcase';
import { initStellarKit } from './services/stellarWallet';

import MobileBottomNav from './components/common/MobileBottomNav';
import ErrorBoundary from './components/common/ErrorBoundary';

function MainRouter() {
  const { currentView, previewDevice, setPreviewDevice, mode, checkoutStep, user } = useApp();
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    initStellarKit();
  }, []);

  const renderView = () => {
    // 1. Admin Role Guard
    const adminViews = ['admin-overview', 'admin-payments', 'admin-payment-detail', 'admin-ledger'];
    if (adminViews.includes(currentView)) {
      if (!user?.isLoggedIn || user?.role !== 'admin') {
        return <AdminSignInView />;
      }
    }

    // 2. Host Role Guard
    const hostViews = ['host-dashboard', 'host-vehicles', 'host-add-vehicle', 'host-vehicle-manage', 'host-account', 'host-payments'];
    if (hostViews.includes(currentView)) {
      if (!user?.isLoggedIn) {
        return <LoginView />;
      }
      if (user?.role !== 'host' && user?.role !== 'admin') {
        return <BecomeHostView />;
      }
    }

    // 3. Protected Renter Views
    const renterProtectedViews = ['my-rentals', 'rental-detail', 'renter-profile', 'checkout-review', 'checkout-wallet'];
    if (renterProtectedViews.includes(currentView)) {
      if (!user?.isLoggedIn) {
        return <LoginView />;
      }
    }

    switch (currentView) {
      case 'explore':
        return <ExploreView />;
      case 'search':
        return <SearchResultsView />;
      case 'vehicle-detail':
        return <VehicleDetailView />;
      case 'checkout-review':
        return <CheckoutReviewView />;
      case 'checkout-wallet':
        return <WalletPaymentView />;
      case 'my-rentals':
        return <MyRentalsView />;
      case 'rental-detail':
        return <RentalDetailView />;
      case 'tx-details':
        return <TransactionDetailModal />;
      case 'saved':
        return <SavedCarsView />;
      case 'renter-profile':
        return <RenterProfileView />;
      case 'become-host':
        return <BecomeHostView />;
      case 'become-host-success':
        return <BecomeHostSuccessView />;
      case 'host-dashboard':
        return <HostDashboardView />;
      case 'host-vehicles':
        return <HostVehiclesView />;
      case 'host-add-vehicle':
        return <AddVehicleView />;
      case 'host-vehicle-manage':
        return <VehicleManageView />;
      case 'host-account':
        return <HostAccountView />;
      case 'host-payments':
        return <HostPaymentsView />;
      case 'admin-signin':
        return <AdminSignInView />;
      case 'admin-overview':
        return <AdminOverviewView />;
      case 'admin-payments':
        return <AdminPaymentsView />;
      case 'admin-payment-detail':
        return <AdminPaymentDetailView />;
      case 'admin-ledger':
        return <AdminLedgerView />;
      case 'login':
        return <LoginView />;
      case 'signup':
        return <SignupView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'empty-states':
        return <EmptyStatesShowcase />;
      default:
        return <ExploreView />;
    }
  };

  const isAuthOrCheckout = [
    'login',
    'signup',
    'forgot-password',
    'admin-signin',
    'checkout-wallet',
  ].includes(currentView);

  // If mobile iPhone frame preview is requested on desktop:
  if (previewDevice === 'mobile' && !isInIframe) {
    const iframeSrc = `/?view=${currentView}&mode=${mode}&step=${checkoutStep}`;
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-start py-8 px-4 text-white">
        {/* Device Switcher Header */}
        <div className="mb-6 flex items-center gap-3 bg-neutral-850 text-white px-5 py-2.5 rounded-full border border-neutral-750 shadow-2xl text-xs font-semibold">
          <span className="text-gray-400">Device Frame:</span>
          <button
            onClick={() => setPreviewDevice('responsive')}
            className="px-3.5 py-1 rounded-full bg-neutral-750 hover:bg-neutral-700 text-gray-200 transition"
          >
            🖥️ Full Responsive
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className="px-3.5 py-1 rounded-full bg-emerald-600 text-white transition shadow"
          >
            📱 iPhone 15 Pro (393px)
          </button>
        </div>

        {/* Realistic iPhone 15 Pro Frame */}
        <div className="relative w-[393px] h-[852px] bg-black rounded-[54px] p-2.5 shadow-2xl border-[6px] border-neutral-700 flex flex-col shrink-0 ring-1 ring-white/10">
          {/* iOS Dynamic Island & Status Bar */}
          <div className="h-10 bg-white flex items-center justify-between px-7 shrink-0 text-[11px] font-semibold text-gray-950 rounded-t-[44px] relative z-40 select-none">
            <span>9:41</span>
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-850" />
              <div className="w-2 h-2 rounded-full bg-blue-900/30" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-950">
              <span className="text-[10px]">5G</span>
              <div className="w-5 h-2.5 rounded-xs border border-gray-950 flex items-center p-0.5">
                <div className="w-full h-full bg-gray-950 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Device Screen containing actual responsive viewport */}
          <div className="w-full flex-1 rounded-b-[44px] overflow-hidden bg-white relative">
            <iframe
              src={iframeSrc}
              title="Mobile Device Preview"
              className="w-full h-full border-0"
            />
          </div>

          {/* iOS Bottom Home Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/40 rounded-full pointer-events-none z-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary key={currentView}>
          {renderView()}
        </ErrorBoundary>
      </main>
      {!isAuthOrCheckout && <Footer />}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
