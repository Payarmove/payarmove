import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import {
  Heart,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut,
  User,
  Clock,
  Settings,
  Shield,
  Coins,
  Wallet,
  Globe,
  Server,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Car,
} from 'lucide-react';

export default function Navbar() {
  const {
    currentView,
    navigateTo,
    mode,
    switchMode,
    user,
    savedVehicleIds,
    connectedWallet,
    handleConnectWallet,
    handleDisconnectWallet,
    fundConnectedWallet,
    isWalletConnecting,
    refreshBackendData,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const activeWalletAddress = connectedWallet?.address || user?.walletAddress;
  const hasWallet = Boolean(activeWalletAddress);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black/[0.03] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] transition">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap min-w-0 w-full">
          {/* Left: Brand / Logo */}
          <div className="flex items-center gap-3 sm:gap-8 shrink-0 min-w-0">
            <button
              onClick={() => {
                if (mode === 'admin') navigateTo('admin-overview');
                else if (mode === 'host') navigateTo('host-dashboard');
                else navigateTo('explore');
              }}
              className="flex items-center gap-2 text-left group shrink-0"
            >
              <span className="font-black text-lg sm:text-xl tracking-wider text-gray-950 uppercase group-hover:text-[#06372d] transition whitespace-nowrap">
                PAYAR MOVE
              </span>
              {mode === 'host' && (
                <span className="bg-gray-900 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Host
                </span>
              )}
              {mode === 'admin' && (
                <span className="bg-gray-900 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Admin
                </span>
              )}
            </button>

            {/* Center Navigation Links (Matches Explore, Saved, Account in Figma) */}
            {mode === 'renter' && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => navigateTo('explore')}
                  className={`py-1 transition relative ${
                    currentView === 'explore' || currentView === 'search' || currentView === 'vehicle-detail'
                      ? 'text-gray-950 font-bold after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-[#06372d]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Explore
                </button>

                <button
                  onClick={() => navigateTo('saved')}
                  className={`py-1 transition relative ${
                    currentView === 'saved'
                      ? 'text-gray-950 font-bold after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-[#06372d]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Saved {savedVehicleIds.length > 0 && `(${savedVehicleIds.length})`}
                </button>

                <button
                  onClick={() => navigateTo('renter-profile')}
                  className={`py-1 transition relative ${
                    currentView === 'renter-profile' || currentView === 'my-rentals' || currentView === 'rental-detail'
                      ? 'text-gray-950 font-bold after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-[#06372d]'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Account
                </button>
              </nav>
            )}

            {/* Host Mode Top Nav */}
            {mode === 'host' && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => navigateTo('host-dashboard')}
                  className={`py-1 transition ${
                    currentView === 'host-dashboard' ? 'text-gray-950 font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigateTo('host-payments')}
                  className={`py-1 transition ${
                    currentView === 'host-payments' ? 'text-gray-950 font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Rental payments
                </button>
                <button
                  onClick={() => navigateTo('host-vehicles')}
                  className={`py-1 transition ${
                    currentView === 'host-vehicles' || currentView === 'host-add-vehicle' || currentView === 'host-vehicle-manage'
                      ? 'text-gray-950 font-bold'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  My vehicles
                </button>
                <button
                  onClick={() => navigateTo('host-account')}
                  className={`py-1 transition ${
                    currentView === 'host-account' ? 'text-gray-950 font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Account
                </button>
              </nav>
            )}

            {/* Admin Mode Top Nav */}
            {mode === 'admin' && (
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => navigateTo('admin-overview')}
                  className={`py-1 transition ${
                    currentView === 'admin-overview' ? 'text-gray-950 font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => navigateTo('admin-payments')}
                  className={`py-1 transition ${
                    currentView === 'admin-payments' || currentView === 'admin-payment-detail'
                      ? 'text-gray-950 font-bold'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Rental payments
                </button>
                <button
                  onClick={() => navigateTo('admin-ledger')}
                  className={`py-1 transition ${
                    currentView === 'admin-ledger' ? 'text-gray-950 font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Host payouts
                </button>
              </nav>
            )}
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
            {/* 1. Stellar Wallets Kit Button / Connected Pill */}
            {hasWallet ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold text-emerald-950 transition shadow-xs hover:shadow-sm whitespace-nowrap shrink-0"
                  title={activeWalletAddress}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-mono text-[11px] font-bold text-emerald-950">
                    {connectedWallet?.usdc != null
                      ? `${Number(connectedWallet.usdc).toFixed(2)} USDC`
                      : (user?.balanceUSDC != null
                        ? `${Number(user.balanceUSDC).toFixed(2)} USDC`
                        : (connectedWallet?.balance?.includes('USDC') ? connectedWallet.balance : '0.00 USDC'))}
                  </span>
                  <ChevronDown className="w-3 h-3 text-emerald-600 shrink-0" />
                </button>

                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04] p-3.5 z-50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.04]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#06372d] text-white flex items-center justify-center font-black text-[10px]">
                          ★
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{connectedWallet?.name || 'Freighter Wallet'}</p>
                          <p className="text-[10px] text-gray-400">Stellar Testnet</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>

                    <div className="py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-400">On-Chain Balance</span>
                        <span className="text-xs font-bold text-gray-900">{connectedWallet?.balance || user?.balanceFormatted || '0.00 USDC'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 bg-gray-50/80 p-2 rounded-xl border border-black/[0.04] shadow-2xs">
                        <span className="text-[10px] font-mono text-gray-600 truncate mr-2">
                          {activeWalletAddress}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeWalletAddress);
                            setCopiedAddress(true);
                            setTimeout(() => setCopiedAddress(false), 2000);
                          }}
                          className="text-gray-500 hover:text-black p-1 transition"
                          title="Copy public address"
                        >
                          {copiedAddress ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Friendbot Funding Button if unfunded or user wants testnet lumens */}
                      <button
                        type="button"
                        onClick={async () => {
                          setIsFunding(true);
                          await fundConnectedWallet();
                          setIsFunding(false);
                        }}
                        disabled={isFunding}
                        className="w-full mt-2.5 bg-[#f0faf6] hover:bg-emerald-100/70 text-emerald-800 border border-emerald-500/15 py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                      >
                        {isFunding ? (
                          <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>⚡</span>
                        )}
                        <span>{isFunding ? 'Funding from Friendbot...' : 'Fund via Friendbot (+10,000 XLM)'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] text-xs">
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${activeWalletAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 font-medium text-[11px]"
                      >
                        <span>Stellar.Expert</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          handleDisconnectWallet();
                          setWalletMenuOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700 font-medium text-[11px] hover:underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Connect button visible on desktop (sm: and up) */
              <button
                onClick={() => handleConnectWallet()}
                disabled={isWalletConnecting}
                className="hidden sm:inline-flex items-center gap-2 bg-white hover:bg-gray-50/80 border border-black/[0.05] px-3.5 py-1.5 rounded-full text-xs font-semibold text-gray-800 shadow-xs hover:shadow-sm transition whitespace-nowrap shrink-0"
                title="Connect via Stellar Wallets Kit"
              >
                {isWalletConnecting ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#06372d] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                )}
                <span>{isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {/* 2. Login Button: Prominently shown on mobile instead of just connect, as well as on desktop */}
            {!user?.isLoggedIn && (
              <button
                onClick={() => navigateTo('login')}
                className="inline-flex items-center justify-center bg-[#06372d] hover:bg-[#09473b] text-white px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full font-bold text-xs transition shadow-xs hover:shadow-sm whitespace-nowrap shrink-0"
              >
                Log in
              </button>
            )}


            {/* Host Role: 'Hosting ▾' Dropdown Pill */}
            {user?.isLoggedIn && user?.role === 'host' && (
              <div className="relative">
                <button
                  onClick={() => setModeMenuOpen(!modeMenuOpen)}
                  className="flex items-center gap-2 bg-[#06372d] text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#09473b] transition shadow-xs"
                >
                  <span>{mode === 'host' ? 'Hosting' : 'Renting'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {modeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04] py-1.5 z-50 animate-in fade-in">
                    <button
                      onClick={() => {
                        setModeMenuOpen(false);
                        switchMode('renter');
                        navigateTo('explore');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                    >
                      <span>Renting</span>
                      {mode === 'renter' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => {
                        setModeMenuOpen(false);
                        switchMode('host');
                        navigateTo('host-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                    >
                      <span>Hosting</span>
                      {mode === 'host' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Admin Role: 'Admin ▾' Pill */}
            {user?.isLoggedIn && user?.role === 'admin' && (
              <div className="relative">
                <button
                  onClick={() => setModeMenuOpen(!modeMenuOpen)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-black transition shadow-xs"
                >
                  <span className="capitalize">{mode}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {modeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04] py-1.5 z-50 animate-in fade-in">
                    <button
                      onClick={() => {
                        setModeMenuOpen(false);
                        switchMode('admin');
                        navigateTo('admin-overview');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                    >
                      <span>Admin Portal</span>
                      {mode === 'admin' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => {
                        setModeMenuOpen(false);
                        switchMode('host');
                        navigateTo('host-dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                    >
                      <span>Hosting</span>
                      {mode === 'host' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                    <button
                      onClick={() => {
                        setModeMenuOpen(false);
                        switchMode('renter');
                        navigateTo('explore');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center justify-between"
                    >
                      <span>Renting</span>
                      {mode === 'renter' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Profile Avatar with Name */}
            {user?.isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1 px-1.5 sm:px-2 rounded-full hover:bg-gray-50/80 transition border border-black/[0.05] shadow-xs"
                >
                  <img
                    src={user.avatar || '/default-avatar.svg'}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-gray-800">
                    {user.name ? user.name.split(' ')[0] : (user.username || 'Account')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(0,0,0,0.08)] border border-black/[0.04] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-black/[0.04]">
                      <p className="text-xs font-bold text-gray-900">{user.name || user.username || 'User Account'}</p>
                      <p className="text-[11px] text-gray-500">{user.email}</p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block mt-1">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigateTo('renter-profile');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Profile & Account</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigateTo('my-rentals');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>My Rentals</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigateTo('saved');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Saved Cars ({savedVehicleIds.length})</span>
                      </button>

                      <div className="border-t border-black/[0.04] my-1 pt-1">
                        {(user.role === 'host' || user.role === 'admin') && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              switchMode('host');
                              navigateTo('host-dashboard');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
                          >
                            <Settings className="w-4 h-4 text-gray-500" />
                            <span>Host Dashboard</span>
                          </button>
                        )}

                        {user.role === 'admin' && (
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              switchMode('admin');
                              navigateTo('admin-overview');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700 font-medium"
                          >
                            <Shield className="w-4 h-4 text-gray-500" />
                            <span>Admin Portal</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-black/[0.04] pt-1 text-xs">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleDisconnectWallet();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect & Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
