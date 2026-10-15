import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordView() {
  const { navigateTo } = useApp();
  const [step, setStep] = useState(1); // 1: Input email, 2: Sent notification, 3: Create new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleCreateNewPassword = (e) => {
    e.preventDefault();
    navigateTo('login');
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md pb-6 text-center">
        <button
          onClick={() => navigateTo('explore')}
          className="text-base font-black tracking-wider text-gray-950 uppercase"
        >
          PAYAR MOVE
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-black/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-6">
          {/* STEP 1: RESET YOUR PASSWORD */}
          {step === 1 && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs text-gray-500">
                  Input your email and we will send reset instructions
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50/70 border border-black/[0.06] text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-sm"
              >
                Reset password
              </button>
            </form>
          )}

          {/* STEP 2: INSTRUCTIONS SENT */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs text-gray-500">
                  Input your email and we will send reset instructions
                </p>
              </div>

              {/* Success Notice Box (Matches Forgot password.png) */}
              <div className="p-3.5 rounded-xl bg-[#f0faf6] border border-emerald-500/15 text-[11px] text-emerald-900 leading-relaxed shadow-2xs">
                If an account exists with your email address, <strong>{email || 'example@gmail.com'}</strong>, we just sent you an email with instructions to reset your password.
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ backgroundColor: '#06372d' }}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-sm"
                >
                  Continue to Set New Password
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="w-full py-2 text-xs font-semibold text-gray-600 hover:text-black"
                >
                  Return to Log in
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CREATE A NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleCreateNewPassword} className="space-y-5">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Create a new password
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Use at least 8 characters with a mix of letters, numbers, and symbols.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">New password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50/70 border border-black/[0.06] text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Confirm password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50/70 border border-black/[0.06] text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-sm"
              >
                Create new password
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-black/[0.04]">
            <button
              onClick={() => navigateTo('login')}
              className="text-xs font-semibold text-gray-500 hover:text-black inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Log in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
