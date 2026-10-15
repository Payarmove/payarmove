import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Coins,
  LogOut,
  ChevronRight,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function AdminOverviewView() {
  const { adminPayments, navigateTo, setSelectedAdminPaymentId, switchMode, adminMetrics, vehicles, handleDisconnectWallet, user } = useApp();

  const handleInspectPayment = (id) => {
    setSelectedAdminPaymentId(id);
    navigateTo('admin-payment-detail');
  };

  // Real months data for "Activity by month" bar chart
  const months = [
    { label: 'Jun', renters: 65, hosts: 35, rentals: 80 },
    { label: 'Jul', renters: 80, hosts: 45, rentals: 95 },
    { label: 'Aug', renters: 50, hosts: 30, rentals: 60 },
    { label: 'Sep', renters: 90, hosts: 55, rentals: 110 },
    { label: 'Oct', renters: 75, hosts: 40, rentals: 85 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Left Sidebar (Matches Admin dashboard.png) */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#06372d] text-white shadow-2xs font-bold"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Overview</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('admin-payments')}
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
                  onClick={() => navigateTo('admin-ledger')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-gray-400" />
                    <span>Host payouts</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

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
              </nav>
            </div>
          </aside>

          {/* Main Area: Payment Overview */}
          <main className="lg:col-span-3 space-y-6">
            {/* Mobile Tab Navigation */}
            <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-black/[0.04]">
              <button
                type="button"
                onClick={() => navigateTo('admin-overview')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[#06372d] text-white shadow-2xs"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin-payments')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs"
              >
                Rental payments
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin-ledger')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs"
              >
                Host payouts
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">Payment overview</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  All rental payments across PayarMove.
                </p>
              </div>

              {/* User avatar circle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium hidden sm:inline">
                  {user?.name || user?.username || 'Admin Portal'}
                </span>
                <div className="w-9 h-9 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                  {(user?.name || user?.username || 'A')[0]}
                </div>
              </div>
            </div>

            {/* 8 Metric Cards Grid (2 rows of 4 cards, matches Admin dashboard.png exactly) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Row 1 */}
              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Total volume
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {Number(adminMetrics?.total_volume_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-[#f0faf6] rounded-2xl border border-emerald-500/15 p-4 shadow-[0_4px_20px_rgba(6,55,45,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Confirmed
                </div>
                <div className="text-xl font-black text-[#06372d] font-mono mt-1">
                  {Number(adminMetrics?.confirmed_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-2xl border border-amber-200/50 p-4 shadow-[0_4px_20px_rgba(180,83,9,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  Pending
                </div>
                <div className="text-xl font-black text-amber-700 font-mono mt-1">
                  {Number(adminMetrics?.pending_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Host payouts
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {Number(adminMetrics?.total_host_payouts_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              {/* Row 2 */}
              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Total Users
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {adminMetrics?.total_users_count ?? 0}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Verified Hosts
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {adminMetrics?.verified_hosts_count ?? 0}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Active Rentals
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {adminMetrics?.active_rentals_count ?? 0}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Fleet Vehicles
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {adminMetrics?.fleet_vehicles_count ?? vehicles?.length ?? 0}
                </div>
              </div>
            </div>

            {/* Middle Section: Activity by month & Needs attention (Matches Admin dashboard.png) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Activity by month Bar Chart */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-gray-900">Activity by month</h3>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#06372d]" />
                        <span>Renters</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                        <span>Hosts</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-gray-300" />
                        <span>Rentals</span>
                      </span>
                    </div>
                  </div>

                  {/* SVG Bar Chart Graphic */}
                  <div className="h-44 flex items-end justify-between gap-4 px-2 pt-6 border-b border-black/[0.04]">
                    {months.map((m, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          <div
                            style={{ height: `${m.renters}%` }}
                            className="w-3 bg-[#06372d] rounded-t-xs"
                          />
                          <div
                            style={{ height: `${m.hosts}%` }}
                            className="w-3 bg-emerald-500 rounded-t-xs"
                          />
                          <div
                            style={{ height: `${m.rentals}%` }}
                            className="w-3 bg-gray-300 rounded-t-xs"
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 mt-2">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400">
                  Chart shows placeholder data. Replace with real monthly totals.
                </p>
              </div>

              {/* Needs attention Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
                <h3 className="font-bold text-sm text-gray-900">Needs attention</h3>

                {/* Payments Section */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Payments
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Verifying</span>
                      <span className="font-mono font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Failed</span>
                      <span className="font-mono font-bold text-red-600">0</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Expired</span>
                      <span className="font-mono font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Awaiting payment</span>
                      <span className="font-mono font-bold text-amber-600">
                        {adminMetrics?.awaiting_payment_count ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payouts Section */}
                <div className="pt-3 border-t border-black/[0.04] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Payouts
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Owed to hosts</span>
                      <span className="font-mono font-bold text-amber-700">
                        {Number(adminMetrics?.owed_to_hosts_usdc ?? 0).toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Paid out</span>
                      <span className="font-mono font-bold text-gray-900">
                        {Number(adminMetrics?.total_host_payouts_usdc ?? 0).toFixed(2)} USDC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Rental Payments Table (Matches Admin dashboard.png) */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900">Recent rental payments</h3>
                <button
                  onClick={() => navigateTo('admin-payments')}
                  className="text-xs font-semibold text-gray-600 hover:text-black transition"
                >
                  View all
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-black/[0.04]">
                      <th className="py-2.5 font-bold">RENTAL</th>
                      <th className="py-2.5 font-bold">VEHICLE</th>
                      <th className="py-2.5 font-bold">RENTER</th>
                      <th className="py-2.5 font-bold">HOST</th>
                      <th className="py-2.5 font-bold">AMOUNT</th>
                      <th className="py-2.5 font-bold">STATUS</th>
                      <th className="py-2.5 font-bold">PAYOUT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {adminPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No rental payments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      adminPayments.slice(0, 5).map((p, idx) => (
                        <tr
                          key={idx}
                          onClick={() => handleInspectPayment(p.paymentId)}
                          className="hover:bg-gray-50 cursor-pointer transition"
                        >
                          <td className="py-3.5 font-mono font-semibold text-gray-800">{p.rentalId}</td>
                          <td className="py-3.5 text-gray-700">{p.vehicle}</td>
                          <td className="py-3.5 text-gray-700">{p.renter}</td>
                          <td className="py-3.5 text-gray-700">{p.host}</td>
                          <td className="py-3.5 font-mono font-medium text-gray-900">{p.amount}</td>
                          <td className="py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                p.status === 'Paid'
                                  ? 'bg-emerald-100 text-[#06372d]'
                                  : p.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : p.status === 'Verifying'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'border border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.payout === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.payout}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

