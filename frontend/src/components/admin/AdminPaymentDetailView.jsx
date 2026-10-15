import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
} from 'lucide-react';

export default function AdminPaymentDetailView() {
  const { selectedAdminPayment, navigateTo } = useApp();
  const payment = selectedAdminPayment || {
    paymentId: 'PM-PAY-8921',
    rentalId: 'PM-8921',
    vehicle: 'Mercedes-Benz G63 AMG (2024)',
    renter: 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT',
    host: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK',
    network: 'Stellar Testnet',
    asset: 'USDC',
    amount: '880.00 USDC',
    platformFee: '44.00 USDC',
    hostAmount: '836.00 USDC',
    securityDeposit: '500.00 USDC',
    txHash: 'e89f81a7b5...3c7d91e4a1',
    status: 'Paid',
    payout: 'Completed',
  };

  const [copied, setCopied] = useState(false);
  const [reverifying, setReverifying] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReverify = () => {
    setReverifying(true);
    setTimeout(() => setReverifying(false), 1500);
  };

  const verificationItems = [
    'Transaction exists',
    'Transaction succeeded',
    'Correct network',
    'Correct recipient',
    'Correct asset',
    'Correct amount',
    'Correct rental / payment reference',
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('admin-payments')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to payments</span>
        </button>

        {/* Title Header (Matches Payment [PM-0000-00000] in Admin dashboard.png) */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-950 tracking-tight font-mono">
                Payment {payment.paymentId || 'PM-PAY-0000'}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  payment.status === 'Paid'
                    ? 'bg-[#f0faf6] text-[#06372d] border border-emerald-500/15'
                    : payment.status === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {payment.status || 'Paid'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              Rental ID: {payment.rentalId || 'RENT-ACTIVE'}
            </p>
          </div>
        </div>

        {/* 2-Column Layout (Matches Admin dashboard.png artboard 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment, Amounts, Transaction */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Details Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3 text-xs">
              <h3 className="font-bold text-sm text-gray-950 mb-3">Payment</h3>

              <div className="flex justify-between text-gray-600">
                <span>Payment ID</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.paymentId || 'PM-PAY-0000'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Rental ID</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.rentalId || 'RENT-ACTIVE'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Vehicle</span>
                <span className="text-gray-900 font-semibold">{payment.vehicle || payment.vehicleName || 'Vehicle'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Renter</span>
                <span className="font-mono text-gray-900">{payment.renterName || payment.renter || 'Guest Renter'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Host</span>
                <span className="font-mono text-gray-900">{payment.hostName || payment.host || 'Verified Host'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Network</span>
                <span className="text-gray-900 font-semibold">{payment.network || 'Stellar Testnet'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Asset</span>
                <span className="text-gray-900 font-semibold font-mono">USDC</span>
              </div>
            </div>

            {/* Amounts Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3 text-xs">
              <h3 className="font-bold text-sm text-gray-950 mb-3">Amounts</h3>

              <div className="flex justify-between text-gray-600">
                <span>Amount</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.amount || '0.00 USDC'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform fee</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.platformFee || '35.00 USDC'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Host amount</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.hostAmount || '0.00 USDC'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Security deposit</span>
                <span className="font-mono text-gray-900 font-semibold">{payment.securityDeposit || '0.00 USDC'}</span>
              </div>
            </div>

            {/* Transaction Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4 text-xs">
              <h3 className="font-bold text-sm text-gray-950">Transaction</h3>

              <div className="space-y-1.5">
                <span className="text-gray-500">Transaction hash</span>
                <div className="flex items-center justify-between p-2.5 bg-gray-50/80 rounded-xl border border-black/[0.06] font-mono text-[11px] text-gray-700 shadow-2xs">
                  <span className="truncate">{payment.txHash || 'Pending confirmation'}</span>
                  <button
                    onClick={() => handleCopy(payment.txHash || 'Pending confirmation')}
                    className="text-gray-500 hover:text-black ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <a
                href={payment.txHash ? `https://stellar.expert/explorer/testnet/tx/${payment.txHash}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs hover:shadow-xs"
              >
                <span>View transaction</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Verification status, Payment status, Deposit status, Host payout */}
          <div className="lg:col-span-7 space-y-6">
            {/* Verification Status Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-5">
              <h3 className="font-bold text-sm text-gray-950">Verification status</h3>

              <div className="space-y-2 text-xs">
                {verificationItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-gray-800">
                    <div className="w-4 h-4 rounded-full bg-[#06372d] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Payment confirmed</span>
                <span className="bg-[#f0faf6] text-[#06372d] border border-emerald-500/15 text-xs font-bold px-3 py-0.5 rounded-full">
                  Paid
                </span>
              </div>

              <div>
                <button
                  onClick={handleReverify}
                  className="w-full py-2.5 rounded-xl border border-black/[0.06] bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs hover:shadow-xs"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${reverifying ? 'animate-spin' : ''}`} />
                  <span>{reverifying ? 'Verifying on Horizon...' : 'Re-verify payment'}</span>
                </button>
              </div>
            </div>

            {/* Payment Status Stepper */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="font-bold text-sm text-gray-950">Payment status</h3>

              {/* Stepper items */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 overflow-x-auto pb-1">
                {['CREATED', 'AWAITING PAYMENT', 'PAYMENT SUBMITTED', 'VERIFYING', 'PAID'].map(
                  (step, idx) => (
                    <div key={step} className="flex items-center gap-1.5 shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#06372d] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
                        ✓
                      </div>
                      <span className="text-gray-900 font-bold">{step}</span>
                      {idx < 4 && <span className="text-gray-300 mx-1">›</span>}
                    </div>
                  )
                )}
              </div>

              <p className="text-[10px] text-gray-400">
                Exception states: FAILED, EXPIRED, CANCELLED
              </p>
            </div>

            {/* Deposit Status Stepper */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
              <h3 className="font-bold text-sm text-gray-950">Deposit status</h3>

              {/* Stepper items */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 overflow-x-auto pb-1">
                {['REQUESTED', 'PAID', 'HELD', 'COMPLETED', 'RELEASED'].map((step, idx) => {
                  const isDone = idx <= 2;
                  return (
                    <div key={step} className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                          isDone ? 'bg-[#06372d] text-white shadow-xs' : 'border border-black/10 text-transparent'
                        }`}
                      >
                        {isDone ? '✓' : ''}
                      </div>
                      <span className={isDone ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                        {step}
                      </span>
                      {idx < 4 && <span className="text-gray-300 mx-1">›</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Payout Card */}
            <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-3 text-xs">
              <h3 className="font-bold text-sm text-gray-950 mb-3">Host payout</h3>

              <div className="flex justify-between items-center text-gray-600">
                <span>Payout status</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                  payment.payout === 'Completed' || payment.payout === 'Paid'
                    ? 'bg-[#f0faf6] text-[#06372d] border border-emerald-500/15'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/50'
                }`}>
                  {payment.payout || 'Completed'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Host amount</span>
                <span className="font-mono text-gray-900 font-semibold">
                  {payment.hostAmount || '0.00 USDC'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

