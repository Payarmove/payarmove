import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Car,
  Wallet,
  User,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';

export default function VehicleManageView() {
  const { vehicles, rentals, selectedVehicleId, navigateTo, switchMode, setHostAccountTab } = useApp();

  const car =
    vehicles.find((v) => v.id === selectedVehicleId) ||
    vehicles[0] || {
      id: 'v1',
      make: 'Mercedes-Benz',
      model: 'GLE 450 Coupe',
      year: 2023,
      category: 'SUV',
      hourlyRate: 45.0,
      securityDeposit: 250.0,
      area: 'Miami, FL',
      specs: { seats: 5, transmission: 'Automatic', fuel: 'Petrol' },
      images: ['/cars/gwagon.jpg'],
    };

  const [isPaused, setIsPaused] = useState(false);

  const displayRentals = rentals && rentals.length > 0
    ? rentals.map((r, i) => ({
        rentalId: r.code || r.rentalId || r.id || `PM-892${i + 1}`,
        dates: r.start_date && r.end_date
          ? `${new Date(r.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(r.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : (r.pickupDate ? `${r.pickupDate} – ${r.returnDate || ''}` : 'Active Booking'),
        renter: r.renter?.first_name || r.renter?.username || r.renter?.email?.split('@')[0] || r.hostName || 'Verified Guest',
        amount: `${Number(r.total_amount_usdc || r.totalPaid || 0).toFixed(2)} USDC`,
        status: (r.status === 'confirmed' || r.status === 'active' || r.status === 'Active') ? 'Active' : 'Completed',
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Host Left Sidebar (Matches Host - Add a vehicle.png artboard 8) */}
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
                  onClick={() => navigateTo('host-vehicles')}
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
                    <span>Log out</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Area: Matches Host - Add a vehicle.png artboard 8 */}
          <main className="lg:col-span-3 space-y-6">
            {/* Breadcrumb */}
            <button
              onClick={() => navigateTo('host-vehicles')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My vehicles</span>
            </button>

            {/* Header with Title, Status & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                    {car.make} {car.model} {car.year}
                  </h1>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isPaused
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-emerald-100 text-[#06372d]'
                    }`}
                  >
                    {isPaused ? 'Paused' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {car.category || 'Luxury'} · {car.area || car.location || 'Miami, FL'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-4 py-2 border border-black/[0.06] bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-800 transition shadow-2xs hover:shadow-xs"
                >
                  {isPaused ? 'Resume listing' : 'Pause listing'}
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('host-add-vehicle')}
                  className="px-4 py-2 border border-black/[0.06] bg-white hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-800 transition shadow-2xs hover:shadow-xs"
                >
                  Edit vehicle
                </button>
              </div>
            </div>

            {/* 4 Metric Cards in a row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Trips
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {car.reviewsCount || 18}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Earnings
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {Number(car.totalEarnings || 450).toFixed(2)} USDC
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">After platform fee</div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Rating
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  ★ {car.rating ? car.rating.toFixed(1) : '5.0'}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </div>
                <div className="text-xl font-black text-[#06372d] font-mono mt-1">
                  {car.status || 'Available'}
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Left (Photo + Listing details) & Right (Rentals for this car) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-6">
                {/* Large Car Photo */}
                <div className="aspect-[16/10] bg-gray-100 rounded-3xl overflow-hidden border border-black/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                  <img
                    src={car.images?.[0] || car.image || '/cars/gwagon.jpg'}
                    alt={car.model}
                    onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Listing Details Card */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3.5 text-xs">
                  <h3 className="font-bold text-sm text-gray-950 mb-4">Listing details</h3>

                  <div className="flex justify-between text-gray-600">
                    <span>Hourly rate</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {car.hourlyRate ? car.hourlyRate.toFixed(2) : '45.00'} USDC
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Security deposit</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {car.securityDeposit ? car.securityDeposit.toFixed(2) : '500.00'} USDC
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Category</span>
                    <span className="font-semibold text-gray-900">{car.category || 'Luxury'}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Seats</span>
                    <span className="font-semibold text-gray-900">{car.specs?.seats || '5 seats'}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Transmission</span>
                    <span className="font-semibold text-gray-900">{car.specs?.transmission || 'Automatic'}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Fuel</span>
                    <span className="font-semibold text-gray-900">{car.specs?.fuel || 'Gasoline'}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Pick-up area</span>
                    <span className="font-semibold text-gray-900">{car.area || car.location || 'Miami Beach, FL'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Rentals for this car */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-950">Rentals for this car</h3>
                  <button
                    onClick={() => navigateTo('host-payments')}
                    className="text-xs font-semibold text-gray-500 hover:text-black transition"
                  >
                    View all
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-black/[0.04]">
                        <th className="py-2.5 font-bold">RENTAL</th>
                        <th className="py-2.5 font-bold">DATES</th>
                        <th className="py-2.5 font-bold">RENTER</th>
                        <th className="py-2.5 font-bold">AMOUNT</th>
                        <th className="py-2.5 font-bold">STATUS</th>
                        <th className="py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {displayRentals.length > 0 ? (
                        displayRentals.map((r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => navigateTo('rental-detail')}
                          >
                            <td className="py-3.5 font-mono font-semibold text-gray-800">
                              {r.rentalId}
                            </td>
                            <td className="py-3.5 text-gray-600">{r.dates}</td>
                            <td className="py-3.5 text-gray-700">{r.renter}</td>
                            <td className="py-3.5 font-mono font-medium text-gray-900">
                              {r.amount}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  r.status === 'Active'
                                    ? 'bg-emerald-100 text-[#06372d]'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right font-semibold text-gray-400">
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                            No rentals recorded for this vehicle yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
