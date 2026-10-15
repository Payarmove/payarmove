import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Clock,
  Receipt,
  Coins,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Paintbrush,
  User,
} from 'lucide-react';

export default function MyRentalsView() {
  const { rentals, navigateTo, user, setSelectedRentalId, handleDisconnectWallet, setProfileTab, rentalsTab, setRentalsTab } = useApp();
  const [activeTab, setActiveTab] = useState(rentalsTab || 'active'); // 'active' | 'history'

  useEffect(() => {
    if (rentalsTab) {
      setActiveTab(rentalsTab);
    }
  }, [rentalsTab]);

  const seenRentalKeys = new Set();
  const activeRentals = rentals.filter((r) => {
    const st = (r.status || '').toLowerCase();
    if (!['active', 'confirmed', 'awaiting payment'].includes(st)) {
      return false;
    }
    const key = r.rentalId || r.id || r.dbId;
    if (seenRentalKeys.has(key)) return false;
    seenRentalKeys.add(key);
    return true;
  });

  const seenHistoryKeys = new Set();
  const historyRentals = rentals.filter((r) => {
    const st = (r.status || '').toLowerCase();
    if (!['completed', 'cancelled', 'disbursed'].includes(st)) {
      return false;
    }
    const key = r.rentalId || r.id || r.dbId;
    if (seenHistoryKeys.has(key)) return false;
    seenHistoryKeys.add(key);
    return true;
  });

  const displayedRentals = activeTab === 'active' ? activeRentals : historyRentals;

  const handleViewRental = (rentalId) => {
    setSelectedRentalId(rentalId);
    navigateTo('rental-detail');
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DESKTOP LAYOUT (Matches My rentals.png Artboard 4) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              {/* User snippet */}
              <div className="space-y-3 pb-4 border-b border-black/[0.04]">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-black/[0.06] shadow-2xs">
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-gray-950 truncate">
                    {user?.name || user?.username || 'User Profile'}
                  </h2>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || 'No email provided'}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setProfileTab?.('profile');
                    navigateTo('renter-profile');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('active');
                    setRentalsTab?.('active');
                  }}
                  style={activeTab === 'active' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition ${
                    activeTab === 'active' ? 'text-white font-bold shadow-xs' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Active rentals</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    setRentalsTab?.('history');
                  }}
                  style={activeTab === 'history' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition ${
                    activeTab === 'history' ? 'text-white font-bold shadow-xs' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Rental history</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileTab?.('wallet');
                    navigateTo('renter-profile');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Receipt className="w-4 h-4 text-gray-500" />
                  <span>Payment and wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('become-host')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Coins className="w-4 h-4 text-gray-500" />
                  <span>+ List your vehicle</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span>Help</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-black/[0.04]">
                <button
                  onClick={() => {
                    handleDisconnectWallet();
                  }}
                  className="w-full text-xs font-semibold text-gray-500 hover:text-black py-2 px-3 rounded-xl hover:bg-gray-50 transition text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Card */}
          <main className="md:col-span-8 lg:col-span-9">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">My rentals</h1>
                {/* Tabs */}
                <div className="flex items-center gap-3 mt-4 border-b border-black/[0.04] pb-3">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                      activeTab === 'active'
                        ? 'bg-[#06372d] text-white shadow-xs'
                        : 'text-gray-600 hover:text-black bg-gray-50/80 border border-black/[0.04]'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition ${
                      activeTab === 'history'
                        ? 'bg-[#06372d] text-white shadow-xs'
                        : 'text-gray-600 hover:text-black bg-gray-50/80 border border-black/[0.04]'
                    }`}
                  >
                    History
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  {activeTab === 'active'
                    ? 'Active rentals shows ongoing rentals only. Finished trips move to History.'
                    : 'Completed and past rentals recorded on the Stellar ledger.'}
                </p>
              </div>

              {/* List of rentals or Empty state */}
              {displayedRentals.length === 0 ? (
                <div className="py-8 flex justify-center">
                  <div className="bg-gray-50/70 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 max-w-sm w-full border border-black/[0.04] shadow-xs">
                    <div className="w-12 h-12 rounded-full border border-emerald-900/10 text-[#06372d] flex items-center justify-center bg-white shadow-2xs">
                      <Paintbrush className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        {activeTab === 'active' ? 'No active rental' : 'No past rentals yet'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                        {activeTab === 'active'
                          ? 'When you book a car, it appears here'
                          : 'Completed and active rentals appear here'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo('explore')}
                      style={{ backgroundColor: '#06372d' }}
                      className="px-6 py-2 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-xs"
                    >
                      Find a car
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedRentals.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl border border-black/[0.04] bg-white hover:border-black/[0.08] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-black/[0.04] shrink-0 shadow-2xs">
                          <img
                            src={item.vehiclePhoto || item.image || '/cars/gwagon.jpg'}
                            alt="Car"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900">
                              {item.vehicleName || `${item.vehicle?.make || 'Vehicle'} ${item.vehicle?.model || ''}`}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                                ['active', 'confirmed'].includes((item.status || '').toLowerCase())
                                  ? 'bg-emerald-50 text-[#06372d] border border-emerald-500/20'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {['active', 'confirmed'].includes((item.status || '').toLowerCase()) ? 'Active' : item.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {item.pickupDate} – {item.dropoffDate || item.returnDate} · {item.durationHours || 24} hrs · ID: {item.rentalId || item.id}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[11px] text-gray-400">Escrow Deposit</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                                ['active', 'confirmed'].includes((item.status || '').toLowerCase())
                                  ? 'bg-amber-50 text-amber-800 border border-amber-500/20'
                                  : 'bg-emerald-50 text-[#06372d] border border-emerald-500/20'
                              }`}
                            >
                              {['active', 'confirmed'].includes((item.status || '').toLowerCase()) ? 'Held in Soroban' : 'Released'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.04]">
                        <div className="text-right">
                          <span className="text-sm font-black text-gray-950 font-mono">
                            {Number(item.totalPaid || item.total_cost || 0).toFixed(2)} USDC
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewRental(item.id)}
                          className="px-4 py-1.5 rounded-full border border-black/[0.08] text-xs font-semibold text-gray-800 hover:bg-gray-50 transition shadow-2xs"
                        >
                          View rental
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* MOBILE LAYOUT (Matches My rentals.png Artboards 2 & 3) */}
        <div className="md:hidden space-y-4">
          <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('renter-profile')}
                className="w-8 h-8 rounded-full bg-gray-50 border border-black/[0.04] flex items-center justify-center text-gray-700 shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-lg font-bold text-gray-950">My rentals</h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-3">
              <button
                onClick={() => setActiveTab('active')}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition ${
                  activeTab === 'active'
                    ? 'bg-[#06372d] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black bg-gray-50/80 border border-black/[0.04]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition ${
                  activeTab === 'history'
                    ? 'bg-[#06372d] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black bg-gray-50/80 border border-black/[0.04]'
                }`}
              >
                History
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {activeTab === 'active'
                ? 'Active rentals shows ongoing rentals only. Finished trips move to History.'
                : 'Completed and past rentals recorded on the Stellar ledger.'}
            </p>

            {/* Rentals list or empty state */}
            {displayedRentals.length === 0 ? (
              <div className="py-6 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full border border-emerald-900/10 text-[#06372d] flex items-center justify-center bg-gray-50 shadow-2xs">
                  <Paintbrush className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="font-bold text-sm text-gray-900">
                  {activeTab === 'active' ? 'No active rental' : 'No past rentals yet'}
                </h3>
                <p className="text-xs text-gray-500 max-w-[200px]">
                  {activeTab === 'active'
                    ? 'When you book a car, it appears here'
                    : 'Completed and active rentals appear here'}
                </p>
                <button
                  onClick={() => navigateTo('explore')}
                  style={{ backgroundColor: '#06372d' }}
                  className="px-6 py-2 rounded-full text-white font-semibold text-xs hover:opacity-95 transition mt-2 shadow-xs"
                >
                  Find a car
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {displayedRentals.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-black/[0.04] bg-white space-y-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 border border-black/[0.04] shrink-0 shadow-2xs">
                        <img
                          src={item.vehiclePhoto || item.image || '/cars/gwagon.jpg'}
                          alt="Car"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs text-gray-900 truncate">
                            {item.vehicleName || `${item.vehicle?.make || 'Vehicle'} ${item.vehicle?.model || ''}`}
                          </h3>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs ${
                              ['active', 'confirmed'].includes((item.status || '').toLowerCase())
                                ? 'bg-emerald-50 text-[#06372d] border border-emerald-500/20'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {['active', 'confirmed'].includes((item.status || '').toLowerCase()) ? 'Active' : item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.pickupDate} – {item.dropoffDate || item.returnDate}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-gray-400">ID: {item.rentalId || item.id} Deposit</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs ${
                              ['active', 'confirmed'].includes((item.status || '').toLowerCase())
                                ? 'bg-amber-50 text-amber-800 border border-amber-500/20'
                                : 'bg-emerald-50 text-[#06372d] border border-emerald-500/20'
                            }`}
                          >
                            {['active', 'confirmed'].includes((item.status || '').toLowerCase()) ? 'Held' : 'Released'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
                      <span className="text-xs font-black text-gray-950 font-mono">
                        {Number(item.totalPaid || item.total_cost || 0).toFixed(2)} USDC
                      </span>
                      <button
                        onClick={() => handleViewRental(item.id)}
                        className="px-3.5 py-1 rounded-full border border-black/[0.08] text-xs font-semibold text-gray-800 hover:bg-gray-50 transition shadow-2xs"
                      >
                        View rental
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
