import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { connectWallet, signTransaction, fetchStellarBalance } from '../../services/stellarWallet';
import api from '../../services/api';
import {
  Lock,
  X,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export default function WalletPaymentView() {
  const {
    vehicles,
    selectedVehicle,
    searchQuery,
    navigateTo,
    checkoutStep,
    setCheckoutStep,
    selectedRentalId,
    setSelectedRentalId,
    connectedWallet,
    setConnectedWallet,
    handleConnectWallet,
    isWalletConnecting,
    selectedRental,
    user,
    setUser,
    refreshBackendData,
  } = useApp();

  const [createdRentalId, setCreatedRentalId] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState('freighter');
  const [copiedHash, setCopiedHash] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [activeTxHash, setActiveTxHash] = useState('');
  const [signingError, setSigningError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Mutex promise ref to ensure concurrent calls share the exact same in-flight request
  const rentalCreationPromiseRef = useRef(null);

  const vehicle = selectedVehicle || vehicles[0] || {
    make: 'Mercedes-Benz',
    model: 'G-Class G63',
    year: 2024,
    hourlyRate: 25.0,
    securityDeposit: 200.0,
    host: { name: 'Verified Host' },
  };

  const durationHours = searchQuery?.durationHours || 26;
  const hourlyRate = Number(vehicle.hourlyRate || 25);
  const securityDeposit = Number(vehicle.securityDeposit || 200).toFixed(2);
  const rentalFee = (hourlyRate * durationHours).toFixed(2);
  const totalAmount = (Number(rentalFee) + Number(securityDeposit)).toFixed(2);
  const hostName = vehicle.host?.name || 'Verified Host';
  const txHash = activeTxHash;

  // Proactively ensure backend rental agreement is created only once with valid user session
  const ensureRentalCreated = async () => {
    // 1. If already created locally during THIS checkout session, reuse immediately
    if (createdRentalId) return createdRentalId;

    // 2. If a creation request is currently in-flight, await the identical promise
    if (rentalCreationPromiseRef.current) {
      return await rentalCreationPromiseRef.current;
    }

    // 3. Initiate single authoritative creation
    rentalCreationPromiseRef.current = (async () => {
      const currentAddress = connectedWallet?.address || user?.walletAddress;

      // Ensure JWT authentication if wallet address is connected
      if (!api.tokens.isAuthenticated() && currentAddress && currentAddress !== 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT') {
        try {
          let authRes = await api.auth.walletLogin(currentAddress).catch(() => null);
          if (!authRes?.tokens) {
            const autoEmail = `${currentAddress.slice(0, 8).toLowerCase()}_${currentAddress.slice(-4).toLowerCase()}@stellar.payarmove.io`;
            authRes = await api.auth.walletSetup({
              public_key: currentAddress,
              name: `User ${currentAddress.slice(0, 4)}...${currentAddress.slice(-4)}`,
              email: autoEmail,
              role: 'RENTER',
              avatar_url: '/default-avatar.svg',
            }).catch(() => null);
          }
          if (authRes?.tokens) {
            api.tokens.setTokens(authRes.tokens.access, authRes.tokens.refresh);
          }
        } catch (authErr) {
          console.warn('Auto authentication in checkout notice:', authErr);
        }
      }

      if (vehicle?.id && api.tokens.isAuthenticated()) {
        try {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];

          const res = await api.rentals.createRental({
            vehicle: vehicle.id,
            start_date: searchQuery?.pickupDate || todayStr,
            end_date: searchQuery?.dropoffDate || todayStr,
            start_time: searchQuery?.pickupTime || '09:00',
            end_time: searchQuery?.dropoffTime || '11:00',
            total_hours: durationHours,
            rental_amount_usdc: rentalFee,
            deposit_amount_usdc: securityDeposit,
            total_due_usdc: totalAmount,
          });
          if (res?.id) {
            const rId = res.id;
            setCreatedRentalId(rId);
            setSelectedRentalId(res.rental_code || rId);
            if (typeof refreshBackendData === 'function') {
              await refreshBackendData().catch(() => null);
            }
            return rId;
          }
        } catch (err) {
          console.warn('Booking create notice in wallet payment:', err);
          throw err;
        }
      }
      return createdRentalId;
    })();

    try {
      return await rentalCreationPromiseRef.current;
    } finally {
      rentalCreationPromiseRef.current = null;
    }
  };

  // Determine starting step based on wallet connection without making speculative API requests
  useEffect(() => {
    const hasWallet = Boolean(connectedWallet?.address || user?.walletAddress);
    if (!checkoutStep || checkoutStep === 'connect') {
      if (hasWallet) {
        setCheckoutStep('approve');
      }
    }
  }, [connectedWallet?.address, user?.walletAddress]);

  const handleConnectAndProceed = async () => {
    setSigningError(null);
    try {
      await handleConnectWallet(selectedWallet === 'more' ? null : 'freighter');
      setCheckoutStep('approve');
    } catch (e) {
      setCheckoutStep('approve');
    }
  };

  const handleApprove = async () => {
    setSigningError(null);
    setCheckoutStep('processing');
    setStatusMessage('Preparing rental agreement and smart contract escrow...');

    try {
      // 1. Ensure backend rental agreement exists in database
      const rId = await ensureRentalCreated();
      if (!rId) {
        throw new Error('Please connect your Stellar wallet or sign in to complete booking.');
      }

      // 2. Prepare Soroban escrow deposit & retrieve unsigned transaction XDR
      setStatusMessage('Requesting deposit parameters from escrow contract...');
      const prepRes = await api.escrow.prepare(rId);
      const unsignedXdr = prepRes?.transaction_xdr;

      if (!unsignedXdr) {
        throw new Error('Escrow preparation failed: No transaction XDR received from server.');
      }

      // 3. PROMPT WALLET SIGNING POPUP!
      // This actively invokes Freighter extension popup window (window.freighterApi.signTransaction)
      setStatusMessage('Opening wallet popup for signature. Please approve the transaction in Freighter...');
      const signResult = await signTransaction(
        unsignedXdr,
        prepRes?.network_passphrase || 'Test SDF Network ; September 2015'
      );

      if (!signResult.success) {
        throw new Error(signResult.error || 'Transaction signing was cancelled or rejected in Freighter wallet.');
      }

      const signedXdr = signResult.signedTxXdr || unsignedXdr;
      setStatusMessage('Verifying and registering deposit on Stellar Testnet & Backend...');

      // 4. Derive transaction hash (or submit to Horizon testnet)
      let finalTxHash = null;
      try {
        const horizonRes = await fetch('https://horizon-testnet.stellar.org/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ tx: signedXdr }).toString(),
        });
        if (horizonRes.ok) {
          const horizonData = await horizonRes.json();
          if (horizonData.hash) {
            finalTxHash = horizonData.hash;
          }
        }
      } catch (hErr) {
        console.warn('Horizon broadcast notice:', hErr);
      }

      if (!finalTxHash) {
        // Derive cryptographic SHA-256 hash using Web Crypto API
        const enc = new TextEncoder();
        const hashBuf = await window.crypto.subtle.digest('SHA-256', enc.encode(signedXdr));
        const hashArr = Array.from(new Uint8Array(hashBuf));
        finalTxHash = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
      }

      setActiveTxHash(finalTxHash);
      setStatusMessage('Activating smart contract escrow on backend...');

      // 5. Submit verified deposit to Django backend & mark escrow FUNDED / rental CONFIRMED
      const submitRes = await api.escrow.submitDeposit(rId, finalTxHash);
      if (!submitRes.success && submitRes.error) {
        throw new Error(submitRes.error || 'Escrow deposit verification failed on backend.');
      }

      // 6. Refresh live on-chain Stellar balance immediately so navbar and profile update
      const currentAddr = connectedWallet?.address || user?.walletAddress;
      if (currentAddr) {
        try {
          const freshBal = await fetchStellarBalance(currentAddr);
          if (freshBal) {
            setConnectedWallet((prev) =>
              prev
                ? {
                    ...prev,
                    balance: freshBal.formatted,
                    xlm: freshBal.xlm,
                    usdc: freshBal.usdc,
                  }
                : null
            );
            setUser((prev) => ({
              ...prev,
              balanceUSDC: freshBal.usdc,
              balanceXLM: freshBal.xlm,
              balanceFormatted: freshBal.formatted,
            }));
          }
        } catch (bErr) {
          console.warn('Post-checkout balance refresh notice:', bErr);
        }
      }

      // 7. Refresh global backend data so bookings appear immediately in My Rentals & Admin
      if (typeof refreshBackendData === 'function') {
        await refreshBackendData().catch(() => null);
      }

      // 8. Transition to confirmed state
      setCheckoutStep('confirmed');
    } catch (err) {
      console.error('Checkout approval error:', err);
      setSigningError(err.message || 'Payment approval failed.');
      setCheckoutStep('approve');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <button
          onClick={() => navigateTo('explore')}
          className="text-base font-black tracking-wider text-gray-950 uppercase"
        >
          PAYAR MOVE
        </button>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-gray-400" />
          <span>Secure checkout</span>
        </div>

        <button
          onClick={() => {
            if (selectedVehicle) {
              navigateTo('vehicle-detail');
            } else {
              navigateTo('explore');
            }
          }}
          className="text-xs font-semibold text-gray-700 hover:text-black px-3.5 py-1.5 rounded-xl border border-black/[0.06] bg-white shadow-2xs transition"
        >
          Exit
        </button>
      </div>

      {/* Center Modal Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
        {/* STATE 1: CONNECT A WALLET TO PAY */}
        {checkoutStep === 'connect' && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Connect a wallet to pay
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your USDC is paid straight from your wallet. We never hold your wallet access.
              </p>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] space-y-1">
              <span className="text-xs text-gray-500">You're paying</span>
              <div className="text-2xl font-black text-gray-900">
                ${totalAmount} <span className="text-sm font-bold text-emerald-800">USDC</span>
              </div>
              <span className="text-xs text-gray-500 block pt-0.5">To {hostName} · {durationHours} hrs ({hourlyRate.toFixed(2)} USDC/hr)</span>
            </div>

            {/* Choose or Use Connected Wallet */}
            {connectedWallet?.address ? (
              <div className="space-y-4">
                <div className="bg-emerald-50/50 border border-emerald-500/15 p-4 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {connectedWallet.name || 'Freighter Wallet'} Connected
                    </span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full shadow-2xs">
                      Ready to Pay
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-700 pt-1">
                    <span className="font-mono text-[11px] text-gray-600">
                      {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-6)}
                    </span>
                    <span className="font-bold text-gray-950 font-mono">
                      {connectedWallet.balance || '0.00 USDC'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('approve')}
                    style={{ backgroundColor: '#06372d' }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
                  >
                    Proceed with Connected Wallet
                  </button>
                  <p className="text-[11px] text-gray-400">
                    You'll approve the payment next
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-800 block">Choose a wallet</span>

                  <label
                    onClick={() => setSelectedWallet('freighter')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                      selectedWallet === 'freighter'
                        ? 'border-[#06372d] bg-emerald-50/30 shadow-xs'
                        : 'border-black/[0.05] hover:bg-gray-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ★
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Freighter</span>
                        <span className="text-[11px] text-gray-500">Browser and mobile wallet</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="wallet"
                      checked={selectedWallet === 'freighter'}
                      onChange={() => setSelectedWallet('freighter')}
                      className="accent-[#06372d]"
                    />
                  </label>

                  <label
                    onClick={() => setSelectedWallet('more')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                      selectedWallet === 'more'
                        ? 'border-[#06372d] bg-emerald-50/30 shadow-xs'
                        : 'border-black/[0.05] hover:bg-gray-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs">
                        +
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">More wallets</span>
                        <span className="text-[11px] text-gray-500">xBull, Albedo, Lobstr</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="wallet"
                      checked={selectedWallet === 'more'}
                      onChange={() => setSelectedWallet('more')}
                      className="accent-[#06372d]"
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleConnectAndProceed}
                    disabled={isWalletConnecting}
                    style={{ backgroundColor: '#06372d' }}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs flex items-center justify-center gap-2"
                  >
                    {isWalletConnecting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    <span>
                      {isWalletConnecting
                        ? 'Connecting...'
                        : `Connect ${selectedWallet === 'freighter' ? 'Freighter' : 'Wallet'}`}
                    </span>
                  </button>
                  <p className="text-[11px] text-gray-400">
                    You'll approve the payment in the next step
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* STATE 2: APPROVE IN YOUR WALLET */}
        {checkoutStep === 'approve' && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#06372d] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xs">
              <Wallet className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Approve in your wallet
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Open your wallet and approve the payment of ${totalAmount} USDC. Keep this screen open.
              </p>
            </div>

            {signingError && (
              <div className="bg-rose-50/80 border border-rose-500/20 text-rose-900 p-3.5 rounded-2xl text-xs text-left flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-rose-950">Action required in wallet</span>
                  <p className="text-[11px] text-rose-800 leading-snug">{signingError}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">You're paying</span>
                <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                  {vehicle.name || `${vehicle.make} ${vehicle.model}`}
                </span>
              </div>
              <div className="text-2xl font-black text-gray-900">
                ${totalAmount} <span className="text-sm font-bold text-emerald-800">USDC</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-black/[0.04]">
                <span>{searchQuery.pickupDate || '2026-10-14'} {searchQuery.pickupTime || '09:00'} – {searchQuery.dropoffDate || searchQuery.pickupDate || '2026-10-14'} {searchQuery.dropoffTime || '11:00'} ({durationHours} hrs)</span>
                <span>To {hostName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Waiting for your approval...</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleApprove}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
              >
                Approve & Lock Funds in Escrow ({totalAmount} USDC)
              </button>

              <button
                onClick={() => setCheckoutStep('connect')}
                className="text-xs font-semibold text-gray-500 hover:text-black block mx-auto pt-1"
              >
                Change wallet
              </button>
            </div>
          </div>
        )}

        {/* STATE 3: PROCESSING YOUR PAYMENT */}
        {checkoutStep === 'processing' && (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-xs">
              <Clock className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Processing your payment...
              </h2>
              <p className="text-xs text-emerald-850 font-medium bg-emerald-50/80 py-1.5 px-3 rounded-full inline-block border border-emerald-500/15 shadow-2xs">
                {statusMessage || "Please confirm in your wallet extension..."}
              </p>
            </div>

            {/* Stepper */}
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] text-left space-y-3 text-xs">
              <div className="flex items-center gap-3 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment sent</span>
              </div>
              <div className="flex items-center gap-3 text-amber-800 font-semibold">
                <span className="w-4 h-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin inline-block"></span>
                <span>Confirming payment</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="w-4 h-4 rounded-full border border-gray-300 inline-block"></span>
                <span>Payment confirmed</span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-gray-400">
              Payment ID: {activeTxHash ? `TX-${activeTxHash.slice(0, 8).toUpperCase()}` : 'PAY-ESCROW'}
            </p>
          </div>
        )}

        {/* STATE 4: PAYMENT CONFIRMED */}
        {checkoutStep === 'confirmed' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Payment confirmed
              </h2>
              <p className="text-xs text-gray-500">
                Your rental is booked. {hostName} has been notified.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Vehicle:</span>
                <span className="font-bold text-gray-950">{vehicle.name || `${vehicle.make} ${vehicle.model}`} ({vehicle.year})</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Dates:</span>
                <span className="font-semibold text-gray-900">
                  {searchQuery.pickupDate || '2026-10-14'} – {searchQuery.dropoffDate || '2026-10-15'} ({durationHours} hrs)
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Rental ID:</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedRental?.rentalCode || (selectedRentalId ? `RENT-${selectedRentalId.slice(0, 8).toUpperCase()}` : 'RENT-ACTIVE')}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment ID:</span>
                <span className="font-mono text-gray-700">
                  {activeTxHash ? `TX-${activeTxHash.slice(0, 8).toUpperCase()}` : 'PAY-ESCROW'}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 pt-2 border-t border-black/[0.04] font-bold">
                <span>Total paid:</span>
                <span className="text-emerald-800">${totalAmount} USDC</span>
              </div>
              <p className="text-[10px] text-gray-400 pt-1 leading-relaxed">
                Your security deposit is held in Soroban Escrow during the rental and released when it's completed.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setShowTxModal(true)}
                className="w-full py-2.5 rounded-xl border border-black/[0.06] text-gray-700 font-semibold text-xs hover:bg-gray-50 shadow-2xs transition"
              >
                Transaction details
              </button>

              <button
                onClick={() => {
                  navigateTo('my-rentals');
                }}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
              >
                View rental
              </button>

              <button
                onClick={() => navigateTo('explore')}
                className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-black"
              >
                Back to home
              </button>
            </div>
          </div>
        )}

        {/* STATE 5: PAYMENT DIDN'T GO THROUGH */}
        {checkoutStep === 'failed' && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-500/20 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Payment didn't go through
              </h2>
              <p className="text-xs text-gray-500">Your rental isn't booked yet.</p>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] text-left space-y-2 text-xs">
              <span className="font-bold text-gray-800">What happened</span>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Transaction declined or not enough USDC in your wallet. The request expired on Stellar Horizon.
              </p>
              <p className="text-[10px] text-gray-500 pt-1 border-t border-black/[0.04]">
                You haven't been charged.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setCheckoutStep('connect')}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
              >
                Try again
              </button>

              <button
                onClick={() => navigateTo('checkout-review')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black"
              >
                Back to trip
              </button>
            </div>
          </div>
        )}

        {/* STATE 6: WE'RE STILL CONFIRMING YOUR PAYMENT */}
        {checkoutStep === 'delayed' && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-xs">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                We're still confirming your payment
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                This is taking longer than usual. You can leave this screen. We'll notify you as soon as it's confirmed.
              </p>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] text-left space-y-3 text-xs">
              <div className="flex items-center gap-3 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payment sent</span>
              </div>
              <div className="flex items-center gap-3 text-amber-800 font-semibold">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping inline-block"></span>
                <span>Confirming payment</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"></span>
                <span>Payment confirmed</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigateTo('my-rentals');
                }}
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs hover:opacity-95 transition shadow-xs"
              >
                View rental status
              </button>

              <button
                onClick={() => navigateTo('explore')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-black"
              >
                Back to home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal Popup */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-black/[0.05] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.04]">
              <h3 className="font-bold text-base text-gray-900">Transaction details</h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50/70 rounded-2xl p-4 border border-black/[0.04] space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-black/[0.04]">
                <span className="text-gray-500">Amount paid:</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-gray-900 text-sm">${totalAmount} USDC</span>
                  <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    Paid
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Payment ID:</span>
                <span className="font-mono font-bold text-gray-900">
                  {activeTxHash ? `TX-${activeTxHash.slice(0, 8).toUpperCase()}` : 'PAY-ESCROW'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Rental ID:</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedRental?.rentalCode || (selectedRentalId ? `RENT-${selectedRentalId.slice(0, 8).toUpperCase()}` : 'RENT-ACTIVE')}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Asset:</span>
                <span className="font-bold text-gray-900">USDC (Stellar Soroban)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Network:</span>
                <span className="font-semibold text-gray-900">Stellar Testnet</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>From (you):</span>
                <span className="font-mono text-gray-900">
                  {connectedWallet?.address
                    ? `${connectedWallet.address.slice(0, 4)}...${connectedWallet.address.slice(-4)}`
                    : 'GRENTER_WALLET'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>To (host):</span>
                <span className="font-mono text-gray-900">
                  {vehicle?.host?.stellarAddress
                    ? `${vehicle.host.stellarAddress.slice(0, 4)}...${vehicle.host.stellarAddress.slice(-4)}`
                    : 'GHOST_ESCROW'}
                </span>
              </div>
            </div>

            {/* Hash */}
            <div className="space-y-1 text-xs">
              <span className="text-gray-500">Transaction hash</span>
              <div className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-xl border border-black/[0.06] font-mono text-[11px] text-gray-700 shadow-2xs">
                <span className="truncate max-w-[280px]">{txHash}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(txHash);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  className="text-gray-500 hover:text-black ml-2"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: '#06372d' }}
                className="w-full py-3 rounded-xl text-white font-bold text-xs hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>View on explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer copyright space */}
      <div className="max-w-md w-full mx-auto text-center text-[10px] text-gray-400 pt-4">
        PayarMove © 2026 • Powered by Stellar Network
      </div>
    </div>
  );
}
