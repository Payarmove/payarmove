import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import SearchBar from './SearchBar';
import HeroCarIllustration from '../common/HeroCarIllustration';
import { Heart, MapPin, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function ExploreView() {
  const {
    vehicles,
    isLoadingVehicles,
    refreshBackendData,
    searchQuery,
    setSearchQuery,
    navigateTo,
    savedVehicleIds,
    toggleSaveVehicle,
    setSelectedVehicle,
    connectedWallet,
    user,
    handleConnectWallet,
    isWalletConnecting,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All');

  const hasWallet = Boolean(connectedWallet?.address || user?.walletAddress);
  const activeWalletAddress = connectedWallet?.address || user?.walletAddress;

  // Exact order in Figma artboard 2: All, Sedan, SUV, Compact, Van
  const categories = ['All', 'Sedan', 'SUV', 'Compact', 'Van', 'Luxury', 'Electric'];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Category filter
      if (selectedCategory !== 'All') {
        const cat = (v.category || '').toLowerCase();
        const typ = (v.type || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (!cat.includes(sel) && !typ.includes(sel)) return false;
      }

      // 2. Location filter
      if (searchQuery.location && searchQuery.location.trim()) {
        const queryLoc = searchQuery.location.toLowerCase().trim();
        const carLoc = (v.location || '').toLowerCase();
        const matchesLoc = carLoc.includes(queryLoc) || queryLoc.includes(carLoc.split(',')[0].trim());
        if (!matchesLoc) return false;
      }

      return true;
    });
  }, [vehicles, selectedCategory, searchQuery.location]);

  const handleSelectCar = (car) => {
    setSelectedVehicle(car);
    navigateTo('vehicle-detail');
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Hero Card Banner with Overlapping Search Bar (Matches Figma artboard 2 & Artboard 1) */}
        <div className="relative mb-28 md:mb-14">
          <section
            style={{
              background: 'linear-gradient(135deg, #053736 0%, #084e4d 50%, #0a5d5c 100%)',
            }}
            className="rounded-[32px] text-white px-6 sm:px-12 pt-8 sm:pt-14 pb-28 md:pb-24 relative overflow-hidden shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left Headline */}
              <div className="lg:col-span-7 space-y-3 z-10">
                <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.08]">
                  Rent by the hour. <br />
                  Pay in USDC.
                </h1>
                <p className="text-gray-200/90 text-sm sm:text-base font-medium pt-1">
                  Cars from local hosts near you.
                </p>
              </div>

              {/* Right Graphic: Exact Vector Illustration matching Figma artboard */}
              <div className="lg:col-span-5 relative flex justify-end items-center">
                <div className="w-full max-w-[280px] sm:max-w-[440px] flex items-center justify-end -mr-2 sm:mr-0">
                  <HeroCarIllustration className="w-full h-auto select-none pointer-events-none drop-shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Overlapping Search Bar: positioned hanging across the bottom hero boundary */}
          <div className="absolute left-3 right-3 sm:left-8 sm:right-8 -bottom-24 md:-bottom-8 z-20">
            <SearchBar onSearchSubmit={() => navigateTo('search')} />
          </div>
        </div>

        {/* Pricing text & Category Pills: Exact Figma Artboard 2 order */}
        <div className="pt-2 space-y-3">
          <div className="text-xs text-gray-500 font-medium">
            Priced per hour, paid in USDC
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {searchQuery.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#06372d] border border-emerald-500/20 shadow-2xs shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                <span>{searchQuery.location}</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery((prev) => ({ ...prev, location: '' }))}
                  className="hover:bg-emerald-200 rounded-full p-0.5 transition"
                  title="Clear location filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#06372d] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeletons while initial fleet is querying and no vehicles are cached */}
        {isLoadingVehicles && vehicles.length === 0 && (
          <div className="space-y-4">
            <div className="h-6 w-36 bg-gray-200/80 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/[0.04] p-3 space-y-3 shadow-xs animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200/70 rounded-xl" />
                  <div className="h-4 bg-gray-200/80 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-200/60 rounded w-1/3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no vehicles match active category & location */}
        {!isLoadingVehicles && filteredVehicles.length === 0 && (
          <div className="bg-white rounded-3xl border border-black/[0.04] shadow-sm p-8 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#06372d] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">No vehicles found</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {selectedCategory !== 'All' || searchQuery.location
                  ? `No vehicles found matching ${selectedCategory !== 'All' ? `category "${selectedCategory}"` : ''} ${searchQuery.location ? `in "${searchQuery.location}"` : ''}. Try resetting your search filters.`
                  : 'Vehicles are currently syncing from the Stellar Soroban network.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              {(selectedCategory !== 'All' || searchQuery.location) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery((prev) => ({ ...prev, location: '' }));
                  }}
                  className="px-4 py-2 bg-[#06372d] text-white text-xs font-semibold rounded-xl hover:bg-[#09473b] transition shadow-xs"
                >
                  Reset all filters
                </button>
              )}
              <button
                type="button"
                onClick={() => refreshBackendData()}
                className="px-4 py-2 bg-gray-100 text-gray-800 text-xs font-semibold rounded-xl hover:bg-gray-200 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh fleet</span>
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Cars near you & Section 2: Featured (Rendered when vehicles match filters) */}
        {filteredVehicles.length > 0 && (
          <>
            {/* Section 1: Cars near you (Matches Figma artboard 2 & Mobile Artboard 1) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">Cars near you</h2>
                <button
                  onClick={() => navigateTo('search')}
                  className="text-xs font-semibold text-[#06372d] hover:underline transition"
                >
                  More
                </button>
              </div>

              {/* Desktop Grid (4 columns) & Mobile Horizontal Snap Carousel */}
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x">
                {filteredVehicles.slice(0, 4).map((car) => {
                  const isSaved = savedVehicleIds.includes(car.id);
                  const carTitle = car.name || `${car.make} ${car.model}`;
                  return (
                    <div
                      key={car.id}
                      onClick={() => handleSelectCar(car)}
                      className="shrink-0 w-[260px] sm:w-auto bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition duration-200 cursor-pointer group flex flex-col justify-between snap-start"
                    >
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img
                          src={car.images?.[0] || car.image || '/cars/gwagon.jpg'}
                          alt={carTitle}
                          onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Category badge inside photo at bottom-left */}
                        <div className="hidden sm:block absolute bottom-2.5 left-2.5 bg-white text-gray-900 font-semibold text-[11px] px-2.5 py-0.5 rounded-md shadow-xs border border-black/[0.04]">
                          {car.category || 'Luxury'}
                        </div>

                        {/* Circular heart button at top-right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveVehicle(car.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition shadow-xs border border-black/[0.05] text-gray-700"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSaved ? 'text-[#06372d] fill-[#06372d]' : 'text-gray-700'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-4 space-y-1.5">
                        {/* Row 1: Car model on left, location on right */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#06372d] transition">
                            {carTitle}
                          </h3>
                          <span className="hidden sm:inline-block text-xs text-gray-400 whitespace-nowrap">
                            {car.location || 'Miami, FL'}
                          </span>
                        </div>

                        {/* Row 2: seats · rating · trips */}
                        <div className="hidden sm:block text-xs text-gray-500">
                          {car.specs?.seats || 5} seats · ★ {car.rating ? car.rating.toFixed(1) : '5.0'} · {car.tripsCount || 15} trips
                        </div>

                        {/* Row 3: Hourly Rate */}
                        <div className="pt-1 flex items-baseline justify-between text-xs">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-gray-950 font-mono text-sm">
                              {Number(car.hourlyRate || 25).toFixed(2)} USDC
                            </span>
                            <span className="text-gray-500">/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Featured (Matches 'Featured' with 'Clear' in Figma artboard 2) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">Featured</h2>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-xs font-semibold text-[#06372d] hover:underline transition"
                >
                  <span className="hidden sm:inline">Clear</span>
                  <span className="sm:hidden">More</span>
                </button>
              </div>

              {/* 4 Cards (Desktop) & Mobile Horizontal Snap Carousel */}
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 scrollbar-none snap-x">
                {filteredVehicles.slice(0, 4).reverse().map((car) => {
                  const isSaved = savedVehicleIds.includes(car.id);
                  const carTitle = car.name || `${car.make} ${car.model}`;
                  return (
                    <div
                      key={`feat-${car.id}`}
                      onClick={() => handleSelectCar(car)}
                      className="shrink-0 w-[260px] sm:w-auto bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition duration-200 cursor-pointer group flex flex-col justify-between snap-start"
                    >
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img
                          src={car.images?.[0] || car.image || '/cars/gwagon.jpg'}
                          alt={carTitle}
                          onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Category badge inside photo at bottom-left */}
                        <div className="hidden sm:block absolute bottom-2.5 left-2.5 bg-white text-gray-900 font-semibold text-[11px] px-2.5 py-0.5 rounded-md shadow-xs border border-black/[0.04]">
                          {car.category || 'Luxury'}
                        </div>

                        {/* Circular heart button at top-right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveVehicle(car.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition shadow-xs border border-black/[0.05] text-gray-700"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isSaved ? 'text-[#06372d] fill-[#06372d]' : 'text-gray-700'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-4 space-y-1.5">
                        {/* Row 1: Car model on left, location on right */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#06372d] transition">
                            {carTitle}
                          </h3>
                          <span className="hidden sm:inline-block text-xs text-gray-400 whitespace-nowrap">
                            {car.location || 'Miami, FL'}
                          </span>
                        </div>

                        {/* Row 2: Hourly rate */}
                        <div className="pt-1 flex items-baseline gap-1 text-xs">
                          <span className="font-bold text-gray-950 font-mono text-sm">
                            {Number(car.hourlyRate || 25).toFixed(2)} USDC
                          </span>
                          <span className="text-gray-500">/hr</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}


        {/* Section 3: Two Columns: 'How it works' & 'Pay with USDC' */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: How it works (White card, soft shadow, subtle border) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 space-y-6">
            <h2 className="text-xl font-extrabold text-gray-950 tracking-tight">How it works</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Pick your times</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Choose a pick-up and a drop-off time. Rentals start at 1 hour.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Pay in USDC</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Approve the payment in your wallet. Your deposit is held separately.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Pick up the car</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Meet your host at the pick-up point. The exact address is shared after booking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pay with USDC (Light mint card bg-[#f0faf6], subtle borders) */}
          <div className="lg:col-span-5 bg-[#f0faf6] border border-emerald-500/10 shadow-[0_8px_30px_rgba(6,55,45,0.04)] rounded-3xl p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#06372d] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  $
                </div>
                <h2 className="text-xl font-extrabold text-gray-950 tracking-tight">Pay with USDC</h2>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                USDC is a digital dollar. You need a wallet to pay, and connecting one takes a minute.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#06372d] font-bold">✓</span>
                  <span>Prices are listed in USDC per hour.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#06372d] font-bold">✓</span>
                  <span>Your security deposit is separate from the rental fee.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[#06372d] font-bold">✓</span>
                  <span>You approve each payment in your own wallet.</span>
                </div>
              </div>
            </div>

            <div>
              {hasWallet ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-white border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-semibold text-emerald-950 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Wallet Active</span>
                    <span className="font-mono text-gray-500">
                      ({activeWalletAddress?.slice(0, 4)}...{activeWalletAddress?.slice(-4)})
                    </span>
                    <span className="font-bold text-emerald-800">
                      · {connectedWallet?.balance || user?.balanceFormatted || '0.00 USDC'}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleConnectWallet()}
                  disabled={isWalletConnecting}
                  className="px-6 py-2.5 rounded-full border border-black/[0.08] hover:border-black/20 bg-white hover:bg-emerald-50 text-[#06372d] font-semibold text-xs transition shadow-xs flex items-center gap-2"
                >
                  {isWalletConnecting ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#06372d] border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  <span>{isWalletConnecting ? 'Connecting Stellar...' : 'Connect a wallet'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Have a car to share? Banner */}
        <div
          style={{ backgroundColor: '#06372d' }}
          className="rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_12px_36px_-8px_rgba(6,55,45,0.3)]"
        >
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Have a car to share?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              List it and get paid in USDC for every rental.
            </p>
          </div>

          <button
            onClick={() => navigateTo('become-host')}
            className="bg-white hover:bg-gray-100 text-[#06372d] font-bold text-xs px-6 py-3 rounded-full transition shadow-xs whitespace-nowrap"
          >
            Become a host
          </button>
        </div>
      </div>
    </div>
  );
}
