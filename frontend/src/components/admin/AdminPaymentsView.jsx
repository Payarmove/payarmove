import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, Coins, LogOut, Search, ChevronRight } from 'lucide-react';

export default function AdminPaymentsView() {
  const { adminPayments, navigateTo, setSelectedAdminPaymentId, switchMode, handleDisconnectWallet } = useApp();
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Created', 'Awaiting payment', 'Verifying', 'Paid', 'Failed', 'Expired', 'Cancelled'];

  const filtered = adminPayments.filter((p) => {
    const matchesTab = filterTab === 'All' || p.status.toLowerCase() === filterTab.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      p.rentalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.renter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateTo('admin-overview')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    <span>Overview</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#06372d] text-white shadow-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4" />
                    <span>Rental payments</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
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
                    type="button"
                    onClick={() => {
                      handleDisconnectWallet();
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

          {/* Main Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Mobile Tab Navigation */}
            <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-black/[0.04]">
              <button
                type="button"
                onClick={() => navigateTo('admin-overview')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin-payments')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[#06372d] text-white shadow-sm"
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

            <div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Rental payments</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Every payment and its current status.
              </p>
            </div>

            {/* Filter Tabs (Matches Admin dashboard.png) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    filterTab === tab
                      ? 'bg-[#06372d] text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rental, vehicle or wallet"
                className="w-full pl-9 pr-4 py-2 bg-white border border-black/[0.06] rounded-xl text-xs focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No matching rental payments found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p, idx) => (
                        <tr
                          key={idx}
                          onClick={() => {
                            setSelectedAdminPaymentId(p.paymentId);
                            navigateTo('admin-payment-detail', { paymentId: p.paymentId });
                          }}
                          className="hover:bg-gray-50/80 cursor-pointer transition"
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
                                  ? 'bg-[#f0faf6] text-[#06372d] border border-emerald-500/15'
                                  : p.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                                  : p.status === 'Verifying'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200/50'
                                  : 'bg-red-50 text-red-800 border border-red-200/50'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.payout === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/20'
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

              <p className="text-[11px] text-gray-400 pt-2 border-t border-black/[0.04]">
                Select a row to open payment details and verification status.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
