import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Wallet, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function SignupView() {
  const {
    navigateTo,
    switchMode,
    signupUser,
    handleConnectWallet,
    completeWalletProfileSetup,
    connectedWallet,
    isWalletConnecting,
    mode,
  } = useApp();

  // Profile setup fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('RENTER'); // 'RENTER' | 'HOST'
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Email-only signup fallback fields
  const [useEmailOnly, setUseEmailOnly] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const hasWallet = Boolean(connectedWallet?.address);

  // Centralized intelligent router respecting URL mode & user intent
  const routeAfterSignup = (userRole) => {
    const normalizedRole = (userRole || 'renter').toLowerCase();
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const targetMode = urlParams?.get('mode') || mode || 'renter';

    if (role === 'HOST' || targetMode === 'host') {
      if (normalizedRole === 'host' || normalizedRole === 'admin') {
        switchMode('host');
        navigateTo('host-dashboard');
      } else {
        // Guide prospective host to the application form
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

  // 1. Connect wallet handler
  const handleConnect = async () => {
    setAuthError(null);
    try {
      const res = await handleConnectWallet();
      if (res?.success) {
        if (!res.isNewUser) {
          routeAfterSignup(res.user?.role);
        }
      } else {
        setAuthError(res?.error || 'Could not connect Stellar wallet.');
      }
    } catch (err) {
      setAuthError(err.message || 'Error connecting Stellar wallet.');
    }
  };

  // 2. Submit Wallet Profile Setup
  const handleWalletProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !acceptedTerms) {
      setShowValidationErrors(true);
      return;
    }
    if (!hasWallet) {
      setAuthError('Please connect your Stellar wallet first to set up your profile.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await completeWalletProfileSetup({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role,
      });

      if (res?.success) {
        routeAfterSignup(res.user?.role || role);
      } else {
        setAuthError('Failed to complete profile setup. Please check your information.');
      }
    } catch (err) {
      setAuthError(err.message || 'Error setting up wallet profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fallback: Submit Email/Password Registration
  const handleEmailSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password || !acceptedTerms) {
      setShowValidationErrors(true);
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await signupUser({
        email: email.trim(),
        username: fullName.trim().replace(/\s+/g, '_').toLowerCase(),
        password,
        role: role,
      });
      if (res?.success) {
        routeAfterSignup(role);
      } else {
        setAuthError(res?.error || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration service unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <span className="font-black text-gray-950 tracking-wider text-base">
            PAYAR MOVE
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f0faf6] text-[#06372d] px-2.5 py-1 rounded-full border border-emerald-500/15">
            Sign Up
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-gray-950 tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {useEmailOnly
              ? 'Register with your email and password.'
              : 'Connect your Stellar wallet and setup your decentralized profile.'}
          </p>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3 bg-red-50/70 border border-red-200/50 rounded-xl text-[11px] text-red-700 leading-relaxed">
            {authError}
          </div>
        )}

        {/* Mode 1: Stellar Wallet Profile Setup (Default & Recommended) */}
        {!useEmailOnly && (
          <div className="space-y-4">
            {/* Step 1: Wallet Connection Status */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Stellar Wallet
              </label>

              {hasWallet ? (
                <div className="bg-[#f0faf6] border border-emerald-500/15 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-950">
                          {connectedWallet.name || 'Freighter'} Connected
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] font-mono text-emerald-800">
                        {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isWalletConnecting}
                  className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 px-4 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 group"
                >
                  {isWalletConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting Stellar Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition" />
                      <span>Connect Wallet to Setup Profile</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Step 2: Profile Form */}
            <form onSubmit={handleWalletProfileSubmit} className="space-y-4 pt-1">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setShowValidationErrors(false);
                  }}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3.5 py-2.5 bg-gray-50/70 border rounded-xl text-xs transition shadow-2xs focus:bg-white focus:outline-none ${
                    showValidationErrors && !fullName
                      ? 'border-red-500/50 bg-red-50/20 text-red-900 focus:border-red-500'
                      : 'border-black/[0.06] focus:border-[#06372d]'
                  }`}
                />
                {showValidationErrors && !fullName && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Please enter your full name
                  </p>
                )}
              </div>

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
                  placeholder="e.g. user@example.com"
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

              {/* Phone Number */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 123 456"
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  How will you use Payar Move?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole('RENTER')}
                    className={`p-3 rounded-2xl border text-left transition shadow-2xs ${
                      role === 'RENTER'
                        ? 'border-[#06372d] bg-[#f0faf6]'
                        : 'border-black/[0.06] bg-white hover:bg-gray-50/70'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-950">Renter</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Rent vehicles with smart escrow
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('HOST')}
                    className={`p-3 rounded-2xl border text-left transition shadow-2xs ${
                      role === 'HOST'
                        ? 'border-[#06372d] bg-[#f0faf6]'
                        : 'border-black/[0.06] bg-white hover:bg-gray-50/70'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-950">Host</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      List cars & earn instant USDC
                    </p>
                  </button>
                </div>
              </div>

              {/* Accept Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded text-[#06372d] focus:ring-[#06372d] w-3.5 h-3.5 mt-0.5"
                  />
                  <span>
                    I accept the{' '}
                    <span className="font-semibold text-[#06372d] underline">
                      Terms & Conditions
                    </span>{' '}
                    and Escrow Smart Contract rules
                  </span>
                </label>
                {showValidationErrors && !acceptedTerms && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Please accept terms to continue
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Setting Up Profile...</span>
                  </>
                ) : (
                  <>
                    <span>{hasWallet ? 'Complete Profile & Sign In' : 'Connect Wallet & Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Mode 2: Traditional Email Registration */}
        {useEmailOnly && (
          <form onSubmit={handleEmailSignupSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full px-3.5 py-2.5 pr-10 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded text-[#06372d] focus:ring-[#06372d] w-3.5 h-3.5"
                />
                <span>Accept Terms & Conditions</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Toggle between Wallet Setup & Email Registration */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setUseEmailOnly(!useEmailOnly)}
            className="text-xs text-gray-500 hover:text-gray-800 underline font-medium"
          >
            {useEmailOnly
              ? '← Switch to Connect Stellar Wallet'
              : 'Or register with email and password'}
          </button>
        </div>

        {/* Bottom Link */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-black/[0.04]">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-[#06372d] font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
