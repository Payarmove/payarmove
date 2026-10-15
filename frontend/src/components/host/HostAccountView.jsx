import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  ChevronDown,
  Camera,
} from 'lucide-react';
import api from '../../services/api';

export default function HostAccountView() {
  const {
    user,
    setUser,
    navigateTo,
    switchMode,
    mode,
    handleDisconnectWallet,
    handleConnectWallet,
    uploadUserAvatar,
    hostAccountTab,
    setHostAccountTab,
    connectedWallet,
    refreshBackendData,
  } = useApp();

  const hosterDefaultWallet =
    user?.walletAddress ||
    user?.primary_stellar_address ||
    connectedWallet?.address ||
    '';

  // Mobile subview state: 'menu' | 'profile' | 'payout-wallet'
  const [mobileSubView, setMobileSubView] = useState(hostAccountTab === 'wallet' ? 'payout-wallet' : 'menu');

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const [fullName, setFullName] = useState(user?.name || user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [payoutWallet, setPayoutWallet] = useState(hosterDefaultWallet);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [inputWallet, setInputWallet] = useState(hosterDefaultWallet);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadUserAvatar(file);
    setIsUploading(false);
  };

  useEffect(() => {
    const defaultAddr =
      user?.walletAddress ||
      user?.primary_stellar_address ||
      connectedWallet?.address ||
      '';

    if (user) {
      if (user.name || user.username) setFullName(user.name || user.username);
      if (user.phone) setPhoneNumber(user.phone);
      if (user.email) setEmail(user.email);
    }
    if (defaultAddr) {
      setPayoutWallet(defaultAddr);
      setInputWallet((prev) => (prev ? prev : defaultAddr));
    }
  }, [user, connectedWallet]);

  useEffect(() => {
    const defaultAddr =
      user?.walletAddress ||
      user?.primary_stellar_address ||
      connectedWallet?.address ||
      '';

    if (hostAccountTab === 'wallet') {
      if (defaultAddr && !inputWallet) {
        setInputWallet(defaultAddr);
      }
      setMobileSubView('payout-wallet');
      setWalletModalOpen(true);
      const el = document.getElementById('payout-wallet-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setMobileSubView('menu');
    }
  }, [hostAccountTab]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: fullName,
      phone: phoneNumber,
      email: email,
    }));
    try {
      const parts = (fullName || '').trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';
      await api.auth.updateProfile({
        first_name,
        last_name,
        phone_number: phoneNumber,
      });
    } catch (err) {
      console.warn('Backend profile update note:', err.message);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveWallet = async () => {
    const targetAddr = (inputWallet || hosterDefaultWallet).trim();
    if (!targetAddr) return;
    setPayoutWallet(targetAddr);
    setUser((prev) => ({
      ...prev,
      walletAddress: targetAddr,
      primary_stellar_address: targetAddr,
    }));
    try {
      await api.auth.updateProfile({ primary_stellar_address: targetAddr });
    } catch (err) {
      console.warn('Backend wallet update note:', err.message);
    }
    if (typeof refreshBackendData === 'function') {
      await refreshBackendData().catch(() => null);
    }
    setWalletModalOpen(false);
    if (setHostAccountTab) setHostAccountTab('profile');
    if (mobileSubView === 'payout-wallet') {
      setMobileSubView('menu');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DESKTOP LAYOUT (Matches Host - Account.png Desktop artboard) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
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
                  onClick={() => navigateTo('host-payments')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
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
                    setHostAccountTab('wallet');
                    setWalletModalOpen(true);
                  }}
                  style={hostAccountTab === 'wallet' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition ${
                    hostAccountTab === 'wallet' ? 'text-white font-bold shadow-2xs' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className={`w-4 h-4 ${hostAccountTab === 'wallet' ? 'text-white' : 'text-gray-400'}`} />
                    <span>Payout wallet</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${hostAccountTab === 'wallet' ? 'text-white' : 'text-gray-400'}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setHostAccountTab('profile')}
                  style={hostAccountTab === 'profile' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition ${
                    hostAccountTab === 'profile' ? 'text-white font-bold shadow-2xs' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <User className={`w-4 h-4 ${hostAccountTab === 'profile' ? 'text-white' : 'text-gray-400'}`} />
                    <span>Account</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${hostAccountTab === 'profile' ? 'text-white' : 'text-gray-400'}`} />
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

          {/* Right Main Content */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Account</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Your profile is shared with your renter account.
              </p>
            </div>

            {/* Card 1: Profile (Matches Host - Account.png) */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <h2 className="text-base font-bold text-gray-950">Profile</h2>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-black/[0.06] shadow-2xs">
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 border border-black/[0.06] rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#06372d] border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-gray-600" />
                      <span>Change photo</span>
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-gray-700">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Marcus Sterling"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-gray-700">Phone number</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="host@payarmove.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#06372d' }}
                    className="px-6 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs"
                  >
                    Save changes
                  </button>
                  {savedSuccess && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Changes saved!</span>
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Card 2: Payout wallet (Matches Host - Account.png) */}
            <div id="payout-wallet-section" className="bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <h2 className="text-base font-bold text-gray-950">Payout wallet</h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="font-mono text-xs text-gray-700 break-all">
                  {payoutWallet ? (
                    <span className="bg-gray-50/70 border border-black/[0.04] px-3 py-1.5 rounded-xl inline-block shadow-2xs">
                      {payoutWallet}
                    </span>
                  ) : (
                    <span className="text-gray-400">No payout wallet added yet</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!inputWallet && hosterDefaultWallet) {
                      setInputWallet(hosterDefaultWallet);
                    }
                    setWalletModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs transition shrink-0 shadow-2xs hover:shadow-xs"
                >
                  Manage payout wallet
                </button>
              </div>
            </div>
          </main>
        </div>

        {/* MOBILE LAYOUT (Matches Host - Account.png Artboards 1, 2, 3) */}
        <div className="md:hidden">
          {/* Mobile Artboard 1: Main Host Account Menu */}
          {mobileSubView === 'menu' && (
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              {/* Header with Mode Toggle */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-950">Account</h1>
                <button
                  onClick={() => switchMode('renter')}
                  className="flex items-center gap-1.5 bg-[#06372d] text-white px-3.5 py-1 rounded-full text-xs font-semibold shadow-2xs"
                >
                  <span>Hosting</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Avatar + Name */}
              <div className="space-y-1">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-black/[0.06] shadow-2xs mb-2">
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-bold text-base text-gray-950">{fullName || user?.username || 'Host Profile'}</h2>
                <p className="text-xs text-gray-400">{email || user?.email || 'No email provided'}</p>
                <p className="text-[11px] text-gray-400 pt-1">
                  Your profile is shared with your renter account.
                </p>
              </div>

              {/* Menu Items */}
              <div className="divide-y divide-black/[0.04] text-xs font-medium pt-2">
                <button
                  onClick={() => setMobileSubView('profile')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => setMobileSubView('payout-wallet')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span>Payout wallet</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span>Host terms</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Help</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Log out */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    switchMode('renter');
                    navigateTo('login');
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
                >
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* Mobile Artboard 2: Profile Sub-Screen */}
          {mobileSubView === 'profile' && (
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSubView('menu')}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-lg font-bold text-gray-950">Profile</h1>
              </div>

              {/* Avatar + Change photo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-black/[0.06] shadow-2xs">
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-full border border-black/[0.06] text-xs font-semibold text-gray-800 hover:bg-gray-50 transition flex items-center gap-2 shadow-2xs"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#06372d] border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5 text-gray-600" />
                      <span>Change photo</span>
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Marcus Sterling"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Phone number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="host@payarmove.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <p className="text-[11px] text-gray-400">
                  Your profile is shared with your renter account.
                </p>

                <div className="pt-3">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#06372d' }}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs"
                  >
                    Save changes
                  </button>
                  {savedSuccess && (
                    <div className="text-xs font-semibold text-emerald-700 text-center mt-2 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Changes saved!</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Mobile Artboard 3: Payout Wallet Sub-Screen */}
          {mobileSubView === 'payout-wallet' && (
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSubView('menu')}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-lg font-bold text-gray-950">Payout wallet</h1>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Add the wallet where your host amount will be sent. Payouts are automatically routed to your Stellar account.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">Wallet address</label>
                    {connectedWallet?.address && (
                      <button
                        type="button"
                        onClick={() => setInputWallet(connectedWallet.address)}
                        className="text-[11px] font-semibold text-[#06372d] hover:underline"
                      >
                        Reset to connected wallet
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={inputWallet}
                    onChange={(e) => setInputWallet(e.target.value)}
                    placeholder="GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 font-mono text-xs focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                  {connectedWallet?.address && (
                    <div className="flex items-center justify-between text-[11px] bg-[#f0faf6] text-emerald-800 p-2.5 rounded-xl border border-emerald-500/15 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Connected: {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInputWallet(connectedWallet.address)}
                        className="font-bold underline ml-2 shrink-0 hover:text-emerald-950"
                      >
                        Use this
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl border border-black/[0.04] flex items-center justify-between text-xs shadow-2xs">
                  <span className="text-gray-500">Current status</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {payoutWallet ? 'Wallet linked' : 'No payout wallet added yet'}
                    </span>
                    <span className="bg-amber-100/80 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveWallet}
                    style={{ backgroundColor: '#06372d' }}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs"
                  >
                    Save Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSubView('menu')}
                    className="w-full py-2.5 rounded-xl text-gray-600 font-semibold text-xs border border-black/[0.06] hover:bg-gray-50 shadow-2xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Modal for Payout Wallet */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-black/[0.04] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-gray-900">Payout wallet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add the wallet where your host amount will be sent. For now payouts are recorded in your ledger. [Payout method to be confirmed]
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-700">Wallet address</label>
                {connectedWallet?.address && (
                  <button
                    type="button"
                    onClick={() => setInputWallet(connectedWallet.address)}
                    className="text-[11px] font-semibold text-[#06372d] hover:underline"
                  >
                    Reset to connected wallet
                  </button>
                )}
              </div>
              <input
                type="text"
                value={inputWallet}
                onChange={(e) => setInputWallet(e.target.value)}
                placeholder="GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 font-mono text-xs focus:bg-white focus:border-[#06372d] shadow-2xs transition"
              />
              {connectedWallet?.address && (
                <div className="flex items-center justify-between text-[11px] bg-[#f0faf6] text-emerald-800 p-2.5 rounded-xl border border-emerald-500/15 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Connected: {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-6)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInputWallet(connectedWallet.address)}
                    className="font-bold underline ml-2 shrink-0 hover:text-emerald-950"
                  >
                    Use this
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-50/70 rounded-xl border border-black/[0.04] flex items-center justify-between text-xs shadow-2xs">
              <span className="text-gray-500">Current status</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {payoutWallet ? 'Wallet linked' : 'No payout wallet added yet'}
                </span>
                <span className="bg-amber-100/80 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                  Pending
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSaveWallet}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs hover:shadow-xs"
              >
                Save Wallet
              </button>
              <button
                type="button"
                onClick={() => setWalletModalOpen(false)}
                className="w-full py-2 rounded-xl text-gray-600 font-semibold text-xs hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
