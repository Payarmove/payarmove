import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  Car,
  Wallet,
  User,
  LogOut,
  ChevronRight,
  Plus,
  Star,
  Heart,
  Image as ImageIcon,
  X,
  UploadCloud,
  AlertCircle,
  Check,
} from 'lucide-react';

export default function AddVehicleView() {
  const { navigateTo, handleAddVehicle, switchMode, setHostAccountTab, user, connectedWallet } = useApp();
  const payoutAddress = user?.walletAddress || user?.primary_stellar_address || connectedWallet?.address || '';
  const hasPayoutWallet = Boolean(payoutAddress && payoutAddress.trim());
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    registration_number: '',
    category: 'SUV',
    seats: 5,
    doors: 4,
    transmission: 'Automatic',
    fuel: 'Petrol',
    hourlyRate: '',
    dailyRate: '',
    securityDeposit: '',
    area: 'Westlands, Nairobi, Kenya',
    cancellationTerms: 'Free cancellation up to 24 hours before pick-up.',
    description: '',
    images: [],
  });

  const parsedHourly = parseFloat(form.hourlyRate) || 0;
  const dailyCost = (parsedHourly * 24).toFixed(2);

  const handlePriceChange = (field, val) => {
    if (val === '') {
      setForm((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    // Disallow negative sign or exponential notation
    if (val.includes('-') || val.includes('e') || val.includes('E')) return;
    // Allow numbers and decimal points without sticking to zero
    if (/^\d*\.?\d*$/.test(val)) {
      setForm((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handlePhotoFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result;
        if (dataUrl) {
          setForm((prev) => ({
            ...prev,
            images: [dataUrl, ...(prev.images || []).filter((img) => img !== dataUrl)].slice(0, 10),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setUploadError('');

    if (!form.make.trim()) {
      setUploadError('Please enter the vehicle make (e.g. Mercedes-Benz).');
      return;
    }
    if (!form.model.trim()) {
      setUploadError('Please enter the vehicle model (e.g. GLE 450 Coupe).');
      return;
    }
    const plate = (form.licensePlate || form.registration_number || '').trim();
    if (!plate) {
      setUploadError('Please enter the vehicle license plate registration number.');
      return;
    }
    const hr = parseFloat(form.hourlyRate);
    if (isNaN(hr) || hr <= 0) {
      setUploadError('Please enter a valid hourly rate greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await handleAddVehicle({
        ...form,
        make_model: `${form.make.trim()} ${form.model.trim()}`,
        registration_number: plate,
        licensePlate: plate,
        hourlyRate: hr,
        dailyRate: parseFloat((hr * 24).toFixed(7)),
        securityDeposit: parseFloat(form.securityDeposit) || 0,
      });
      if (res?.success !== false) {
        navigateTo('host-vehicles');
      } else {
        let msg = res?.error || 'Failed to publish vehicle. Please check inputs.';
        if (typeof msg === 'object' && msg !== null) {
          try {
            msg = Object.entries(msg)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          } catch {
            msg = JSON.stringify(msg);
          }
        }
        setUploadError(msg);
      }
    } catch (err) {
      setUploadError(err.message || 'Error publishing vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Host Left Sidebar (Matches Host - Add a vehicle.png artboard 6) */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="bg-white rounded-2xl border border-black/[0.04] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => navigateTo('host-dashboard')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#06372d] text-white shadow-2xs font-bold"
                >
                  <span className="flex items-center gap-2.5">
                    <Car className="w-4 h-4" />
                    <span>My vehicles</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHostAccountTab?.('wallet');
                    navigateTo('host-account');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span>Payout wallet</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHostAccountTab?.('profile');
                    navigateTo('host-account');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Account</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <div className="pt-4 border-t border-black/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      switchMode('renting');
                      navigateTo('explore');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Switch to Renter</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Area: Matches Host - Add a vehicle.png artboard 6 */}
          <main className="lg:col-span-3 space-y-6">
            {/* Header with Title and Publish Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                  Add a vehicle
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tell renters about your car. Photos and registration details appear in search.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('host-vehicles')}
                  className="bg-white border border-black/[0.06] text-gray-750 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition shadow-2xs"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="bg-[#06372d] hover:bg-[#09473b] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-2xs hover:shadow-xs flex items-center gap-1.5"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{isSubmitting ? 'Publishing...' : 'Publish vehicle'}</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* 2-Column Form & Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Sections */}
              <div className="xl:col-span-7 space-y-6">
                {/* Photos Section */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Photos</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {form.images.length} of 10 photos. The first photo is the cover.
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoFiles}
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/[0.1] rounded-2xl p-6 text-center hover:border-[#06372d] hover:bg-emerald-50/20 transition bg-gray-50/50 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#06372d] flex items-center justify-center mx-auto mb-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-900">+ Add photos</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Click to browse or upload JPEG, PNG or WEBP
                    </div>
                  </div>

                  {/* Thumbnail Slots */}
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 pt-1">
                      {form.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[4/3] rounded-xl overflow-hidden border border-black/[0.06] shadow-2xs group"
                        >
                          <img
                            src={img}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(idx);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
                  <h3 className="text-sm font-bold text-gray-950">Vehicle details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Make
                      </label>
                      <input
                        type="text"
                        value={form.make}
                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                        placeholder="e.g. Mercedes-Benz, Porsche, BMW"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        value={form.model}
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                        placeholder="e.g. GLE 450 Coupe, Macan, X5"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        License plate
                      </label>
                      <input
                        type="text"
                        value={form.licensePlate}
                        onChange={(e) => setForm({ ...form, licensePlate: e.target.value, registration_number: e.target.value })}
                        placeholder="e.g. KDA 892Z"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Year
                      </label>
                      <input
                        type="number"
                        min="1990"
                        max={new Date().getFullYear() + 2}
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: Number(e.target.value) || '' })}
                        placeholder="2024"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-2.5 py-2 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      >
                        <option>SUV</option>
                        <option>Sedan</option>
                        <option>Compact</option>
                        <option>Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Seats
                      </label>
                      <select
                        value={form.seats}
                        onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                        className="w-full px-2.5 py-2 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      >
                        <option>2</option>
                        <option>4</option>
                        <option>5</option>
                        <option>7</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Transmission
                      </label>
                      <select
                        value={form.transmission}
                        onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                        className="w-full px-2.5 py-2 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      >
                        <option>Automatic</option>
                        <option>Manual</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Fuel
                      </label>
                      <select
                        value={form.fuel}
                        onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                        className="w-full px-2.5 py-2 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      >
                        <option>Petrol</option>
                        <option>Hybrid</option>
                        <option>Electric</option>
                        <option>Diesel</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
                  <h3 className="text-sm font-bold text-gray-950">Pricing</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Hourly rate (USDC)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.hourlyRate}
                        onChange={(e) => handlePriceChange('hourlyRate', e.target.value)}
                        placeholder="e.g. 25.00"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Security deposit (USDC)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={form.securityDeposit}
                        onChange={(e) => handlePriceChange('securityDeposit', e.target.value)}
                        placeholder="e.g. 200.00"
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed bg-[#f0faf6] p-3 rounded-xl border border-emerald-500/10 shadow-2xs">
                    A 24-hr rental would cost <strong>{dailyCost} USDC</strong>. The security deposit is held in Soroban Escrow and released automatically upon vehicle return.
                  </p>
                </div>

                {/* Pick-up Location */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-2">
                  <h3 className="text-sm font-bold text-gray-950">Pick-up location</h3>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Area or address
                    </label>
                    <input
                      type="text"
                      value={form.area}
                      onChange={(e) => setForm({ ...form, area: e.target.value })}
                      placeholder="Miami Beach, FL"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Renters see the area. The exact address is shared after booking.
                    </p>
                  </div>
                </div>

                {/* Cancellation Terms */}
                <div className="bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-2">
                  <h3 className="text-sm font-bold text-gray-950">Cancellation terms</h3>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Terms shown to renters
                    </label>
                    <textarea
                      rows={3}
                      value={form.cancellationTerms}
                      onChange={(e) =>
                        setForm({ ...form, cancellationTerms: e.target.value })
                      }
                      placeholder="Free cancellation up to 24 hours before trip start"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-black/[0.06] rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#06372d] shadow-2xs transition"
                    />
                  </div>
                </div>

                {/* Add a payout wallet to publish reminder banner */}
                {hasPayoutWallet ? (
                  <div className="p-4 rounded-2xl border border-emerald-500/15 bg-[#f0faf6] shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#06372d] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                          <span>Payout wallet configured</span>
                          <span className="bg-emerald-100 text-[#06372d] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </h4>
                        <p className="text-[11px] text-gray-600 font-mono mt-0.5">
                          {payoutAddress.slice(0, 10)}...{payoutAddress.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHostAccountTab?.('wallet');
                        navigateTo('host-account');
                      }}
                      className="bg-white border border-black/[0.06] text-gray-900 text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-gray-50 transition shrink-0 shadow-2xs"
                    >
                      Change wallet
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-amber-700 shrink-0" />
                      <div>
                        <h4 className="font-bold text-amber-950 text-xs">
                          Add a payout wallet to publish
                        </h4>
                        <p className="text-[11px] text-amber-800">
                          So PayarMove knows where to record what you are owed.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHostAccountTab?.('wallet');
                        navigateTo('host-account');
                      }}
                      className="bg-white border border-amber-300 text-amber-950 text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-amber-100/50 transition shrink-0 shadow-2xs"
                    >
                      Add payout wallet
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Preview Box (Matches Host - Add a vehicle.png artboard 6) */}
              <div className="xl:col-span-5">
                <div className="sticky top-24 bg-white rounded-3xl border border-black/[0.04] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-950 text-sm">Preview</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      How renters will see your car in search results.
                    </p>
                  </div>

                  {/* Real-time Rendered Car Card */}
                  <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
                      <img
                        src={(form.images && form.images[0]) || '/cars/gwagon.jpg'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                        {form.category || 'SUV'}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {`${form.make || ''} ${form.model || ''}`.trim() || 'New Vehicle'} {form.year ? `(${form.year})` : ''}
                        </h4>
                        <span className="text-[11px] text-gray-500 shrink-0">
                          {form.area ? form.area.split(',')[0] : 'Nairobi'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{form.seats} seats</span>
                        <span>·</span>
                        <div className="flex items-center gap-1 font-semibold text-gray-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>5.0 rating</span>
                        </div>
                        <span>·</span>
                        <span>0 trips</span>
                      </div>

                      <div className="pt-2 border-t border-black/[0.04] flex items-baseline justify-between">
                        <div>
                          <span className="text-base font-extrabold text-gray-950 font-mono">
                            {parsedHourly > 0 ? parsedHourly.toFixed(2) : '0.00'} USDC
                          </span>
                          <span className="text-[11px] text-gray-500"> /hr</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {dailyCost} USDC /day
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
