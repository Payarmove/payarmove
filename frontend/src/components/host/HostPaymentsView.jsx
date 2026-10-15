import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Car,
  Wallet,
  User,
  LogOut,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';

export default function HostPaymentsView() {
  const {
    user,
    navigateTo,
    switchMode,
    hostMetrics,
    hostRentals,
    handleConfirmReturn,
    connectedWallet,
    refreshBackendData,
    setHostAccountTab,
  } = useApp();

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionToast, setActionToast] = useState(null);

  const fetchHostPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.payouts.list();
      const list = res?.results || res || [];
      setPayouts(list);
    } catch (err) {
      console.warn('Failed to fetch host payouts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostPayouts();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBackendData();
    await fetchHostPayouts();
    setIsRefreshing(false);
  };

  // Reconcile and present complete rental transactions
  const allRentalPayments = useMemo(() => {
    const map = new Map();

    for (const p of payouts) {
      const code = p.rental_code || p.id;
      map.set(code, {
        id: p.id,
        rental_code: p.rental_code || `RENT-${p.id.slice(0, 6)}`,
        vehicle_name: p.vehicle_name || 'Vehicle',
        renter_name: p.renter_name || 'Guest Renter',
        gross_rental_usdc: p.gross_rental_usdc,
        platform_fee_usdc: p.platform_fee_usdc,
        net_payout_usdc: p.net_payout_usdc,
        status: p.status,
        tx_hash: p.tx_hash,
        created_at: p.created_at,
        settled_at: p.settled_at,
      });
    }

    for (const hr of hostRentals || []) {
      const code = hr.rentalId || hr.id;
      const isComp = (hr.rawStatus || hr.status || '').toUpperCase() === 'COMPLETED';
      if (!map.has(code)) {
        const gross = Number(hr.grossAmount || hr.rentalFee || 0);
        const fee = (gross * 0.1).toFixed(7);
        const net = (gross - Number(fee)).toFixed(7);
        map.set(code, {
          id: hr.dbId || hr.id,
          rental_code: code,
          vehicle_name: hr.vehicleName || hr.vehicle || 'Vehicle',
          renter_name: hr.renterName || hr.renterEmail || 'Guest Renter',
          gross_rental_usdc: gross,
          platform_fee_usdc: fee,
          net_payout_usdc: net,
          status: isComp ? 'COMPLETED' : 'PENDING',
          tx_hash: hr.stellarTxHash,
          created_at: hr.pickupDate,
          rawRental: hr,
        });
      } else {
        const existing = map.get(code);
        existing.renter_name = hr.renterName || existing.renter_name;
        existing.rawRental = hr;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [payouts, hostRentals]);

  const filteredPayouts = allRentalPayments.filter((p) => {
    const status = (p.status || '').toLowerCase();
    const matchesTab =
      filterTab === 'All' ||
      (filterTab === 'Settled' && (status === 'completed' || status === 'settled')) ||
      (filterTab === 'Pending' && (status === 'pending' || status === 'processing'));

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === '' ||
      (p.rental_code && p.rental_code.toLowerCase().includes(query)) ||
      (p.vehicle_name && p.vehicle_name.toLowerCase().includes(query)) ||
      (p.renter_name && p.renter_name.toLowerCase().includes(query)) ||
      (p.tx_hash && p.tx_hash.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  const completedSum = allRentalPayments
    .filter((p) => (p.status || '').toUpperCase() === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.net_payout_usdc || 0), 0);

  const pendingSum = allRentalPayments
    .filter((p) => (p.status || '').toUpperCase() === 'PENDING')
    .reduce((sum, p) => sum + Number(p.net_payout_usdc || 0), 0);

  const totalEarned = Number(hostMetrics?.total_earned_usdc ?? (completedSum || 0));
  const pendingPayout = Number(hostMetrics?.pending_payout_usdc ?? (pendingSum || 0));

  const payoutWalletAddress = user?.walletAddress || connectedWallet?.address || '';
  const shortWallet = payoutWalletAddress
    ? `${payoutWalletAddress.slice(0, 6)}...${payoutWalletAddress.slice(-4)}`
    : 'No wallet connected';

  const onConfirmReturn = async (payout) => {
    const id = payout.rental_code || payout.id;
    try {
      setActionLoadingId(id);
      await handleConfirmReturn(id);
      setActionToast({
        type: 'success',
        message: `Deal closed! Payout for ${payout.rental_code} settled to your wallet.`,
      });
      await fetchHostPayouts();
      setTimeout(() => setActionToast(null), 5000);
    } catch (err) {
      setActionToast({
        type: 'error',
        message: err.message || 'Failed to settle payout.',
      });
      setTimeout(() => setActionToast(null), 5000);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Toast Alert */}
        {actionToast && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in transition ${
              actionToast.type === 'success'
                ? 'bg-[#06372d] text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {actionToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
              )}
              <span className="text-xs font-semibold">{actionToast.message}</span>
            </div>
            <button
              onClick={() => setActionToast(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Host Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateTo('host-dashboard')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    <span>Dashboard</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#06372d] text-white font-bold text-left shadow-2xs"
                >
                  <span className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4" />
                    <span>Rental payments</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('host-vehicles')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>My vehicles</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHostAccountTab?.('wallet');
                    navigateTo('host-account');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
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
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">Rental payments</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete rental transactions, pending escrow balances, and settled disbursements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-black/[0.06] hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('host-vehicles')}
                  className="bg-[#06372d] hover:bg-[#09473b] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs"
                >
                  Manage fleet
                </button>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Paid Out */}
              <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Total Paid Out
                </div>
                <div className="text-2xl font-black text-gray-950 font-mono mt-1">
                  {totalEarned.toFixed(2)} <span className="text-sm font-bold text-gray-500">USDC</span>
                </div>
                <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Settled directly to Stellar wallet</span>
                </div>
              </div>

              {/* Pending Settlement */}
              <div className="bg-[#f0faf6] rounded-2xl border border-emerald-500/15 p-5 shadow-[0_4px_20px_rgba(6,55,45,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                  Pending Settlement
                </div>
                <div className="text-2xl font-black text-[#06372d] font-mono mt-1">
                  {pendingPayout.toFixed(2)} <span className="text-sm font-bold text-gray-500">USDC</span>
                </div>
                <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Locked in Soroban smart escrow</span>
                </div>
              </div>

              {/* Payout Destination */}
              <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-sm transition">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Payout Destination
                </div>
                <div className="text-sm font-bold text-gray-900 font-mono mt-1 truncate">
                  {shortWallet}
                </div>
                <div className="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
                  <span>Freighter (Testnet)</span>
                  {payoutWalletAddress && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${payoutWalletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      Explorer <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="bg-white rounded-2xl border border-black/[0.04] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {['All', 'Settled', 'Pending'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                      filterTab === tab
                        ? 'bg-[#06372d] text-white shadow-2xs'
                        : 'text-gray-600 hover:text-gray-900 bg-gray-50/70 border border-black/[0.05] shadow-2xs'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search rental, car, or renter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:border-[#06372d] shadow-2xs outline-none transition"
                />
              </div>
            </div>

            {/* Complete Payouts Table */}
            {loading && allRentalPayments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/[0.04] p-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-gray-500">Loading rental payments...</p>
              </div>
            ) : filteredPayouts.length > 0 ? (
              <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-black/[0.04] bg-gray-50/50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-5">Rental Code</th>
                        <th className="py-3.5 px-5">Vehicle & Renter</th>
                        <th className="py-3.5 px-5 text-right">Gross (USDC)</th>
                        <th className="py-3.5 px-5 text-right">Fee (10%)</th>
                        <th className="py-3.5 px-5 text-right font-bold text-gray-900">Net Payout</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Action / Tx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {filteredPayouts.map((p) => {
                        const isCompleted = (p.status || '').toUpperCase() === 'COMPLETED';
                        const isLoading = actionLoadingId === p.rental_code || actionLoadingId === p.id;

                        return (
                          <tr key={p.id || p.rental_code} className="hover:bg-gray-50/50 transition">
                            <td className="py-3.5 px-5 font-bold text-gray-900 font-mono">
                              {p.rental_code || `RENT-${p.id.slice(0, 6)}`}
                            </td>
                            <td className="py-3.5 px-5 text-gray-700">
                              <div className="font-semibold text-gray-950">{p.vehicle_name || 'Booked Vehicle'}</div>
                              <div className="text-[11px] text-gray-500">Renter: {p.renter_name || 'Guest'}</div>
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono text-gray-600">
                              {Number(p.gross_rental_usdc || 0).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono text-gray-400">
                              -{Number(p.platform_fee_usdc || 0).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-black text-gray-950">
                              {Number(p.net_payout_usdc || 0).toFixed(2)} USDC
                            </td>
                            <td className="py-3.5 px-5">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isCompleted
                                    ? 'bg-emerald-100/80 text-[#06372d]'
                                    : 'bg-amber-100/80 text-amber-900'
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                <span>{isCompleted ? 'Settled & Paid' : 'Pending Escrow'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono text-[11px]">
                              {isCompleted ? (
                                p.tx_hash ? (
                                  <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${p.tx_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                                  >
                                    <span>{p.tx_hash.slice(0, 6)}...{p.tx_hash.slice(-4)}</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-emerald-700 font-semibold">Settled</span>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onConfirmReturn(p)}
                                  disabled={isLoading}
                                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-[11px] font-bold transition shadow-2xs hover:shadow-xs inline-flex items-center gap-1"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  <span>Close Deal</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-black/[0.04] p-12 text-center max-w-lg mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#06372d] flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No rental payments yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  Payments appear here in real time as renters book your vehicles and settlements complete through Stellar smart contracts.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('host-vehicles')}
                    className="bg-[#06372d] hover:bg-[#09473b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs"
                  >
                    View My Vehicles
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('host-add-vehicle')}
                    className="bg-white border border-black/[0.06] hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-2xs"
                  >
                    + Add a Vehicle
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
