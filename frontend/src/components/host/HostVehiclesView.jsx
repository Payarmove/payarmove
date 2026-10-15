import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, Car, Wallet, User, LogOut, Plus, ChevronRight } from 'lucide-react';

export default function HostVehiclesView() {
  const { vehicles, hostVehicles, navigateTo, setSelectedVehicleId, switchMode, setHostAccountTab } = useApp();
  const [tab, setTab] = useState('all'); // 'all' | 'draft'

  const displayList = hostVehicles || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Host Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateTo('host-dashboard')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    <span>Dashboard</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('host-payments')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <span>Rental payments</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#06372d] text-white shadow-2xs font-bold"
                >
                  <span className="flex items-center gap-2.5">
                    <Car className="w-4 h-4" />
                    <span>My vehicles</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHostAccountTab?.('wallet');
                    navigateTo('host-account');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span>Payout wallet</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHostAccountTab?.('profile');
                    navigateTo('host-account');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Account</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <div className="pt-4 border-t border-black/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      switchMode('renting');
                      navigateTo('explore');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Switch to Renter</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Area */}
          <main className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">My vehicles</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage your mobility fleet and live rental availability.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('host-add-vehicle')}
                className="bg-[#06372d] hover:bg-[#09473b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add vehicle</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-black/[0.04] pb-2">
              <button
                type="button"
                onClick={() => setTab('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  tab === 'all'
                    ? 'bg-[#06372d] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 bg-white border border-black/[0.06] shadow-2xs'
                }`}
              >
                All listing
              </button>
              <button
                type="button"
                onClick={() => setTab('draft')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  tab === 'draft'
                    ? 'bg-[#06372d] text-white shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900 bg-white border border-black/[0.06] shadow-2xs'
                }`}
              >
                Draft
              </button>
            </div>

            {/* Vehicle List */}
            {tab === 'all' && displayList.length > 0 ? (
              <div className="space-y-4">
                {displayList.map((car) => {
                  const carImg = (car.images && car.images[0]) || car.image || '/cars/gwagon.jpg';
                  const carTitle = car.name || `${car.make || ''} ${car.model || ''}`.trim() || 'Luxury Vehicle';
                  const hrRate = Number(car.hourlyRate || 0);
                  const dRate = Number(car.dailyRate || hrRate * 24);

                  return (
                    <div
                      key={car.id}
                      className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={carImg}
                          alt={carTitle}
                          onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                          className="w-24 h-20 rounded-xl object-cover bg-gray-100 shrink-0 border border-black/[0.06] shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-950 text-base">
                              {carTitle} {car.year ? `(${car.year})` : ''}
                            </h3>
                            <span className="bg-emerald-100/80 text-[#06372d] text-[11px] font-bold px-2 py-0.5 rounded-full">
                              {car.status || 'Active'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {car.licensePlate || car.registration_number || 'Registered'} · {car.location || car.area || 'Nairobi, Kenya'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#f0faf6] text-emerald-800 border border-emerald-500/15">
                              ★ {Number(car.rating || 5.0).toFixed(1)} ({car.tripsCount || 8} trips)
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-50/80 text-gray-700 border border-black/[0.05]">
                              {car.category || 'SUV'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-black/[0.04]">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-gray-950 font-mono">
                            {hrRate.toFixed(2)} USDC <span className="text-xs text-gray-500 font-normal">/hr</span>
                          </span>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {dRate.toFixed(2)} USDC /day
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            navigateTo('host-vehicle-manage', { vehicleId: car.id });
                          }}
                          className="bg-white border border-black/[0.06] text-gray-800 hover:bg-gray-50 text-xs font-semibold px-4 py-2 rounded-xl transition shadow-2xs hover:shadow-xs"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state matching Empty states.png Card 5 */
              <div className="bg-white rounded-3xl border border-black/[0.04] p-12 text-center max-w-md mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#06372d] flex items-center justify-center mx-auto mb-4">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Add your first vehicle
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  List a car to start getting rentals paid in USDC
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('host-add-vehicle')}
                  className="w-full bg-[#06372d] text-white py-3 rounded-xl text-xs font-semibold hover:bg-[#09473b] transition shadow-2xs"
                >
                  Add vehicle
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
