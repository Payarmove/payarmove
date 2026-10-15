import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Car,
  Clock,
  Receipt,
  Coins,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Check,
  Camera,
  Wallet,
  ExternalLink,
  Copy,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export default function RenterProfileView() {
  const {
    user,
    setUser,
    navigateTo,
    switchMode,
    handleDisconnectWallet,
    uploadUserAvatar,
    connectedWallet,
    handleConnectWallet,
    fundConnectedWallet,
    isWalletConnecting,
    profileTab,
    setProfileTab,
    setRentalsTab,
  } = useApp();

  // Desktop active tab: 'profile' | 'wallet'
  const [activeTab, setActiveTab] = useState(profileTab || 'profile');

  useEffect(() => {
    if (profileTab) {
      setActiveTab(profileTab);
    }
  }, [profileTab]);

  // Mobile subview state: 'menu' (artboard 1) | 'edit-profile' | 'wallet'
  const [mobileSubView, setMobileSubView] = useState(profileTab === 'wallet' ? 'wallet' : 'menu');

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const [fullName, setFullName] = useState(user?.name || user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadUserAvatar(file);
    setIsUploading(false);
  };

  useEffect(() => {
    if (user) {
      if (user.name || user.username) setFullName(user.name || user.username);
      if (user.phone) setPhoneNumber(user.phone);
      if (user.email) setEmail(user.email);
      if (user.walletAddress) setWalletAddress(user.walletAddress);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setUser((prev) => ({
      ...prev,
      name: fullName,
      phone: phoneNumber,
      email: email,
      walletAddress: walletAddress,
    }));
    try {
      const parts = (fullName || '').trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';
      await api.auth.updateProfile({
        first_name,
        last_name,
        phone_number: phoneNumber,
        ...(walletAddress ? { primary_stellar_address: walletAddress } : {}),
      });
    } catch (err) {
      console.warn('Backend profile update note:', err.message);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* DESKTOP LAYOUT (Matches Become a host.png Artboard 2) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar Card */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              {/* User Avatar + Name */}
              <div className="space-y-3 pb-4 border-b border-black/[0.04]">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-black/[0.06] shadow-2xs">
                  <img
                    src={user?.avatar || '/default-avatar.svg'}
                    alt={fullName || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-gray-950 truncate">
                    {fullName || user?.username || 'User Profile'}
                  </h2>
                  <p className="text-xs text-gray-400 truncate">
                    {email || user?.email || 'No email provided'}
                  </p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  style={activeTab === 'profile' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition ${
                    activeTab === 'profile' ? 'text-white font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRentalsTab?.('active');
                    navigateTo('my-rentals');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Car className="w-4 h-4 text-gray-500" />
                  <span>Active rentals</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRentalsTab?.('history');
                    navigateTo('my-rentals');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Rental history</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  style={activeTab === 'wallet' ? { backgroundColor: '#06372d' } : {}}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition ${
                    activeTab === 'wallet' ? 'text-white font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Payment and wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('become-host')}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition text-left"
                >
                  <Coins className="w-4 h-4 text-gray-500" />
                  <span>+ Become a host</span>
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
            {activeTab === 'profile' ? (
              <div className="bg-white rounded-3xl border border-black/[0.04] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                  Profile
                </h1>

                {/* Photo + Change Photo Button */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border border-black/[0.06] shadow-2xs">
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
                    className="px-4 py-2 rounded-full border border-black/[0.08] text-xs font-semibold text-gray-800 hover:bg-gray-50 transition shadow-2xs flex items-center gap-2"
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

                {/* Profile Edit Form */}
                <form onSubmit={handleSave} className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">Full name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs text-gray-900 focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700">Phone number</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs text-gray-900 focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="renter@payarmove.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs text-gray-900 focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Wallet address</label>
                    <input
                      type="text"
                      value={connectedWallet?.address || walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="GC2R34KL...EKLT"
                      className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs font-mono text-gray-900 focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      style={{ backgroundColor: '#06372d' }}
                      className="px-6 py-2.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
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
            ) : (
              <div className="bg-white rounded-3xl border border-black/[0.04] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8 animate-in fade-in">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                    Payment and wallet
                  </h1>
                  <p className="text-xs text-gray-500">
                    Manage your connected Stellar account, on-chain balances, and Soroban escrow settlements.
                  </p>
                </div>

                {/* Connected Wallet Section */}
                {connectedWallet?.address ? (
                  <div className="space-y-6">
                    <div className="bg-emerald-50/40 border border-emerald-500/15 rounded-2xl p-6 space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ★
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-gray-900">
                              {connectedWallet.name || 'Freighter Wallet'}
                            </h3>
                            <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full shadow-2xs">
                              Connected · Stellar Testnet
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDisconnectWallet}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                        >
                          Disconnect
                        </button>
                      </div>

                      {/* Public Address */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-500/10 shadow-2xs flex items-center justify-between">
                        <div className="overflow-hidden mr-3">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Stellar Public Address</span>
                          <span className="font-mono text-xs text-gray-800 truncate block">
                            {connectedWallet.address}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(connectedWallet.address);
                            setCopiedWallet(true);
                            setTimeout(() => setCopiedWallet(false), 2000);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition shrink-0"
                          title="Copy public address"
                        >
                          {copiedWallet ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* On-Chain Balances */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="bg-white p-3.5 rounded-xl border border-black/[0.04] shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">USDC Balance (Rental Asset)</span>
                          <span className="text-xl font-black text-gray-950 font-mono mt-0.5 block">
                            {connectedWallet.balance || user?.balanceFormatted || '0.00 USDC'}
                          </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-black/[0.04] shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">XLM Balance (Transaction Gas)</span>
                          <span className="text-xl font-black text-gray-950 font-mono mt-0.5 block">
                            {connectedWallet.xlm ? `${Number(connectedWallet.xlm).toFixed(2)} XLM` : '0.00 XLM'}
                          </span>
                        </div>
                      </div>

                      {/* Actions: Fund via Friendbot & Stellar.Expert */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsFunding(true);
                            await fundConnectedWallet();
                            setIsFunding(false);
                          }}
                          disabled={isFunding}
                          className="bg-[#06372d] hover:bg-[#09473b] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                        >
                          {isFunding ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          )}
                          <span>{isFunding ? 'Requesting Testnet Lumens...' : 'Fund via Friendbot (+10,000 XLM)'}</span>
                        </button>

                        <a
                          href={`https://stellar.expert/explorer/testnet/account/${connectedWallet.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline px-3 py-2"
                        >
                          <span>View on Stellar.Expert</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50/70 border border-dashed border-black/[0.1] rounded-3xl p-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#06372d] border border-emerald-500/20 flex items-center justify-center mx-auto shadow-2xs">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-gray-950">No Stellar wallet connected</h3>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        Connect Freighter or any wallet from Stellar Wallets Kit to pay for rentals with USDC and manage your security deposits.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConnectWallet()}
                      disabled={isWalletConnecting}
                      className="bg-[#06372d] hover:bg-[#09473b] text-white px-6 py-3 rounded-full font-bold text-xs transition shadow-xs inline-flex items-center gap-2"
                    >
                      {isWalletConnecting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wallet className="w-4 h-4" />
                      )}
                      <span>{isWalletConnecting ? 'Connecting...' : 'Connect Stellar Wallet'}</span>
                    </button>
                  </div>
                )}

                {/* About Security Deposit Section */}
                <div className="bg-[#f0faf6] border border-emerald-500/10 shadow-xs rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">About Security Deposit & Soroban Escrow</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    When you book a vehicle, your rental fee is sent to escrow and your security deposit is locked in the PayarMove Soroban smart contract. The deposit is held separately from rental fees and returned automatically once the trip is completed with no damage.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* MOBILE LAYOUT (Matches Become a host.png Artboard 1) */}
        <div className="md:hidden">
          {mobileSubView === 'menu' ? (
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              {/* Profile Avatar + Name Header */}
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden border border-black/[0.06] shadow-2xs">
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-base text-gray-950">
                    {fullName || user?.username || 'User Profile'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {email || user?.email || 'No email provided'}
                  </p>
                </div>
              </div>

              {/* Menu List */}
              <div className="divide-y divide-black/[0.04] text-xs font-medium">
                <button
                  onClick={() => setMobileSubView('edit-profile')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => navigateTo('my-rentals')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span>My rentals</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => setMobileSubView('wallet')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span>Payment and wallet</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => navigateTo('become-host')}
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <Coins className="w-4 h-4 text-gray-500" />
                    <span>+ Become a host</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  className="w-full py-3.5 flex items-center justify-between text-gray-800 hover:text-black transition"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span>Help</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Log out link */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleDisconnectWallet();
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 transition"
                >
                  Log out
                </button>
              </div>
            </div>
          ) : mobileSubView === 'wallet' ? (
            /* Subview: Mobile Payment and Wallet */
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSubView('menu')}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-lg font-bold text-gray-950">Payment and wallet</h1>
              </div>

              {connectedWallet?.address ? (
                <div className="space-y-4">
                  <div className="bg-[#f0faf6] border border-emerald-500/10 shadow-xs rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs">
                          ★
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-gray-900">
                            {connectedWallet.name || 'Freighter Wallet'}
                          </h3>
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            Connected · Testnet
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDisconnectWallet}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Disconnect
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-black/[0.04] shadow-2xs flex items-center justify-between">
                      <span className="font-mono text-[11px] text-gray-700 truncate mr-2">
                        {connectedWallet.address}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(connectedWallet.address);
                          setCopiedWallet(true);
                          setTimeout(() => setCopiedWallet(false), 2000);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-black/[0.04] shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">USDC Balance</span>
                        <span className="text-base font-black text-gray-950 font-mono mt-0.5 block">
                          {connectedWallet.balance || user?.balanceFormatted || '0.00 USDC'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/[0.04] shadow-2xs">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">XLM Gas</span>
                        <span className="text-base font-black text-gray-950 font-mono mt-0.5 block">
                          {connectedWallet.xlm ? `${Number(connectedWallet.xlm).toFixed(1)} XLM` : '0 XLM'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsFunding(true);
                        await fundConnectedWallet();
                        setIsFunding(false);
                      }}
                      disabled={isFunding}
                      className="w-full bg-[#06372d] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs"
                    >
                      {isFunding ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                      <span>{isFunding ? 'Funding from Friendbot...' : 'Fund via Friendbot (+10,000 XLM)'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${connectedWallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl border border-black/[0.06] text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50/50 shadow-2xs transition"
                  >
                    <span>View on Stellar.Expert</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-black/[0.1] rounded-2xl space-y-3 bg-gray-50/50">
                  <Wallet className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-600">No Stellar wallet connected yet.</p>
                  <button
                    type="button"
                    onClick={() => handleConnectWallet()}
                    disabled={isWalletConnecting}
                    className="bg-[#06372d] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#09473b] shadow-2xs"
                  >
                    {isWalletConnecting ? 'Connecting...' : 'Connect Stellar Wallet'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Subview: Edit Profile */
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

              {/* Photo + Change Photo Button */}
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
                  className="px-4 py-2 rounded-full border border-black/[0.08] text-xs font-semibold text-gray-800 hover:bg-gray-50 shadow-2xs transition flex items-center gap-2"
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

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Phone number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="renter@payarmove.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Wallet address (optional)</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="GC2R34KL...EKLT"
                    className="w-full px-4 py-2.5 rounded-xl border border-black/[0.06] bg-gray-50/70 text-xs font-mono text-gray-900 focus:outline-none focus:bg-white focus:border-[#06372d] shadow-2xs transition"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#06372d' }}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-2xs"
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
        </div>
      </div>
    </div>
  );
}
