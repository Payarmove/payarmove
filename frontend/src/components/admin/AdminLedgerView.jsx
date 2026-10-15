import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Receipt, Coins, LogOut, Search, ChevronRight } from 'lucide-react';

export default function AdminLedgerView() {
  const { adminLedgers, navigateTo, switchMode, adminMetrics, handleDisconnectWallet } = useApp();
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = adminLedgers.filter((item) => {
    const matchesTab = filterTab === 'All' || item.payoutStatus.toLowerCase() === filterTab.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      item.rentalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.host.toLowerCase().includes(searchQuery.toLowerCase());
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#06372d] text-white shadow-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4" />
                    <span>Host payouts</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
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
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs"
              >
                Rental payments
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin-ledger')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-[#06372d] text-white shadow-sm"
              >
                Host payouts
              </button>
            </div>

            <div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Host payout ledger</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                What PayarMove owes each host.
              </p>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Gross rental amount
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {Number(adminMetrics?.confirmed_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Platform fees
                </div>
                <div className="text-xl font-black text-gray-950 font-mono mt-1">
                  {Number(adminMetrics?.platform_fees_collected_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-amber-50/50 rounded-2xl border border-amber-200/50 p-4 shadow-[0_4px_20px_rgba(180,83,9,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                  Owed to hosts
                </div>
                <div className="text-xl font-black text-amber-700 font-mono mt-1">
                  {Number(adminMetrics?.owed_to_hosts_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>

              <div className="bg-[#f0faf6] rounded-2xl border border-emerald-500/15 p-4 shadow-[0_4px_20px_rgba(6,55,45,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-[#06372d] uppercase tracking-wider">
                  Paid out
                </div>
                <div className="text-xl font-black text-[#06372d] font-mono mt-1">
                  {Number(adminMetrics?.total_host_payouts_usdc ?? 0).toFixed(2)} USDC
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                {['All', 'Owed', 'Paid out'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                      filterTab === tab
                        ? 'bg-[#06372d] text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-black/[0.06] hover:bg-gray-50 shadow-2xs'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rental or host"
                  className="w-full pl-9 pr-4 py-2 bg-white border border-black/[0.06] rounded-xl text-xs focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                />
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-black/[0.04]">
                      <th className="py-2.5 font-bold">RENTAL</th>
                      <th className="py-2.5 font-bold">RENTER</th>
                      <th className="py-2.5 font-bold">HOST</th>
                      <th className="py-2.5 font-bold">GROSS AMOUNT</th>
                      <th className="py-2.5 font-bold">PLATFORM FEE</th>
                      <th className="py-2.5 font-bold">HOST PAYOUT</th>
                      <th className="py-2.5 font-bold">PAYMENT</th>
                      <th className="py-2.5 font-bold">PAYOUT</th>
                      <th className="py-2.5 font-bold">TX HASH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-gray-400">
                          No host payout records found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/80 transition">
                          <td className="py-3.5 font-mono font-semibold text-gray-800">{item.rentalId}</td>
                          <td className="py-3.5 text-gray-700">{item.renter}</td>
                          <td className="py-3.5 text-gray-700">{item.host}</td>
                          <td className="py-3.5 font-mono font-medium text-gray-900">{item.grossAmount}</td>
                          <td className="py-3.5 font-mono text-gray-600">{item.platformFee}</td>
                          <td className="py-3.5 font-mono font-bold text-gray-950">{item.hostPayout}</td>
                          <td className="py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.paymentStatus === 'Paid'
                                  ? 'bg-[#f0faf6] text-[#06372d] border border-emerald-500/15'
                                  : item.paymentStatus === 'Pending'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                                  : 'bg-red-50 text-red-800 border border-red-200/50'
                              }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.payoutStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-500/20'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200/50'
                              }`}
                            >
                              {item.payoutStatus}
                            </span>
                          </td>
                          <td className="py-3.5 font-mono text-gray-400">{item.txHash}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Explanatory Footnote (Matches Admin dashboard.png!) */}
              <div className="pt-4 border-t border-black/[0.04]">
                <p className="text-[11px] text-gray-500 bg-gray-50/80 p-3 rounded-xl border border-black/[0.06] shadow-2xs inline-block">
                  Ledger rows record customer payment → host amount owed. Automated payouts are out of scope for the MVP.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
