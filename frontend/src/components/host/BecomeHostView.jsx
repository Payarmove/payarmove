import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Car,
  Receipt,
  Coins,
  CheckCircle2,
  Clock,
  HelpCircle,
  LogOut,
  User,
  Shield,
  FileText,
  ArrowLeft,
  Wallet,
  Check,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

export default function BecomeHostView() {
  const {
    user,
    setUser,
    navigateTo,
    switchMode,
    handleDisconnectWallet,
    connectedWallet,
    handleConnectWallet,
    refreshBackendData,
  } = useApp();

  const [fullName, setFullName] = useState(user?.name || user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [payoutAddress, setPayoutAddress] = useState(connectedWallet?.address || user?.walletAddress || '');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Check backend application status on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        if (api.tokens.isAuthenticated()) {
          const res = await api.auth.getHostApplicationStatus().catch(() => null);
          if (isMounted && res) {
            // User only has active privileges if they actually applied and were approved
            if (res.has_applied && res.is_host && res.status === 'APPROVED') {
              setHasApplied(true);
              setApplicationData(
                res.application || {
                  status: 'APPROVED',
                  payout_stellar_address: res.payout_stellar_address || user?.walletAddress,
                }
              );
            } else {
              setHasApplied(false);
            }
          }
        } else {
          if (isMounted) setHasApplied(false);
        }
      } catch (e) {
        console.warn('Host status query notice:', e);
        if (isMounted) setHasApplied(false);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  // Sync inputs with user / connected wallet
  useEffect(() => {
    if (user) {
      if (user.name || user.username) setFullName(user.name || user.username);
      if (user.phone) setPhoneNumber(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const activeWallet = connectedWallet?.address || user?.walletAddress || '';
    if (activeWallet) {
      setPayoutAddress(activeWallet);
    }
  }, [connectedWallet?.address, user?.walletAddress]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!agreed) {
      setErrorMessage('You must agree to the Host Terms & Escrow Agreement.');
      return;
    }

    const targetPayout = payoutAddress || connectedWallet?.address || user?.walletAddress;
    if (!targetPayout || !targetPayout.startsWith('G')) {
      setErrorMessage('Please connect your Stellar wallet or provide a valid Stellar address starting with G for payouts.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (api.tokens.isAuthenticated()) {
        const res = await api.auth.applyHost({
          full_name: fullName,
          phone_number: phoneNumber,
          email: email,
          payout_stellar_address: targetPayout,
          agreed_terms: true,
        });

        if (res?.application) {
          setApplicationData(res.application);
        }
      }

      setUser((prev) => ({
        ...prev,
        name: fullName || prev.name,
        phone: phoneNumber || prev.phone,
        email: email || prev.email,
        role: 'host',
        walletAddress: targetPayout || prev.walletAddress,
      }));

      setHasApplied(true);
      if (typeof refreshBackendData === 'function') {
        await refreshBackendData().catch(() => null);
      }
      switchMode('host');
      navigateTo('become-host-success');
    } catch (err) {
      console.error('Host application error:', err);
      setErrorMessage(err.message || 'Failed to submit host application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Top Back Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('explore')}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-black bg-white px-3.5 py-2 rounded-xl border border-black/[0.06] shadow-2xs hover:shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span>Back to Explore</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Matches Become a host.png) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              {/* User snippet */}
              <div className="flex items-center gap-3 pb-4 border-b border-black/[0.04]">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-black/[0.06] shadow-2xs shrink-0">
                  <img
                    src={user?.avatar || '/default-avatar.svg'}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">
                    {user?.name || user?.username || 'Guest'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || 'Sign in to access your profile'}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateTo('renter-profile')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('my-rentals')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Car className="w-4 h-4 text-gray-500" />
                  <span>Active rentals</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('my-rentals')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Rental history</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('renter-profile')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Receipt className="w-4 h-4 text-gray-500" />
                  <span>Payment and wallet</span>
                </button>

                <button
                  type="button"
                  style={{ backgroundColor: '#06372d' }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white text-left font-bold shadow-2xs"
                >
                  <Coins className="w-4 h-4" />
                  <span>Become a host</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('explore')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span>Help</span>
                </button>
              </nav>

              <div className="pt-4 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => {
                    handleDisconnectWallet();
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Card */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
              {/* Mobile Back Button */}
              <div className="lg:hidden flex items-center gap-2 pb-2 border-b border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => navigateTo('explore')}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Explore</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {hasApplied ? 'Vehicle Host Account' : 'Become a host'}
                  </h1>
                  {hasApplied && (
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100/80 text-[#06372d] flex items-center gap-1.5 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approved Host
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {hasApplied
                    ? 'Your host application has been approved and your account is active on the platform.'
                    : "Rent out your car to travellers and locals. You'll use the same PayarMove account, with a host side added to it."}
                </p>
              </div>

              {/* STOP SHOWING FORM IF APPLIED */}
              {hasApplied ? (
                <div className="space-y-6 pt-2">
                  <div className="p-5 rounded-2xl bg-[#f0faf6] border border-emerald-500/15 text-emerald-950 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <h3 className="font-bold text-sm">Host privileges active</h3>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      You are registered as an active host. You can list vehicles, manage rental bookings, and receive direct 90% USDC payouts into your configured Stellar wallet.
                    </p>
                  </div>

                  {/* Configured Payout Wallet Card */}
                  <div className="p-5 rounded-2xl bg-gray-50/70 border border-black/[0.04] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#06372d]" />
                        <span className="text-xs font-bold text-gray-900">Designated Payout Wallet</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#06372d]">
                        Active on Stellar
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-black/[0.04] font-mono text-xs text-gray-800 flex items-center justify-between shadow-2xs">
                      <span className="truncate max-w-[280px] sm:max-w-md font-semibold">
                        {applicationData?.payout_stellar_address || payoutAddress || user?.walletAddress || connectedWallet?.address || 'GCAD5PDJRNUAASBJSRL4YNNUCIB723PYNIGMU7FWSUKMS5IPUYIU46YI'}
                      </span>
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      USDC earnings from completed rentals will be disbursed directly to this Stellar address upon smart contract settlement.
                    </p>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        switchMode('host');
                        navigateTo('host-dashboard');
                      }}
                      style={{ backgroundColor: '#06372d' }}
                      className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Open Host Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchMode('host');
                        navigateTo('host-add-vehicle');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4 text-[#06372d]" />
                      <span>List a Vehicle</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('explore')}
                      className="text-xs font-semibold text-gray-500 hover:text-black transition"
                    >
                      ← Back to Explore
                    </button>
                  </div>
                </div>
              ) : (
                /* APPLICATION FORM (Only displayed if NOT yet applied) */
                <>
                  {/* 3 Value Points */}
                  <div className="space-y-5 pt-2">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-gray-900">List your car</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Add the vehicles you want to rent out.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-gray-900">Get paid in USDC</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Rental payments are tracked and recorded in your payout ledger.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-gray-900">Track every payment</h2>
                        <p className="text-xs text-gray-500 mt-0.5">See each rental, its status and what you are owed.</p>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Form: Confirm your details */}
                  <form onSubmit={handleContinue} className="space-y-5 pt-4 border-t border-black/[0.04]">
                    <h2 className="text-sm font-bold text-gray-900">Confirm your details</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Full name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Phone number</label>
                        <input
                          type="text"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. +254 700 123 456"
                          className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>

                    {/* Connected Payout Wallet Section */}
                    <div className="space-y-2 p-4 rounded-2xl bg-gray-50/70 border border-black/[0.04] shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                          <Wallet className="w-4 h-4 text-[#06372d]" />
                          <span>Payout Wallet (Stellar USDC)</span>
                        </div>
                        {payoutAddress ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#06372d] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Wallet required
                          </span>
                        )}
                      </div>

                      {payoutAddress ? (
                        <div className="space-y-1">
                          <div className="p-2.5 bg-white rounded-xl border border-black/[0.04] font-mono text-xs text-gray-800 truncate shadow-2xs">
                            {payoutAddress}
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Using your connected wallet as payout wallet. Rental disbursements in USDC will be paid here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <p className="text-[11px] text-gray-500">
                            Connect your Freighter wallet to automatically set it as your payout wallet.
                          </p>
                          <button
                            type="button"
                            onClick={handleConnectWallet}
                            className="py-2 px-3.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 transition flex items-center gap-2 shadow-2xs hover:shadow-xs"
                          >
                            <Wallet className="w-3.5 h-3.5 text-gray-600" />
                            <span>Connect Freighter Wallet</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Agreement Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="accent-[#06372d] w-4 h-4 rounded"
                      />
                      <span className="text-xs text-gray-600">
                        I agree to PayarMove's <span className="font-semibold text-gray-900">Host Terms & Escrow Agreement</span>
                      </span>
                    </label>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#06372d' }}
                        className="py-3 px-6 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting Application...' : 'Continue as host'}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo('explore')}
                        className="text-xs font-semibold text-gray-600 hover:text-black transition"
                      >
                        Not now
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
