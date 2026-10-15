import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import api, { apiConfig } from '../services/api';
import {
  connectWallet,
  disconnectWallet as disconnectStellarWallet,
  initStellarKit,
  fetchStellarBalance,
  fundWithFriendbot,
} from '../services/stellarWallet';

const AppContext = createContext(null);

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const apiBase = apiConfig.getBaseUrl();
  const domain = apiBase.replace(/\/api\/v[0-9].*$/, '');
  return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
};

export function AppProvider({ children }) {
  const getParam = (key, defaultVal) => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get(key) || defaultVal;
    }
    return defaultVal;
  };

  const [currentView, setCurrentView] = useState(() => getParam('view', 'explore'));
  const [mode, setMode] = useState(() => getParam('mode', 'renter')); // 'renter' | 'host' | 'admin'
  const [previewDevice, setPreviewDevice] = useState(() => getParam('device', 'responsive'));
  const [checkoutStep, setCheckoutStep] = useState(() => getParam('step', 'connect'));

  // Reactive listener for browser Back and Forward navigation buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const urlView = p.get('view') || 'explore';
      const urlMode = p.get('mode') || 'renter';
      const urlStep = p.get('step') || 'connect';
      setCurrentView(urlView);
      setMode(urlMode);
      setCheckoutStep(urlStep);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Configurable API base URL state
  const [apiBaseUrl, setApiBaseUrlState] = useState(() => apiConfig.getBaseUrl());
  const updateApiBaseUrl = (newUrl) => {
    apiConfig.setBaseUrl(newUrl);
    setApiBaseUrlState(apiConfig.getBaseUrl());
  };

  // Search parameters & timeline
  const [searchQuery, setSearchQuery] = useState({
    location: '',
    pickupDate: '2026-10-14',
    dropoffDate: '2026-10-15',
    pickupTime: '09:00',
    dropoffTime: '11:00',
    durationHours: 26,
    vehicleType: 'All',
    priceRange: [20, 150],
  });

  // Timeline & booking duration updater
  const updateTimeline = useCallback(({ pickupDate, dropoffDate, pickupTime, dropoffTime, location, durationHours }) => {
    setSearchQuery((prev) => {
      const pDate = pickupDate !== undefined ? pickupDate : (prev.pickupDate || '2026-10-14');
      let dDate = dropoffDate !== undefined ? dropoffDate : (prev.dropoffDate || '2026-10-15');
      const pTime = pickupTime !== undefined ? pickupTime : (prev.pickupTime || '09:00');
      let dTime = dropoffTime !== undefined ? dropoffTime : (prev.dropoffTime || '11:00');
      const loc = location !== undefined ? location : prev.location;

      let hours = durationHours !== undefined ? Number(durationHours) : null;
      if (!hours || isNaN(hours) || hours <= 0) {
        try {
          const start = new Date(`${pDate}T${pTime}`);
          const end = new Date(`${dDate}T${dTime}`);
          const diffMs = end.getTime() - start.getTime();
          const calcHours = Math.round(diffMs / (1000 * 60 * 60));
          hours = calcHours > 0 ? calcHours : 1;
        } catch (_) {
          hours = 24;
        }
      } else {
        // If durationHours is explicitly given and dropoff was not explicitly specified, calculate dropoff
        if (dropoffDate === undefined && dropoffTime === undefined) {
          try {
            const start = new Date(`${pDate}T${pTime}`);
            const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
            const pad = (n) => String(n).padStart(2, '0');
            dDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
            dTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
          } catch (_) {}
        }
      }

      return {
        ...prev,
        location: loc,
        pickupDate: pDate,
        dropoffDate: dDate,
        pickupTime: pTime,
        dropoffTime: dTime,
        durationHours: hours,
      };
    });
  }, []);

  // Robust Default Fleet Vehicles (Instant display, resilient to network latency)
  const defaultFleetVehicles = useMemo(() => [
    {
      id: '398bcb3d-34d6-4cc1-8013-cb4cf5443b93',
      make: 'Range Rover',
      model: 'Sport Dynamic',
      make_model: 'Range Rover Sport Dynamic',
      name: 'Range Rover Sport Dynamic',
      category: 'Luxury',
      type: 'Luxury',
      registration_number: 'KDJ 101L',
      year: 2024,
      hourlyRate: 35,
      dailyRate: 150,
      securityDeposit: 300,
      rating: 5.0,
      reviewsCount: 19,
      tripsCount: 42,
      location: 'Muthaiga, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/rangerover_sport.jpg',
      images: ['/cars/rangerover_sport.jpg', '/cars/gwagon.jpg', '/cars/mercedes_gle.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Gasoline' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', 'GPS Telemetry & Geo-fencing', 'Apple CarPlay & Android Auto'],
      rules: ['No smoking or pets inside vehicle', 'Return clean with matching fuel tank', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
    {
      id: '051261af-e81d-4099-be00-ba931773dbf4',
      make: 'BMW',
      model: 'X5 xDrive40i',
      make_model: 'BMW X5 xDrive40i',
      name: 'BMW X5 xDrive40i',
      category: 'SUV',
      type: 'SUV',
      registration_number: 'KDH 204B',
      year: 2024,
      hourlyRate: 30,
      dailyRate: 130,
      securityDeposit: 250,
      rating: 4.9,
      reviewsCount: 14,
      tripsCount: 31,
      location: 'Gigiri, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/bmw_x5.jpg',
      images: ['/cars/bmw_x5.jpg', '/cars/gwagon.jpg', '/cars/rangerover_sport.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Gasoline' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', 'GPS Telemetry & Geo-fencing', 'Panoramic Sunroof'],
      rules: ['No smoking or pets inside vehicle', 'Return clean with matching fuel tank', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
    {
      id: '4fff8548-ba01-4864-aa59-685ba5c3b2d4',
      make: 'Mercedes-Benz',
      model: 'G-Class G63 AMG',
      make_model: 'Mercedes-Benz G-Class G63 AMG',
      name: 'Mercedes-Benz G-Class G63 AMG',
      category: 'SUV',
      type: 'SUV',
      registration_number: 'KDA 777G',
      year: 2024,
      hourlyRate: 50,
      dailyRate: 250,
      securityDeposit: 500,
      rating: 5.0,
      reviewsCount: 28,
      tripsCount: 65,
      location: 'Westlands, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/gwagon.jpg',
      images: ['/cars/gwagon.jpg', '/cars/mercedes_gle.jpg', '/cars/porsche_macan.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Gasoline' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', 'GPS Telemetry & Geo-fencing', 'Burmester 3D Surround'],
      rules: ['No smoking or pets inside vehicle', 'Return clean with matching fuel tank', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
    {
      id: '202a6078-3b4b-4532-86c7-2ccf6f012956',
      make: 'Mercedes-Benz',
      model: 'GLE 450 Coupe',
      make_model: 'Mercedes-Benz GLE 450 Coupe',
      name: 'Mercedes-Benz GLE 450 Coupe',
      category: 'SUV',
      type: 'SUV',
      registration_number: 'KDJ 332M',
      year: 2024,
      hourlyRate: 35,
      dailyRate: 140,
      securityDeposit: 280,
      rating: 4.9,
      reviewsCount: 16,
      tripsCount: 38,
      location: 'Kilimani, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/mercedes_gle.jpg',
      images: ['/cars/mercedes_gle.jpg', '/cars/gwagon.jpg', '/cars/porsche_macan.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Gasoline' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', 'GPS Telemetry & Geo-fencing', 'MBUX Navigation'],
      rules: ['No smoking or pets inside vehicle', 'Return clean with matching fuel tank', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
    {
      id: 'a725843e-9c2d-41ac-848c-94063cf44d8f',
      make: 'Porsche',
      model: 'Macan GTS',
      make_model: 'Porsche Macan GTS',
      name: 'Porsche Macan GTS',
      category: 'SUV',
      type: 'SUV',
      registration_number: 'KDC 909P',
      year: 2024,
      hourlyRate: 40,
      dailyRate: 160,
      securityDeposit: 320,
      rating: 5.0,
      reviewsCount: 22,
      tripsCount: 49,
      location: 'Karen, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/porsche_macan.jpg',
      images: ['/cars/porsche_macan.jpg', '/cars/mercedes_gle.jpg', '/cars/gwagon.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Gasoline' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', 'Sport Chrono Package', 'Bose Surround Sound'],
      rules: ['No smoking or pets inside vehicle', 'Return clean with matching fuel tank', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
    {
      id: '34a36f8d-9974-47e2-9e06-058549b8f305',
      make: 'Jeep',
      model: 'Wrangler Rubicon 4xe',
      make_model: 'Jeep Wrangler Rubicon 4xe',
      name: 'Jeep Wrangler Rubicon 4xe',
      category: 'SUV',
      type: 'SUV',
      registration_number: 'KDF 404J',
      year: 2024,
      hourlyRate: 28,
      dailyRate: 120,
      securityDeposit: 240,
      rating: 4.8,
      reviewsCount: 11,
      tripsCount: 25,
      location: 'Lavington, Nairobi, Kenya',
      pickup_instructions: 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
      image: '/cars/jeep_wrangler.jpg',
      images: ['/cars/jeep_wrangler.jpg', '/cars/bmw_x5.jpg', '/cars/gwagon.jpg'],
      specs: { seats: 5, doors: 4, transmission: 'Automatic', fuelType: 'Plug-in Hybrid' },
      features: ['Stellar Micro-Payment Unlock', 'Verified Insurance Logbook', '4x4 Rock-Trac Full-Time', 'Removable Freedom Top'],
      rules: ['No smoking inside vehicle', 'Return clean with matching fuel/charge', 'Mileage limit: 200 miles/day ($0.50/mile after)'],
      host: { name: 'Marcus Host', email: 'host@payarmove.com', rating: 5.0, stellarAddress: 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK' },
      isSaved: false,
    },
  ], []);

  // Loading state for vehicle queries
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Vehicle listings: Cached or resilient fallback, updated via live API
  const [vehicles, setVehicles] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('payarmove_cached_vehicles');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return defaultFleetVehicles;
  });
  const [selectedVehicle, setSelectedVehicle] = useState(() => vehicles[0] || null);

  // Persistent Saved Vehicle IDs from localStorage
  const [savedVehicleIds, setSavedVehicleIds] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('payarmove_saved_vehicle_ids');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (savedVehicleIds && savedVehicleIds.length > 0) {
        localStorage.setItem('payarmove_saved_vehicle_ids', JSON.stringify(savedVehicleIds));
      } else {
        localStorage.removeItem('payarmove_saved_vehicle_ids');
      }
    }
  }, [savedVehicleIds]);

  // Rentals (real data from database)
  const [rentals, setRentals] = useState([]);
  const [selectedRentalId, setSelectedRentalId] = useState('');

  // Host state
  const [hostVehicles, setHostVehicles] = useState([]);

  // Admin state
  const [adminPayments, setAdminPayments] = useState([]);
  const [selectedAdminPaymentId, setSelectedAdminPaymentId] = useState('');
  const [adminLedgers, setAdminLedgers] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [hostMetrics, setHostMetrics] = useState(null);
  const [hostPayouts, setHostPayouts] = useState([]);
  const [profileTab, setProfileTab] = useState('profile');
  const [rentalsTab, setRentalsTab] = useState('active');
  const [hostAccountTab, setHostAccountTab] = useState('profile');

  // Clean guest user state
  const defaultGuestUser = {
    isLoggedIn: false,
    id: null,
    name: '',
    email: '',
    username: '',
    phone: '',
    role: 'renter',
    kycTier: 'TIER0',
    walletAddress: null,
    walletShort: '',
    balanceUSDC: 0,
    balanceXLM: 0,
    balanceFormatted: '0.00 USDC',
    avatar: '/default-avatar.svg',
    memberSince: '2026',
    verifiedLicense: false,
  };

  // User & Wallet: Persistent state from localStorage (NO mock/placeholder data)
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('payarmove_user_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Purge stale test user sessions or dummy auto-generated accounts
          if (
            parsed?.username === 'alex_renter' ||
            parsed?.email === 'renter@payarmove.com' ||
            parsed?.email?.includes('gc2r34kl') ||
            parsed?.email?.includes('stellar.payarmove.com') ||
            parsed?.walletAddress === 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT'
          ) {
            localStorage.removeItem('payarmove_user_session');
            localStorage.removeItem('payarmove_connected_wallet');
            localStorage.removeItem('payarmove_access_token');
            localStorage.removeItem('payarmove_refresh_token');
            return defaultGuestUser;
          }
          if (parsed && parsed.isLoggedIn) {
            return {
              isLoggedIn: Boolean(parsed.isLoggedIn),
              id: parsed.id || null,
              name: parsed.name || parsed.username || '',
              email: parsed.email || '',
              username: parsed.username || '',
              phone: parsed.phone || parsed.phone_number || '',
              role: (parsed.role || 'renter').toLowerCase(),
              kycTier: parsed.kycTier || parsed.kyc_tier || 'TIER0',
              walletAddress: parsed.walletAddress || parsed.primary_stellar_address || null,
              walletShort: parsed.walletShort || (parsed.walletAddress ? `${parsed.walletAddress.slice(0, 4)}...${parsed.walletAddress.slice(-4)}` : ''),
              balanceUSDC: parsed.balanceUSDC || 0,
              balanceXLM: parsed.balanceXLM || 0,
              balanceFormatted: parsed.balanceFormatted || '0.00 USDC',
              avatar: parsed.avatar || '/default-avatar.svg',
              memberSince: '2026',
              verifiedLicense: (parsed.kycTier || parsed.kyc_tier) === 'TIER2',
            };
          }
        }
      } catch (e) {}
    }
    return defaultGuestUser;
  });

  // Persistent Connected Wallet from localStorage
  const [connectedWallet, setConnectedWallet] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('payarmove_connected_wallet');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.address && parsed.address !== 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT') {
            return parsed;
          } else if (parsed?.address === 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT') {
            localStorage.removeItem('payarmove_connected_wallet');
            return null;
          }
        }
        const userSaved = localStorage.getItem('payarmove_user_session');
        if (userSaved) {
          const parsedUser = JSON.parse(userSaved);
          if (parsedUser?.walletAddress) {
            return {
              name: 'Freighter',
              address: parsedUser.walletAddress,
              balance: parsedUser.balanceFormatted || '0.00 USDC',
              xlm: parsedUser.balanceXLM || 0,
              usdc: parsedUser.balanceUSDC || 0,
              isUnfunded: false,
            };
          }
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Auto-sync persistent wallet and user state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (connectedWallet) {
        localStorage.setItem('payarmove_connected_wallet', JSON.stringify(connectedWallet));
      } else {
        localStorage.removeItem('payarmove_connected_wallet');
      }
    }
  }, [connectedWallet]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user.isLoggedIn) {
        localStorage.setItem('payarmove_user_session', JSON.stringify(user));
      } else {
        localStorage.removeItem('payarmove_user_session');
      }
    }
  }, [user]);

  // On mount: refresh live on-chain balance for persisted wallet
  useEffect(() => {
    if (connectedWallet?.address) {
      fetchStellarBalance(connectedWallet.address).then((freshBal) => {
        setConnectedWallet((prev) =>
          prev
            ? {
                ...prev,
                balance: freshBal.formatted,
                xlm: freshBal.xlm,
                usdc: freshBal.usdc,
                isUnfunded: freshBal.unfunded,
              }
            : null
        );
        setUser((prev) => ({
          ...prev,
          balanceUSDC: freshBal.usdc,
          balanceXLM: freshBal.xlm,
          balanceFormatted: freshBal.formatted,
        }));
      });
    }
  }, []);

  // Fetch backend data & sync real database state with UI
  const refreshBackendData = useCallback(async () => {
    setIsLoadingVehicles(true);
    let currentFleet = [];
    try {
      // 1. Fetch real mobility vehicles from backend database
      const backendVehicles = await api.rentals.getVehicles().catch((err) => {
        console.warn('API getVehicles error:', err);
        return null;
      });

      const cleanImg = (url) => {
        if (!url || typeof url !== 'string') return '/cars/gwagon.jpg';
        if (
          url.includes('localhost:5173') ||
          url.includes('127.0.0.1:5173') ||
          url.includes('localhost:8000') ||
          url.includes('127.0.0.1:8000')
        ) {
          return url.replace(/^https?:\/\/[^/]+/, '');
        }
        return url;
      };

      if (backendVehicles && Array.isArray(backendVehicles.results || backendVehicles)) {
        const list = backendVehicles.results || backendVehicles;
        if (list.length > 0) {
          const formatted = list.map((v) => {
            const makePart = v.make_model ? v.make_model.split(' ')[0] : 'Vehicle';
            const modelPart = v.make_model ? v.make_model.split(' ').slice(1).join(' ') : '';
            const rawImages = (v.images && Array.isArray(v.images) && v.images.length > 0)
              ? v.images
              : [v.image_url || '/cars/gwagon.jpg', '/cars/mercedes_gle.jpg', '/cars/porsche_macan.jpg'];
            const carImages = rawImages.map(cleanImg);
            const mainImg = cleanImg(v.image_url) || carImages[0];

            return {
              id: v.id,
              make: makePart,
              model: modelPart,
              make_model: v.make_model,
              name: v.make_model,
              category: v.category || 'SUV',
              type: v.category || 'SUV',
              registration_number: v.registration_number,
              licensePlate: v.registration_number,
              year: v.year || 2024,
              hourlyRate: Number(v.hourly_rate_usdc) || Math.round(Number(v.daily_rate_usdc) / 24) || 25,
              dailyRate: Number(v.daily_rate_usdc) || 100,
              securityDeposit: Number(v.deposit_amount_usdc) || 200,
              rating: Number(v.rating) || 5.0,
              reviewsCount: v.reviews_count || 14,
              tripsCount: v.trips_count || 28,
              location: v.location || 'Nairobi, Kenya',
              pickup_instructions: v.pickup_instructions || 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
              image: mainImg,
              images: carImages,
              specs: {
                seats: v.seats || 5,
                doors: v.doors || 4,
                transmission: v.transmission || 'Automatic',
                fuelType: v.fuel_type || 'Gasoline',
              },
              features: (v.features && Array.isArray(v.features) && v.features.length > 0)
                ? v.features
                : [
                    'Stellar Micro-Payment Unlock',
                    'Verified Insurance Logbook',
                    'GPS Telemetry & Geo-fencing',
                    'Apple CarPlay & Android Auto',
                  ],
              rules: (v.rules && Array.isArray(v.rules) && v.rules.length > 0)
                ? v.rules
                : [
                    'No smoking or pets inside vehicle',
                    'Return clean with matching fuel tank',
                    'Mileage limit: 200 miles/day ($0.50/mile after)',
                  ],
              host: {
                name: v.host_name || (v.host_email ? v.host_email.split('@')[0] : 'Verified Host'),
                email: v.host_email,
                rating: 5.0,
                stellarAddress: v.host_stellar_address || '',
              },
              isSaved: Boolean(v.is_saved),
            };
          });
          currentFleet = formatted;
          setVehicles(formatted);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('payarmove_cached_vehicles', JSON.stringify(formatted));
            } catch (_) {}
          }
          setSelectedVehicle((prev) => (prev ? formatted.find((f) => f.id === prev.id) || formatted[0] : formatted[0]));

          // Initially clear or hold host vehicles until user identity is resolved
          setHostVehicles((prev) => prev);
        }
      }

      // Sync saved vehicles with backend immediately when authenticated
      if (api.tokens.isAuthenticated()) {
        try {
          const localSavedRaw = localStorage.getItem('payarmove_saved_vehicle_ids');
          const localSaved = localSavedRaw ? JSON.parse(localSavedRaw) : [];
          if (Array.isArray(localSaved) && localSaved.length > 0) {
            const syncRes = await api.rentals.syncSavedVehicles(localSaved).catch(() => null);
            if (syncRes?.saved_vehicle_ids && Array.isArray(syncRes.saved_vehicle_ids)) {
              setSavedVehicleIds(syncRes.saved_vehicle_ids);
              if (syncRes.saved_vehicle_ids.length > 0) {
                localStorage.setItem('payarmove_saved_vehicle_ids', JSON.stringify(syncRes.saved_vehicle_ids));
              } else {
                localStorage.removeItem('payarmove_saved_vehicle_ids');
              }
            }
          } else {
            const savedRes = await api.rentals.getSavedVehicles().catch(() => null);
            if (savedRes && Array.isArray(savedRes.results || savedRes)) {
              const sList = savedRes.results || savedRes;
              const ids = sList.map((item) => item.vehicle?.id || item.vehicle_id).filter(Boolean);
              setSavedVehicleIds(ids);
              if (ids.length > 0) {
                localStorage.setItem('payarmove_saved_vehicle_ids', JSON.stringify(ids));
              } else {
                localStorage.removeItem('payarmove_saved_vehicle_ids');
              }
            }
          }
        } catch (e) {
          console.warn('Saved vehicles sync error:', e);
        }
      }

      // 2. Fetch authenticated profile if JWT token exists
      if (api.tokens.isAuthenticated()) {
        const profile = await api.auth.getProfile().catch(() => null);
        if (profile) {
          const address = profile.primary_stellar_address || connectedWallet?.address;
          if (!profile.primary_stellar_address && connectedWallet?.address) {
            api.auth.updateProfile({ primary_stellar_address: connectedWallet.address }).catch(() => null);
          }
          const shortAddr = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

          // Fetch real on-chain balance from Horizon
          let balData = { usdc: 0, xlm: 0, formatted: '0.00 USDC' };
          if (address) {
            balData = await fetchStellarBalance(address);
            setConnectedWallet({
              name: 'Freighter',
              address: address,
              balance: balData.formatted,
              xlm: balData.xlm,
              usdc: balData.usdc,
              isUnfunded: balData.unfunded,
            });
          }

          // Resolve avatar cleanly preserving backend uploads
          let resolvedAvatar = profile.avatar_url || profile.avatar;
          if (resolvedAvatar && resolvedAvatar.startsWith('/media/')) {
            resolvedAvatar = getMediaUrl(resolvedAvatar);
          }
          if (!resolvedAvatar) {
            try {
              const localSession = JSON.parse(localStorage.getItem('payarmove_user_session') || '{}');
              resolvedAvatar = localSession?.avatar;
            } catch (e) {}
          }
          if (!resolvedAvatar) {
            resolvedAvatar = '/default-avatar.svg';
          }

          const resolvedName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || profile.email.split('@')[0];

          const isSuperuserAccount = Boolean(
            profile.is_superuser ||
            profile.is_staff ||
            (profile.role && profile.role.toUpperCase() === 'ADMIN')
          );
          const resolvedRole = isSuperuserAccount
            ? 'admin'
            : (profile.role?.toLowerCase() || 'renter');

          setUser((prev) => ({
            ...prev,
            isLoggedIn: true,
            email: profile.email,
            name: resolvedName,
            username: profile.username || profile.email.split('@')[0],
            phone: profile.phone_number || prev.phone || '',
            role: resolvedRole,
            isSuperuser: isSuperuserAccount,
            isStaff: Boolean(profile.is_staff),
            kycTier: profile.kyc_tier || prev.kycTier || 'TIER1',
            walletAddress: address,
            walletShort: shortAddr,
            balanceUSDC: balData.usdc,
            balanceXLM: balData.xlm,
            balanceFormatted: balData.formatted,
            avatar: resolvedAvatar,
            memberSince: '2026',
            verifiedLicense: profile.kyc_tier === 'TIER2',
          }));

          // 3. Fetch real user rentals from database
          const backendRentals = await api.rentals.getRentals().catch(() => null);
          if (backendRentals && Array.isArray(backendRentals.results || backendRentals)) {
            const rawList = backendRentals.results || backendRentals;
            const confirmedVehicleIds = new Set(
              rawList
                .filter((r) => ['CONFIRMED', 'ACTIVE'].includes(r.status))
                .map((r) => r.vehicle?.id)
                .filter(Boolean)
            );
            const rList = rawList.filter(
              (r) => !(r.status === 'AWAITING_PAYMENT' && confirmedVehicleIds.has(r.vehicle?.id))
            );
            const mapped = rList.map((r) => ({
              id: r.rental_code,
              rentalId: r.rental_code,
              dbId: r.id,
              vehicleId: r.vehicle?.id,
              vehicle: r.vehicle?.make_model,
              vehicleName: r.vehicle?.make_model,
              year: 2024,
              licensePlate: r.vehicle?.registration_number,
              pickupLocation: r.vehicle?.location || 'Nairobi, Kenya',
              pickupDate: r.start_date,
              pickupTime: r.start_time || '09:00',
              dropoffDate: r.end_date,
              returnDate: r.end_date,
              returnTime: r.end_time || '11:00',
              durationHours: Number(r.total_hours) || (r.total_days || 1) * 24,
              ratePerHour: Number(r.vehicle?.hourly_rate_usdc) || (Number(r.total_hours) > 0 ? Math.round(Number(r.rental_amount_usdc) / Number(r.total_hours)) : 25),
              rentalFee: Number(r.rental_amount_usdc),
              platformFee: 0.0,
              securityDeposit: Number(r.deposit_amount_usdc),
              totalPaid: Number(r.total_due_usdc),
              currency: 'USDC',
              status: (r.status === 'ACTIVE' || r.status === 'CONFIRMED') ? 'Active' : r.status === 'COMPLETED' ? 'Completed' : 'Awaiting Payment',
              rawStatus: r.status,
              stellarTxHash: r.stellarTxHash || r.escrow?.deposit_tx_hash || '4f9b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742d8d8',
              image: r.vehicle?.image_url || '/cars/gwagon.jpg',
              vehiclePhoto: r.vehicle?.image_url || '/cars/gwagon.jpg',
              hostEmail: r.host?.email,
              hostName: r.host?.username || r.host?.email?.split('@')[0] || 'Host',
              hostPhone: '+254 722 334 455',
              renterEmail: r.renter?.email,
              renterName: r.renter?.first_name || r.renter?.username || r.renter?.email?.split('@')[0] || 'Guest Renter',
              renterWallet: r.renter?.primary_stellar_address,
              isHostRental: Boolean(r.host?.email && profile?.email && r.host.email.toLowerCase() === profile.email.toLowerCase()),
              grossAmount: Number(r.rental_amount_usdc || 0),
              netPayout: (Number(r.rental_amount_usdc || 0) * 0.9).toFixed(2),
              platformFeeAmount: (Number(r.rental_amount_usdc || 0) * 0.1).toFixed(2),
              smartLockCode: '8921-MOVE',
              timeRemaining: '38h 40m',
            }));
            setRentals(mapped);
            if (mapped.length > 0) {
              setSelectedRentalId((prev) => (prev ? prev : ''));
            }

            // Map into admin payments
            setAdminPayments(
              mapped.map((m) => ({
                id: m.id,
                paymentId: `PM-PAY-${(m.rentalId || m.id).replace('PM-', '').replace('RENT-', '')}`,
                rentalId: m.rentalId || m.id,
                vehicle: m.vehicle || m.vehicleName,
                vehicleName: m.vehicle || m.vehicleName,
                renter: m.renterName || m.renterEmail?.split('@')[0] || 'Guest Renter',
                renterName: m.renterName || m.renterEmail?.split('@')[0] || 'Guest Renter',
                renterEmail: m.renterEmail,
                host: m.hostName || m.hostEmail?.split('@')[0] || 'Verified Host',
                hostName: m.hostName || m.hostEmail?.split('@')[0] || 'Verified Host',
                hostEmail: m.hostEmail,
                renterAddress: m.renterWallet || 'Stellar Account',
                hostAddress: m.hostWallet || 'Stellar Account',
                amount: `${Number(m.totalPaid || 0).toFixed(2)} USDC`,
                grossAmount: `${Number(m.rentalFee || 0).toFixed(2)} USDC`,
                platformFee: `${Number(m.platformFee || 35).toFixed(2)} USDC`,
                hostAmount: `${(Number(m.rentalFee || 0) * 0.9).toFixed(2)} USDC`,
                securityDeposit: `${Number(m.securityDeposit || 0).toFixed(2)} USDC`,
                currency: 'USDC',
                status: m.status === 'Active' || m.status === 'Completed' ? 'Paid' : m.status,
                rawStatus: m.rawStatus,
                payout: m.status === 'Completed' ? 'Paid' : 'Owed',
                escrowStatus: m.status === 'Active' ? 'Locked (Contract)' : m.status === 'Completed' ? 'Disbursed' : 'Awaiting Deposit',
                contractAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                txHash: m.stellarTxHash,
                timestamp: m.pickupDate,
              }))
            );
            if (mapped.length > 0) {
              setSelectedAdminPaymentId((prev) => prev || mapped[0].id);
            }
          }

          // 4. Admin metrics and payouts (loaded for any admin or superuser)
          if (isSuperuserAccount) {
            const adminSummary = await api.dashboard.getAdminSummary().catch(() => null);
            if (adminSummary) setAdminMetrics(adminSummary);

            const payoutsRes = await api.payouts.list().catch(() => null);
            if (payoutsRes && Array.isArray(payoutsRes.results || payoutsRes)) {
              const pList = payoutsRes.results || payoutsRes;
              setAdminLedgers(
                pList.map((p) => ({
                  id: p.id,
                  rentalId: p.rental_code,
                  vehicleName: p.vehicle_name,
                  renter: p.renter_name || p.renter_email?.split('@')[0] || 'Guest Renter',
                  host: p.host_name || p.host_email?.split('@')[0] || 'Verified Host',
                  grossAmount: `${Number(p.gross_rental_usdc || 0).toFixed(2)} USDC`,
                  platformFee: `${Number(p.platform_fee_usdc || 0).toFixed(2)} USDC`,
                  hostPayout: `${Number(p.net_payout_usdc || 0).toFixed(2)} USDC`,
                  paymentStatus: ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(p.payment_status) ? 'Paid' : 'Pending',
                  payoutStatus: p.status === 'COMPLETED' ? 'Paid' : 'Owed',
                  status: p.status === 'COMPLETED' ? 'Settled' : 'Pending',
                  txHash: p.tx_hash ? (p.tx_hash.slice(0, 8) + '...' + p.tx_hash.slice(-6)) : 'Pending Settlement',
                  fullTxHash: p.tx_hash,
                  settledAt: p.settled_at || p.created_at,
                }))
              );
            }
          }

          // 5. Host vehicles (strictly only vehicles uploaded by this host)
          let hostVehiclesRaw = await api.rentals.getMyVehicles().catch(() => null);
          const poolVehicles = currentFleet.length > 0 ? currentFleet : vehicles;
          if (!Array.isArray(hostVehiclesRaw)) {
            hostVehiclesRaw = poolVehicles.filter((car) => {
              if (profile.email && car.host?.email) {
                return car.host.email.toLowerCase() === profile.email.toLowerCase();
              }
              if (address && car.host?.stellarAddress) {
                return car.host.stellarAddress === address;
              }
              return false;
            });
          }

          const myRentalsList = backendRentals && Array.isArray(backendRentals.results || backendRentals)
            ? (backendRentals.results || backendRentals)
            : [];

          setHostVehicles(
            hostVehiclesRaw.map((car) => {
              const carName = car.make_model || car.name || `${car.make || ''} ${car.model || ''}`.trim() || 'Vehicle';
              const isRented = myRentalsList.some(
                (r) => (r.vehicle?.id === car.id || r.vehicle?.make_model === carName) && (r.status === 'ACTIVE' || r.status === 'CONFIRMED')
              );
              const carImg = (car.images && car.images[0]) || car.image_url || car.image || '/cars/gwagon.jpg';
              return {
                id: car.id,
                make: car.make || (car.make_model ? car.make_model.split(' ')[0] : 'Vehicle'),
                model: car.model || (car.make_model ? car.make_model.split(' ').slice(1).join(' ') : ''),
                name: carName,
                year: car.year || 2024,
                licensePlate: car.registration_number || car.licensePlate || 'Registered',
                image: carImg,
                images: (car.images && car.images.length > 0) ? car.images : [carImg],
                hourlyRate: Number(car.hourly_rate_usdc || car.hourlyRate || 0),
                dailyRate: Number(car.daily_rate_usdc || car.dailyRate || 0),
                securityDeposit: Number(car.deposit_amount_usdc || car.securityDeposit || 0),
                location: car.location || 'Nairobi, Kenya',
                status: isRented ? 'Rented' : 'Available',
                currentRenter: null,
                totalEarnings: Number(car.totalEarnings || 0),
                tripsCount: car.trips_count || car.tripsCount || 0,
                rating: Number(car.rating || 5.0),
              };
            })
          );

          const effectiveRole = (profile.role || '').toUpperCase();
          if (effectiveRole === 'HOST' || effectiveRole === 'ADMIN' || mode === 'hosting' || hostVehiclesRaw.length > 0) {
            const hostSummary = await api.dashboard.getHostSummary().catch(() => null);
            if (hostSummary) setHostMetrics(hostSummary);

            const hostPayoutsRes = await api.payouts.list().catch(() => null);
            if (hostPayoutsRes && Array.isArray(hostPayoutsRes.results || hostPayoutsRes)) {
              setHostPayouts(hostPayoutsRes.results || hostPayoutsRes);
            }
          }
        }
      }
    } catch (err) {
      console.warn('API sync notice:', err);
    } finally {
      setIsLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    initStellarKit();
    refreshBackendData();
  }, [refreshBackendData]);

  // Connect Stellar Wallet with REAL on-chain data & backend authentication
  const handleConnectWallet = async (preferredWalletId = null) => {
    setIsWalletConnecting(true);
    setApiError(null);
    try {
      const result = await connectWallet(preferredWalletId, true);
      if (!result?.success || !result?.address) {
        setIsWalletConnecting(false);
        return { success: false, error: result?.error || 'Connection cancelled or no wallet found' };
      }

      const address = result.address;
      const shortAddr = `${address.slice(0, 4)}...${address.slice(-4)}`;

      // Fetch real balance from Horizon Testnet
      const realBal = await fetchStellarBalance(address);

      const walletObj = {
        name: result.wallet || 'Freighter',
        address: address,
        balance: realBal.formatted,
        xlm: realBal.xlm,
        usdc: realBal.usdc,
        isUnfunded: realBal.unfunded,
      };
      setConnectedWallet(walletObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem('payarmove_connected_wallet', JSON.stringify(walletObj));
      }

      // Check if user already exists for this wallet in backend DB
      let loginRes = null;
      try {
        loginRes = await api.auth.walletLogin(address);
      } catch (e) {
        loginRes = null;
      }

      if (loginRes?.success && loginRes?.user) {
        if (loginRes.tokens) {
          api.tokens.setTokens(loginRes.tokens.access, loginRes.tokens.refresh);
        }
        const dbUser = loginRes.user;
        const userObj = {
          isLoggedIn: true,
          id: dbUser.id,
          name: dbUser.first_name || dbUser.username || dbUser.email,
          email: dbUser.email,
          username: dbUser.username,
          phone: dbUser.phone_number || '',
          role: (dbUser.role || 'renter').toLowerCase(),
          kycTier: dbUser.kyc_tier || 'TIER1',
          walletAddress: address,
          walletShort: shortAddr,
          balanceUSDC: realBal.usdc,
          balanceXLM: realBal.xlm,
          balanceFormatted: realBal.formatted,
          avatar: dbUser.avatar_url || dbUser.avatar || '/default-avatar.svg',
          memberSince: '2026',
          verifiedLicense: dbUser.kyc_tier === 'TIER2',
        };
        setUser(userObj);
        if (typeof window !== 'undefined') {
          localStorage.setItem('payarmove_user_session', JSON.stringify(userObj));
        }
        await refreshBackendData();
        return { success: true, address, isNewUser: false, user: dbUser };
      } else {
        // Auto-setup account for new connected wallet
        const autoEmail = `${address.slice(0, 8).toLowerCase()}_${address.slice(-4).toLowerCase()}@stellar.payarmove.io`;
        const autoName = `User ${shortAddr}`;
        let setupRes = null;
        try {
          setupRes = await api.auth.walletSetup({
            public_key: address,
            name: autoName,
            email: autoEmail,
            role: 'RENTER',
          });
        } catch (e) {
          setupRes = null;
        }

        if (setupRes?.tokens && setupRes?.user) {
          api.tokens.setTokens(setupRes.tokens.access, setupRes.tokens.refresh);
          const dbUser = setupRes.user;
          const userObj = {
            isLoggedIn: true,
            id: dbUser.id,
            name: dbUser.first_name || autoName,
            email: dbUser.email,
            username: dbUser.username,
            phone: '',
            role: 'renter',
            kycTier: 'TIER1',
            walletAddress: address,
            walletShort: shortAddr,
            balanceUSDC: realBal.usdc,
            balanceXLM: realBal.xlm,
            balanceFormatted: realBal.formatted,
            avatar: dbUser.avatar_url || dbUser.avatar || '/default-avatar.svg',
            memberSince: '2026',
            verifiedLicense: false,
          };
          setUser(userObj);
          if (typeof window !== 'undefined') {
            localStorage.setItem('payarmove_user_session', JSON.stringify(userObj));
          }
          await refreshBackendData();
          return { success: true, address, isNewUser: true, user: dbUser };
        } else {
          const fallbackUser = {
            isLoggedIn: true,
            id: 'wallet-' + address.slice(0, 8),
            name: autoName,
            email: autoEmail,
            username: address.slice(0, 8).toLowerCase(),
            phone: '',
            role: 'renter',
            kycTier: 'TIER1',
            walletAddress: address,
            walletShort: shortAddr,
            balanceUSDC: realBal.usdc,
            balanceXLM: realBal.xlm,
            balanceFormatted: realBal.formatted,
            avatar: '/default-avatar.svg',
            memberSince: '2026',
            verifiedLicense: false,
          };
          setUser(fallbackUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('payarmove_user_session', JSON.stringify(fallbackUser));
          }
          return { success: true, address, isNewUser: true, user: fallbackUser };
        }
      }
    } catch (err) {
      console.warn('Wallet connection error:', err);
      return { success: false, error: err.message || 'Connection cancelled.' };
    } finally {
      setIsWalletConnecting(false);
    }
  };

  // Set up profile for connected wallet to complete sign up
  const completeWalletProfileSetup = async ({ name, email, phone, role }) => {
    if (!connectedWallet?.address) {
      throw new Error('Please connect your Stellar wallet first.');
    }
    const res = await api.auth.walletSetup({
      public_key: connectedWallet.address,
      name,
      email,
      phone_number: phone,
      role: (role || 'renter').toUpperCase(),
    });

    if (res?.tokens) {
      api.tokens.setTokens(res.tokens.access, res.tokens.refresh);
    }

    const dbUser = res.user;
    const shortAddr = `${connectedWallet.address.slice(0, 4)}...${connectedWallet.address.slice(-4)}`;
    const userObj = {
      isLoggedIn: true,
      id: dbUser.id,
      name: dbUser.first_name || dbUser.username || dbUser.email,
      email: dbUser.email,
      username: dbUser.username,
      phone: dbUser.phone_number || '',
      role: (dbUser.role || 'renter').toLowerCase(),
      kycTier: dbUser.kyc_tier || 'TIER1',
      walletAddress: connectedWallet.address,
      walletShort: shortAddr,
      balanceUSDC: connectedWallet.usdc || 0,
      balanceXLM: connectedWallet.xlm || 0,
      balanceFormatted: connectedWallet.balance || '0.00 USDC',
      avatar: (dbUser.avatar_url || dbUser.avatar ? (dbUser.avatar_url?.startsWith('/media/') ? getMediaUrl(dbUser.avatar_url) : (dbUser.avatar_url || dbUser.avatar)) : '/default-avatar.svg'),
      memberSince: '2026',
      verifiedLicense: false,
    };
    setUser(userObj);
    if (typeof window !== 'undefined') {
      localStorage.setItem('payarmove_user_session', JSON.stringify(userObj));
    }
    await refreshBackendData();
    return { success: true, user: dbUser };
  };

  // Disconnect wallet & clear sessions
  const handleDisconnectWallet = () => {
    disconnectStellarWallet();
    setConnectedWallet(null);
    api.tokens.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payarmove_connected_wallet');
      localStorage.removeItem('payarmove_user_session');
      localStorage.removeItem('payarmove_saved_vehicle_ids');
      localStorage.removeItem('payarmove_access_token');
      localStorage.removeItem('payarmove_refresh_token');
    }
    setUser(defaultGuestUser);
    setRentals([]);
    setSelectedRentalId('');
    setSelectedAdminPaymentId('');
    setSavedVehicleIds([]);
    setHostVehicles([]);
    setAdminPayments([]);
    setAdminLedgers([]);
    setAdminMetrics(null);
    setHostMetrics(null);
    setHostPayouts([]);
    switchMode('renter');
    navigateTo('explore');
  };

  // Friendbot faucet funding for the connected wallet
  const fundConnectedWallet = async () => {
    if (!connectedWallet?.address) return false;
    const ok = await fundWithFriendbot(connectedWallet.address);
    if (ok) {
      const updated = await fetchStellarBalance(connectedWallet.address);
      setConnectedWallet((prev) => ({
        ...prev,
        balance: updated.formatted,
        xlm: updated.xlm,
        usdc: updated.usdc,
        isUnfunded: false,
      }));
      setUser((prev) => ({
        ...prev,
        balanceUSDC: updated.usdc,
        balanceXLM: updated.xlm,
        balanceFormatted: updated.formatted,
      }));
    }
    return ok;
  };

  // Auth: Email/Password Login with immediate active wallet sync
  const loginUser = async (email, password) => {
    try {
      const res = await api.auth.signin({ email, password });
      if (res.tokens) {
        api.tokens.setTokens(res.tokens.access, res.tokens.refresh);
      }
      if (res.user) {
        const dbUser = res.user;
        const address = dbUser.primary_stellar_address || (dbUser.wallets && dbUser.wallets[0]?.public_key);
        const shortAddr = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';
        let balData = { usdc: 0, xlm: 0, formatted: '0.00 USDC', unfunded: false };
        if (address) {
          balData = await fetchStellarBalance(address);
          const walletObj = {
            name: 'Freighter',
            address: address,
            balance: balData.formatted,
            xlm: balData.xlm,
            usdc: balData.usdc,
            isUnfunded: balData.unfunded,
          };
          setConnectedWallet(walletObj);
          if (typeof window !== 'undefined') {
            localStorage.setItem('payarmove_connected_wallet', JSON.stringify(walletObj));
          }
        }
        const isSuper = Boolean(
          dbUser.is_superuser ||
          dbUser.is_staff ||
          (dbUser.role && dbUser.role.toUpperCase() === 'ADMIN')
        );
        const resolvedRole = isSuper ? 'admin' : (dbUser.role || 'renter').toLowerCase();

        const userObj = {
          isLoggedIn: true,
          id: dbUser.id,
          name: dbUser.first_name || dbUser.username || dbUser.email.split('@')[0],
          email: dbUser.email,
          username: dbUser.username,
          phone: dbUser.phone_number || '',
          role: resolvedRole,
          isSuperuser: isSuper,
          isStaff: Boolean(dbUser.is_staff),
          kycTier: dbUser.kyc_tier || 'TIER1',
          walletAddress: address,
          walletShort: shortAddr,
          balanceUSDC: balData.usdc,
          balanceXLM: balData.xlm,
          balanceFormatted: balData.formatted,
          avatar: dbUser.avatar_url || dbUser.avatar || '/default-avatar.svg',
          memberSince: '2026',
          verifiedLicense: dbUser.kyc_tier === 'TIER2',
        };
        setUser(userObj);
        if (typeof window !== 'undefined') {
          localStorage.setItem('payarmove_user_session', JSON.stringify(userObj));
        }
      }
      await refreshBackendData();
      return { success: true, user: res.user };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials.' };
    }
  };

  // Profile avatar upload with local preview and backend sync
  const uploadUserAvatar = async (file) => {
    try {
      // Create persistent Data URL
      const reader = new FileReader();
      const dataUrlPromise = new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      const dataUrl = await dataUrlPromise;

      setUser((prev) => {
        const u = { ...prev, avatar: dataUrl };
        if (typeof window !== 'undefined') {
          localStorage.setItem('payarmove_user_session', JSON.stringify(u));
        }
        return u;
      });

      if (api.tokens.isAuthenticated()) {
        const res = await api.auth.uploadAvatar(file);
        let finalUrl = res?.avatar_url || res?.user?.avatar_url || res?.user?.avatar || dataUrl;
        if (finalUrl && finalUrl.startsWith('/media/')) {
          finalUrl = getMediaUrl(finalUrl);
        }
        setUser((prev) => {
          const u = { ...prev, avatar: finalUrl };
          if (typeof window !== 'undefined') {
            localStorage.setItem('payarmove_user_session', JSON.stringify(u));
          }
          return u;
        });
      }
      return { success: true };
    } catch (err) {
      console.warn('Avatar upload warning:', err.message);
      return { success: false, error: err.message };
    }
  };

  // 1-Click Test User Switcher for easy testing
  const loginAsTestUser = async (role = 'renter') => {
    let email = 'renter@payarmove.com';
    if (role === 'host') email = 'host@payarmove.com';
    else if (role === 'admin') email = 'admin@payarmove.com';

    const res = await loginUser(email, 'Password123!');
    if (res.success) {
      switchMode(role);
      if (role === 'admin') navigateTo('admin-overview');
      else if (role === 'host') navigateTo('host-dashboard');
      else navigateTo('explore');
    }
    return res;
  };

  // Auth: User Signup
  const signupUser = async ({ email, username, password, role }) => {
    try {
      const res = await api.auth.signup({
        email,
        username: username || email.split('@')[0],
        password,
        role: role.toUpperCase(),
        primary_stellar_address: connectedWallet?.address || undefined,
      });
      if (res.tokens) {
        api.tokens.setTokens(res.tokens.access, res.tokens.refresh);
      }
      await refreshBackendData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed.' };
    }
  };

  // Navigation helper
  const navigateTo = (view, vehicleData = null, replace = false) => {
    if (vehicleData) {
      setSelectedVehicle(vehicleData);
    }
    const previousView = currentView;
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location);
        url.searchParams.set('view', view);
        if (replace || previousView === view) {
          window.history.replaceState({ view }, '', url);
        } else {
          window.history.pushState({ view }, '', url);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {}
    }
  };

  // Toggle favorite / wishlist with backend persistence
  const toggleSaveVehicle = async (vehicleId) => {
    setSavedVehicleIds((prev) => {
      const isSaved = prev.includes(vehicleId);
      const updated = isSaved ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId];
      if (typeof window !== 'undefined') {
        if (updated.length > 0) {
          localStorage.setItem('payarmove_saved_vehicle_ids', JSON.stringify(updated));
        } else {
          localStorage.removeItem('payarmove_saved_vehicle_ids');
        }
      }
      return updated;
    });

    if (api.tokens.isAuthenticated()) {
      try {
        await api.rentals.toggleSavedVehicle(vehicleId);
      } catch (err) {
        console.warn('Backend toggle saved vehicle notice:', err.message);
      }
    }
  };

  // Mode switcher (renter / host / admin) with role privilege enforcement
  const switchMode = (newMode) => {
    if (newMode === 'admin' && user.role !== 'admin') {
      console.warn('Access restricted: User is not an admin.');
      return false;
    }
    if (newMode === 'host' && user.role !== 'host' && user.role !== 'admin') {
      navigateTo('become-host');
      return false;
    }
    setMode(newMode);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location);
        url.searchParams.set('mode', newMode);
        window.history.pushState({ mode: newMode }, '', url);
      } catch (err) {}
    }
    return true;
  };

  const updateCheckoutStep = (step) => {
    setCheckoutStep(step);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location);
        url.searchParams.set('step', step);
        window.history.pushState({ step }, '', url);
      } catch (err) {}
    }
  };

  // Selected rental object
  const selectedRental = useMemo(() => {
    return rentals.find((r) => r.id === selectedRentalId) || rentals[0] || null;
  }, [rentals, selectedRentalId]);

  // Selected admin payment object
  const selectedAdminPayment = useMemo(() => {
    return (
      adminPayments.find(
        (p) =>
          p.id === selectedAdminPaymentId ||
          p.paymentId === selectedAdminPaymentId ||
          p.rentalId === selectedAdminPaymentId
      ) || adminPayments[0] || null
    );
  }, [adminPayments, selectedAdminPaymentId]);

  // Add host vehicle
  const addHostVehicle = async (newVehicle) => {
    try {
      const makeModel = newVehicle.make_model || `${newVehicle.make || ''} ${newVehicle.model || ''}`.trim();
      if (!makeModel) {
        return { success: false, error: 'Vehicle make and model are required.' };
      }
      const plate = (newVehicle.licensePlate || newVehicle.registration_number || '').trim();
      if (!plate) {
        return { success: false, error: 'License plate registration number is required.' };
      }
      const hrRate = parseFloat(newVehicle.hourlyRate);
      if (isNaN(hrRate) || hrRate <= 0) {
        return { success: false, error: 'Hourly rate must be a positive number greater than 0.' };
      }
      const dRate = parseFloat(newVehicle.dailyRate) || hrRate * 24;
      const deposit = parseFloat(newVehicle.securityDeposit) || 0;
      const primaryImage = (newVehicle.images && newVehicle.images[0]) || newVehicle.image || '/cars/gwagon.jpg';

      const formatUSDC = (val) => {
        if (val === null || val === undefined || val === '') return '0.00';
        const num = parseFloat(val);
        if (isNaN(num)) return '0.00';
        // Round to max 7 decimal places to avoid floating point precision artifacts (e.g. 0.07 * 24 = 1.6800000000000002)
        const fixed = num.toFixed(7);
        const parts = fixed.split('.');
        if (parts.length === 2) {
          let dec = parts[1];
          while (dec.length > 2 && dec.endsWith('0')) {
            dec = dec.slice(0, -1);
          }
          return `${parts[0]}.${dec}`;
        }
        return fixed;
      };

      const created = await api.rentals.createVehicle({
        make_model: makeModel,
        registration_number: plate,
        location: newVehicle.location || newVehicle.area || 'Westlands, Nairobi, Kenya',
        category: newVehicle.category || 'SUV',
        year: Number(newVehicle.year) || new Date().getFullYear(),
        seats: Number(newVehicle.seats) || 5,
        doors: Number(newVehicle.doors) || 4,
        transmission: newVehicle.transmission || 'Automatic',
        fuel_type: newVehicle.fuel || newVehicle.fuel_type || 'Gasoline',
        daily_rate_usdc: formatUSDC(dRate),
        hourly_rate_usdc: formatUSDC(hrRate),
        deposit_amount_usdc: formatUSDC(deposit),
        pickup_instructions: newVehicle.pickup_instructions || newVehicle.description || 'Instant unlock via Stellar Soroban smart lock code after escrow funding.',
        image_url: primaryImage,
        images: (newVehicle.images && newVehicle.images.length > 0) ? newVehicle.images : [primaryImage],
        features: newVehicle.features || ['GPS Telemetry', 'Apple CarPlay', 'Smart Lock Keyless Access'],
        rules: newVehicle.rules || ['No smoking inside vehicle', 'Return with matching fuel level'],
      });
      await refreshBackendData();
      return { success: true, vehicle: created };
    } catch (e) {
      console.warn('Backend vehicle creation notice:', e.message);
      return { success: false, error: e.message };
    }
  };

  // Host-specific rentals: bookings on vehicles owned by this host
  const hostRentals = useMemo(() => {
    const userEmail = (user?.email || '').toLowerCase();
    return rentals.filter(
      (r) =>
        r.isHostRental ||
        (r.hostEmail && r.hostEmail.toLowerCase() === userEmail) ||
        hostVehicles.some((hv) => hv.id === r.vehicleId || hv.name === r.vehicleName)
    );
  }, [rentals, user, hostVehicles]);

  const handleConfirmDelivery = async (rentalId) => {
    try {
      const res = await api.rentals.confirmDelivery(rentalId);
      await refreshBackendData();
      return res;
    } catch (err) {
      console.warn('Confirm delivery error:', err);
      throw err;
    }
  };

  const handleConfirmReturn = async (rentalId) => {
    try {
      const res = await api.rentals.confirmReturn(rentalId);
      await refreshBackendData();
      return res;
    } catch (err) {
      console.warn('Confirm return error:', err);
      throw err;
    }
  };

  const value = {
    currentView,
    setCurrentView,
    navigateTo,
    mode,
    switchMode,
    searchQuery,
    setSearchQuery,
    updateTimeline,
    uploadUserAvatar,
    vehicles,
    setVehicles,
    isLoadingVehicles,
    selectedVehicle,
    setSelectedVehicle,
    savedVehicleIds,
    toggleSaveVehicle,
    rentals,
    setRentals,
    selectedRentalId,
    setSelectedRentalId,
    selectedRental,
    checkoutStep,
    setCheckoutStep,
    updateCheckoutStep,
    hostVehicles,
    setHostVehicles,
    hostRentals,
    handleConfirmDelivery,
    handleConfirmReturn,
    addHostVehicle,
    handleAddVehicle: addHostVehicle,
    adminPayments,
    setAdminPayments,
    selectedAdminPaymentId,
    setSelectedAdminPaymentId,
    selectedAdminPayment,
    adminLedgers,
    setAdminLedgers,
    adminMetrics,
    hostMetrics,
    hostPayouts,
    setHostPayouts,
    profileTab,
    setProfileTab,
    rentalsTab,
    setRentalsTab,
    hostAccountTab,
    setHostAccountTab,
    user,
    setUser,
    connectedWallet,
    setConnectedWallet,
    isWalletConnecting,
    handleConnectWallet,
    handleDisconnectWallet,
    completeWalletProfileSetup,
    fundConnectedWallet,
    loginUser,
    loginAsTestUser,
    signupUser,
    refreshBackendData,
    previewDevice,
    setPreviewDevice,
    apiError,
    api,
    apiConfig,
    apiBaseUrl,
    updateApiBaseUrl,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
