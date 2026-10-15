import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Wallet, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginView() {
  const {
    navigateTo,
    switchMode,
    loginUser,
    handleConnectWallet,
    completeWalletProfileSetup,
    connectedWallet,
    isWalletConnecting,
    mode,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // If connected wallet has no profile yet, show inline profile setup
  const [unregisteredAddress, setUnregisteredAddress] = useState(null);
  const [setupName, setSetupName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupRole, setSetupRole] = useState('RENTER');
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Centralized intelligent router respecting URL mode & user intent
  const routeAfterLogin = (userRole) => {
    const normalizedRole = (userRole || 'renter').toLowerCase();
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const targetMode = urlParams?.get('mode') || mode || 'renter';

    if (setupRole === 'HOST' || targetMode === 'host') {
      if (normalizedRole === 'host' || normalizedRole === 'admin') {
        switchMode('host');
        navigateTo('host-dashboard');
      } else {
        navigateTo('become-host');
      }
    } else if (targetMode === 'admin' && normalizedRole === 'admin') {
      switchMode('admin');
      navigateTo('admin-overview');
    } else {
      switchMode('renter');
      navigateTo('explore');
    }
  };

  // 1. Handle Connect Wallet to Sign In
  const handleWalletSignIn = async () => {
    setAuthError(null);
    try {
      const res = await handleConnectWallet();
      if (res?.success) {
        if (res.isNewUser) {
          // Unregistered wallet: prompt user to set up profile
          setUnregisteredAddress(res.address);
        } else {
          routeAfterLogin(res.user?.role);
        }
      } else {
        setAuthError(res?.error || 'Could not connect Stellar wallet. Please try again.');
      }
    } catch (err) {
      setAuthError(err.message || 'Error connecting to Stellar wallet.');
    }
  };

  // 2. Handle Profile Setup for newly connected wallet
  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    if (!setupName.trim() || !setupEmail.trim()) {
      setAuthError('Please provide your name and email to setup your profile.');
      return;
    }
    setIsSettingUp(true);
    setAuthError(null);
    try {
      const res = await completeWalletProfileSetup({
        name: setupName.trim(),
        email: setupEmail.trim(),
        phone: setupPhone.trim(),
        role: setupRole,
      });
      if (res?.success) {
        routeAfterLogin(res.user?.role || setupRole);
      } else {
        setAuthError('Could not save profile. Please verify your information.');
      }
    } catch (err) {
      setAuthError(err.message || 'Profile setup error.');
    } finally {
      setIsSettingUp(false);
    }
  };

  // 3. Handle Standard Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setShowValidationErrors(true);
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await loginUser(email, password);
      if (res?.success) {
        routeAfterLogin(res.user?.role);
      } else {
        setAuthError(res?.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setAuthError(err.message || 'Unable to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-black/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <span className="font-black text-gray-950 tracking-wider text-base">
            PAYAR MOVE
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f0faf6] text-[#06372d] px-2.5 py-1 rounded-full border border-emerald-500/15">
            Decentralized
          </span>
        </div>

        {/* Dynamic Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-950 tracking-tight">
            {unregisteredAddress ? 'Setup Profile' : 'Sign In'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {unregisteredAddress
              ? 'Complete your profile to link with your Stellar wallet.'
              : 'Connect your wallet for instant 1-click authentication.'}
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div className="p-3 bg-red-50/70 border border-red-200/50 rounded-xl text-[11px] text-red-700 leading-relaxed">
            {authError}
          </div>
        )}

        {/* If Wallet is connected but needs profile setup */}
        {unregisteredAddress ? (
          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div className="bg-[#f0faf6] border border-emerald-500/15 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-emerald-950">Wallet Connected</p>
                <p className="text-[10px] font-mono text-emerald-800 truncate">
                  {unregisteredAddress}
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder="e.g. Jane Doe"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={setupEmail}
                onChange={(e) => setSetupEmail(e.target.value)}
                placeholder="e.g. jane@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={setupPhone}
                onChange={(e) => setSetupPhone(e.target.value)}
                placeholder="+254 700 123 456"
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSetupRole('RENTER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    setupRole === 'RENTER'
                      ? 'bg-[#06372d] text-white border-[#06372d] shadow-sm'
                      : 'bg-white text-gray-700 border-black/[0.06] hover:bg-gray-50 shadow-2xs'
                  }`}
                >
                  Renter
                </button>
                <button
                  type="button"
                  onClick={() => setSetupRole('HOST')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    setupRole === 'HOST'
                      ? 'bg-[#06372d] text-white border-[#06372d] shadow-sm'
                      : 'bg-white text-gray-700 border-black/[0.06] hover:bg-gray-50 shadow-2xs'
                  }`}
                >
                  Host
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSettingUp}
              className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isSettingUp ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setUnregisteredAddress(null)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 pt-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            {/* Primary Action: Connect Wallet to Sign In */}
            <div>
              <button
                type="button"
                onClick={handleWalletSignIn}
                disabled={isWalletConnecting}
                className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2.5 group"
              >
                {isWalletConnecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition" />
                )}
                <span>
                  {isWalletConnecting
                    ? 'Connecting Stellar Wallet...'
                    : 'Connect Wallet to Sign In'}
                </span>
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Freighter, Albedo, xBull & Stellar Wallets Kit</span>
              </div>
            </div>

            {/* Divider 'or' */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.06]" />
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-400">
                or sign in with email
              </span>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setShowValidationErrors(false);
                  }}
                  placeholder="Enter your email address"
                  className={`w-full px-3.5 py-2.5 bg-gray-50/70 border rounded-xl text-xs transition shadow-2xs focus:bg-white focus:outline-none ${
                    showValidationErrors && !email
                      ? 'border-red-500/50 bg-red-50/20 text-red-900 focus:border-red-500'
                      : 'border-black/[0.06] focus:border-[#06372d]'
                  }`}
                />
                {showValidationErrors && !email && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Please enter your email address
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setShowValidationErrors(false);
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-3.5 py-2.5 pr-10 bg-gray-50/70 border rounded-xl text-xs transition shadow-2xs focus:bg-white focus:outline-none ${
                      showValidationErrors && !password
                        ? 'border-red-500/50 bg-red-50/20 text-red-900 focus:border-red-500'
                        : 'border-black/[0.06] focus:border-[#06372d]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {showValidationErrors && !password && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Please enter your password
                  </p>
                )}
              </div>

              {/* Remember me & Forgot password? */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#06372d] focus:ring-[#06372d] w-3.5 h-3.5"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigateTo('forgot-password')}
                  className="text-[#06372d] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In with Email</span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Bottom Link */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-black/[0.04]">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigateTo('signup')}
            className="text-[#06372d] font-bold hover:underline"
          >
            Connect Wallet & Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
