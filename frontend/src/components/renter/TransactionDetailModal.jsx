import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';

export default function TransactionDetailModal() {
  const { selectedRental, navigateTo } = useApp();
  const [copied, setCopied] = useState(false);

  const rental = selectedRental;

  const handleCopy = () => {
    navigator.clipboard?.writeText(rental.fullTxHash || '0000000000000000');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-black/[0.04] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('rental-detail')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to rental</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight mb-6">
          Transaction details
        </h1>

        {/* Amount Paid Box */}
        <div className="bg-[#f0faf6] border border-emerald-500/15 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-2xs">
          <div>
            <div className="text-[11px] font-semibold text-emerald-800/80 uppercase tracking-wider">
              Amount paid
            </div>
            <div className="text-2xl font-black text-[#06372d] font-mono mt-0.5">
              {rental.totalPaid ? rental.totalPaid.toFixed(2) : '880.00'} USDC
            </div>
          </div>
          <span className="bg-white text-[#06372d] border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
            Paid
          </span>
        </div>

        {/* Payment Metadata Grid */}
        <div className="space-y-3 text-xs mb-6 pb-6 border-b border-black/[0.04]">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment ID</span>
            <span className="font-mono font-semibold text-gray-900">{rental.paymentId || 'PM-PAY-8921'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Rental ID</span>
            <span className="font-mono font-semibold text-gray-900">{rental.rentalId || rental.id || 'PM-8921'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold text-gray-900">{rental.pickupDate || 'Today, 2:00 PM'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Asset</span>
            <span className="font-bold text-gray-900">USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Network</span>
            <span className="font-semibold text-gray-900">Stellar Testnet</span>
          </div>
        </div>

        {/* Wallets */}
        <div className="space-y-3 text-xs mb-6 pb-6 border-b border-black/[0.04]">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">From (you)</span>
            <span className="font-mono font-semibold text-gray-900">{rental.renter?.wallet || 'GC2R...EKLT'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">To (host)</span>
            <span className="font-mono font-semibold text-gray-900">{rental.host?.wallet || 'GAPSK...2ZWK'}</span>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Transaction hash
          </label>
          <div className="flex items-center gap-2 bg-gray-50/80 border border-black/[0.06] rounded-xl px-3 py-2 text-xs font-mono text-gray-700 shadow-2xs">
            <span className="truncate flex-1">{rental.txHash || 'e89f81a7b5...3c7d'}</span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-200/60 rounded text-gray-500 transition"
              title="Copy Hash"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Explorer Button */}
        <div className="space-y-2">
          <a
            href={`https://stellar.expert/explorer/public/tx/${rental.fullTxHash || 'e84920c8b21a302847d0184c9820f837482910faecb891024859012849102f83'}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#06372d] hover:bg-[#09473b] text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View on explorer</span>
          </a>
          <p className="text-[11px] text-gray-400 text-center">
            Opens in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
