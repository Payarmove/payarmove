import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Calendar, Heart, ArrowLeft, RotateCcw, X, AlertCircle } from 'lucide-react';

export default function SearchResultsView() {
  const {
    vehicles,
    searchQuery,
    setSearchQuery,
    updateTimeline,
    navigateTo,
    setSelectedVehicle,
    savedVehicleIds,
    toggleSaveVehicle,
  } = useApp();

  // State for filters matching desktop_search_results.png
  const [selectedCategories, setSelectedCategories] = useState(['Sedan', 'SUV', 'Compact', 'Van', 'Luxury', 'Electric']);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [transmissions, setTransmissions] = useState(['Automatic', 'Manual']);
  const [selectedSeats, setSelectedSeats] = useState(null);

  const durationHours = searchQuery.durationHours || 26;

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleTransmission = (t) => {
    if (transmissions.includes(t)) {
      if (transmissions.length > 1) {
        setTransmissions(transmissions.filter((item) => item !== t));
      }
    } else {
      setTransmissions([...transmissions, t]);
    }
  };

  const resetAllFilters = () => {
    setSelectedCategories(['Sedan', 'SUV', 'Compact', 'Van', 'Luxury', 'Electric']);
    setMinPrice('');
    setMaxPrice('');
    setTransmissions(['Automatic', 'Manual']);
    setSelectedSeats(null);
    setSearchQuery((prev) => ({ ...prev, location: '' }));
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Location filter
      if (searchQuery.location && searchQuery.location.trim()) {
        const queryLoc = searchQuery.location.toLowerCase().trim();
        const carLoc = (v.location || '').toLowerCase();
        const matchesLoc = carLoc.includes(queryLoc) || queryLoc.includes(carLoc.split(',')[0].trim());
        if (!matchesLoc) return false;
      }

      // 2. Category filter
      const matchesCategory = selectedCategories.some((c) =>
        (v.category || '').toLowerCase().includes(c.toLowerCase()) ||
        (v.type || '').toLowerCase().includes(c.toLowerCase())
      );
      if (!matchesCategory) return false;

      // 3. Price filter
      const rate = parseFloat(v.hourlyRate || 0);
      if (minPrice && rate < parseFloat(minPrice)) return false;
      if (maxPrice && rate > parseFloat(maxPrice)) return false;

      // 4. Transmission filter
      const trans = (v.specs?.transmission || 'Automatic').toLowerCase();
      const matchesTransmission = transmissions.some((t) => trans === t.toLowerCase());
      if (!matchesTransmission) return false;

      // 5. Seats filter
      const seats = parseInt(v.specs?.seats || 5, 10);
      if (selectedSeats && seats < parseInt(selectedSeats, 10)) return false;

      return true;
    });
  }, [vehicles, searchQuery.location, selectedCategories, minPrice, maxPrice, transmissions, selectedSeats]);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    navigateTo('vehicle-detail');
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900">
      {/* Top Search Summary Bar (Soft light background, modern floating pills) */}
      <div className="bg-[#f8fafc] py-4 px-4 sm:px-6 lg:px-8 border-b border-black/[0.04]">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto scrollbar-none">
          {/* Back button circle */}
          <button
            onClick={() => navigateTo('explore')}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.04] hover:bg-gray-50 shrink-0 transition"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Pill 1: Pick up location */}
          <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] border border-black/[0.04] shrink-0 min-w-[200px]">
            <MapPin className="w-4 h-4 text-[#06372d] shrink-0" />
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Pick up location
              </div>
              <div className="text-xs font-bold text-gray-900 truncate">
                {searchQuery.location || 'All Locations'}
              </div>
            </div>
            {searchQuery.location && (
              <button
                type="button"
                onClick={() => setSearchQuery((p) => ({ ...p, location: '' }))}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition"
                title="Clear location filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pill 2: Pick up */}
          <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] border border-black/[0.04] shrink-0 min-w-[200px]">
            <Calendar className="w-4 h-4 text-[#06372d] shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Pick up
              </div>
              <div className="text-xs font-bold text-gray-900 truncate">
                {searchQuery.pickupDate || '2026-10-14'} · {searchQuery.pickupTime || '09:00'}
              </div>
            </div>
          </div>

          {/* Pill 3: Drop off */}
          <div className="bg-white rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] border border-black/[0.04] shrink-0 min-w-[200px]">
            <Calendar className="w-4 h-4 text-[#06372d] shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                Drop off ({durationHours} hrs)
              </div>
              <div className="text-xs font-bold text-gray-900 truncate">
                {searchQuery.dropoffDate || '2026-10-15'} · {searchQuery.dropoffTime || '11:00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Filter Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-950">Filters</h2>
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-[#06372d] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Checkboxes */}
            <div className="space-y-3 pb-6 border-b border-black/[0.04]">
              <h3 className="text-xs font-bold text-gray-800">Category</h3>
              <div className="space-y-2 text-xs">
                {['Sedan', 'SUV', 'Compact', 'Van', 'Luxury', 'Electric'].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded text-[#06372d] focus:ring-[#06372d] border-gray-300 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-black font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price (USDC /hr) Inputs Min / Max */}
            <div className="space-y-3 pb-6 border-b border-black/[0.04]">
              <h3 className="text-xs font-bold text-gray-800">Price (USDC /hr)</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs transition"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/[0.06] bg-gray-50/70 focus:bg-white text-xs focus:outline-none focus:border-[#06372d] focus:ring-1 focus:ring-[#06372d]/20 shadow-2xs transition"
                />
              </div>
            </div>

            {/* Transmission Checkboxes */}
            <div className="space-y-3 pb-6 border-b border-black/[0.04]">
              <h3 className="text-xs font-bold text-gray-800">Transmission</h3>
              <div className="space-y-2 text-xs">
                {['Automatic', 'Manual'].map((trans) => (
                  <label key={trans} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={transmissions.includes(trans)}
                      onChange={() => toggleTransmission(trans)}
                      className="w-4 h-4 rounded text-[#06372d] focus:ring-[#06372d] border-gray-300 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-black font-medium">{trans}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seats Pills: 2+, 4+, 5+, 7+ */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-800">Seats</h3>
              <div className="flex flex-wrap gap-2">
                {['2+', '4+', '5+', '7+'].map((seats) => {
                  const isSelected = selectedSeats === seats;
                  return (
                    <button
                      key={seats}
                      type="button"
                      onClick={() => setSelectedSeats(isSelected ? null : seats)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-[#06372d] text-white border-[#06372d] shadow-xs'
                          : 'bg-white text-gray-700 border-black/[0.06] shadow-2xs hover:border-black/20'
                      }`}
                    >
                      {seats}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">
                {filteredVehicles.length.toString().padStart(2, '0')} cars available
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Totals shown in USDC for {durationHours} hrs
              </p>
            </div>

            {filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-12 text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No cars match your filters</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try clearing your location, price, or category filters to see all available peer-to-peer vehicles.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 bg-[#06372d] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#09473b] transition shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset all filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((car) => {
                  const isSaved = savedVehicleIds.includes(car.id);
                  const totalForDuration = (car.hourlyRate * durationHours).toFixed(2);
                  const carTitle = car.name || `${car.make} ${car.model}`;

                  return (
                    <div
                      key={car.id}
                      onClick={() => handleSelectVehicle(car)}
                      className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        <img
                          src={car.images?.[0] || car.image || '/cars/gwagon.jpg'}
                          alt={carTitle}
                          onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Category badge inside photo at bottom-left */}
                        <div className="absolute bottom-2.5 left-2.5 bg-white text-gray-900 font-semibold text-[11px] px-2.5 py-0.5 rounded-md shadow-xs border border-black/[0.04]">
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
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {car.location || `${car.distanceKm || '1.2'} km away`}
                          </span>
                        </div>

                        {/* Row 2: seats · rating · trips */}
                        <div className="text-xs text-gray-500">
                          {car.specs?.seats || 5} seats · ★ {car.rating ? Number(car.rating).toFixed(1) : '5.0'} · {car.tripsCount || car.reviewsCount || 18} trips
                        </div>

                        {/* Row 3: Left has hourly rate, Right has total for durationHours */}
                        <div className="pt-2 flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1 text-sm">
                            <span className="font-bold text-gray-950 font-mono">
                              {Number(car.hourlyRate || 25).toFixed(2)} USDC
                            </span>
                            <span className="text-xs text-gray-500">/hr</span>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-sm text-gray-950 font-mono">
                              {totalForDuration} USDC
                            </div>
                            <div className="text-[11px] text-gray-400">
                              total for {durationHours} hrs
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
