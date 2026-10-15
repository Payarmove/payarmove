import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, Wallet, ArrowRight } from 'lucide-react';

export default function AdminSignInView() {
  const { navigateTo, switchMode, loginUser, handleConnectWallet, isWalletConnecting } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Submit admin credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser(email.trim(), password);
      if (res?.success) {
        const isSuper = Boolean(
          res.user?.is_superuser ||
          res.user?.is_staff ||
          (res.user?.role && res.user.role.toUpperCase() === 'ADMIN')
        );
        if (isSuper) {
          switchMode('admin');
          navigateTo('admin-overview');
        } else {
          setError('Access denied: This account does not have superuser or platform administrator privileges.');
        }
      } else {
        setError(res?.error || 'Invalid administrator or superuser credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Connect Admin Wallet
  const handleAdminWalletConnect = async () => {
    setError(null);
    try {
      const res = await handleConnectWallet();
      if (res?.success) {
        if (res.user?.role?.toLowerCase() === 'admin' || res.user?.is_superuser || res.user?.is_staff) {
          switchMode('admin');
          navigateTo('admin-overview');
        } else {
          setError('Connected wallet is not authorized for Admin access.');
        }
      } else {
        setError(res?.error || 'Failed to connect Stellar wallet.');
      }
    } catch (err) {
      setError(err.message || 'Error during wallet authentication.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-black/[0.04] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900 tracking-wider text-base">PAYAR MOVE</span>
            <span className="bg-black text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Shield className="w-4 h-4 text-emerald-800" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-950">Administrator Portal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in with authorized superuser or administrator credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50/70 border border-red-200/50 rounded-xl text-[11px] text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        {/* Connect Wallet as Admin */}
        <button
          type="button"
          onClick={handleAdminWalletConnect}
          disabled={isWalletConnecting}
          className="w-full bg-gray-950 hover:bg-black text-white py-3 px-4 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
        >
          {isWalletConnecting ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 text-emerald-400" />
          )}
          <span>{isWalletConnecting ? 'Verifying Wallet...' : 'Connect Admin Wallet'}</span>
        </button>

        <div className="relative my-2 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.06]" />
          </div>
          <span className="relative bg-white px-3 text-xs text-gray-400">or use superuser login</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Superuser Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@payarmove.com or admin"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-2 border-t border-black/[0.04]">
            <button
              type="button"
              onClick={() => {
                switchMode('renter');
                navigateTo('explore');
              }}
              className="text-xs text-gray-500 hover:text-black font-medium"
            >
              ← Return to Main Platform
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
