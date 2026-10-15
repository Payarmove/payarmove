import React from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, ArrowLeft, Paintbrush } from 'lucide-react';

export default function SavedCarsView() {
  const { vehicles, savedVehicleIds, toggleSaveVehicle, navigateTo, setSelectedVehicle } = useApp();

  const savedCars = vehicles.filter((v) => savedVehicleIds.includes(v.id));

  const handleSelectCar = (car) => {
    setSelectedVehicle(car);
    navigateTo('vehicle-detail');
  };

  return (
    <div className="min-h-screen bg-[#f7f8f8] pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Mobile Header (Matches My rentals.png Artboard 9) */}
        <div className="md:hidden flex items-center gap-2 pb-2">
          <button
            onClick={() => navigateTo('explore')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-800 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Saved rentals</span>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between pb-2">
          <div>
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">Saved</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Cars you have bookmarked for upcoming trips.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-700 bg-white border border-black/[0.06] px-3.5 py-1.5 rounded-full shadow-2xs">
            {savedCars.length} saved
          </span>
        </div>

        {/* Empty State */}
        {savedCars.length === 0 ? (
          <div className="py-12 flex justify-center">
            <div className="bg-white rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center justify-between space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/[0.04] max-w-sm w-full">
              <div className="w-12 h-12 rounded-full border border-emerald-900/10 text-[#06372d] flex items-center justify-center bg-gray-50 shadow-2xs">
                <Paintbrush className="w-5 h-5 stroke-[1.5]" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-gray-900">
                  No saved cars yet
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                  Tap the heart on a car to keep it here
                </p>
              </div>

              <div className="w-full pt-4">
                <button
                  onClick={() => navigateTo('explore')}
                  style={{ backgroundColor: '#06372d' }}
                  className="w-full py-2.5 rounded-full text-white font-semibold text-xs hover:opacity-95 transition shadow-xs"
                >
                  Explore cars
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedCars.map((car) => (
              <div
                key={car.id}
                onClick={() => handleSelectCar(car)}
                className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition duration-200 cursor-pointer group flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={car.images?.[0] || car.image || '/cars/gwagon.jpg'}
                    alt={car.name || `${car.make} ${car.model}`}
                    onError={(e) => { e.currentTarget.src = '/cars/gwagon.jpg'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Category badge */}
                  <div className="absolute bottom-2.5 left-2.5 bg-white text-gray-900 font-semibold text-[11px] px-2.5 py-0.5 rounded-md shadow-xs border border-black/[0.04]">
                    {car.category || 'Luxury'}
                  </div>

                  {/* Teal filled heart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveVehicle(car.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition shadow-xs border border-black/[0.05] text-[#06372d]"
                    title="Remove from saved"
                  >
                    <Heart className="w-4 h-4 fill-[#06372d] text-[#06372d]" />
                  </button>
                </div>

                {/* Car info text rows */}
                <div className="p-4 space-y-1.5">
                  {/* Row 1: Car model on left, location on right */}
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#06372d] transition">
                      {car.name || `${car.make} ${car.model}`}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {car.location || `${car.distanceKm || '1.2'} km away`}
                    </span>
                  </div>

                  {/* Row 2: seats · rating · trips */}
                  <div className="text-xs text-gray-500">
                    {car.specs?.seats || 5} seats · ★ {car.rating ? Number(car.rating).toFixed(1) : '5.0'} · {car.tripsCount || car.reviewsCount || 18} trips
                  </div>

                  {/* Row 3: Hourly rate and total for 26 hrs */}
                  <div className="pt-1 flex items-baseline justify-between text-xs">
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-gray-950 font-mono text-sm">
                        {Number(car.hourlyRate || 25).toFixed(2)} USDC
                      </span>
                      <span className="text-gray-500">/hr</span>
                    </div>
                    <div className="text-right text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-800">
                        {(Number(car.hourlyRate || 25) * 26).toFixed(2)} USDC
                      </span>{' '}
                      total for 26 hrs
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
