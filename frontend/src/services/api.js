/**
 * PayarMove Centralized API Client
 *
 * Designed for effortless deployment across domains:
 * - Update domain via .env (VITE_API_BASE_URL=https://api.yourdomain.com/api/v1)
 * - Or set window.__PAYARMOVE_API_URL__ at runtime
 * - Or call api.setBaseUrl('https://api.yourdomain.com/api/v1')
 */

// Determine initial base URL
const getInitialBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.__PAYARMOVE_API_URL__) {
      return window.__PAYARMOVE_API_URL__;
    }

    const hostname = window.location.hostname;

    // Smart automatic detection based on active production domain
    if (hostname === 'payarmove.com' || hostname === 'www.payarmove.com') {
      // Purge any stale local development override from localStorage
      try {
        const saved = localStorage.getItem('payarmove_api_base_url');
        if (saved && (saved.includes('localhost') || saved.includes('127.0.0.1'))) {
          localStorage.removeItem('payarmove_api_base_url');
        }
      } catch (_) {}
      return 'https://api.payarmove.com/api/v1';
    }

    if (hostname === '173.214.172.222') {
      try {
        const saved = localStorage.getItem('payarmove_api_base_url');
        if (saved && (saved.includes('localhost') || saved.includes('127.0.0.1'))) {
          localStorage.removeItem('payarmove_api_base_url');
        }
      } catch (_) {}
      return 'http://173.214.172.222:8000/api/v1';
    }

    const saved = localStorage.getItem('payarmove_api_base_url');
    if (saved) return saved;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://api.payarmove.com/api/v1';
};

let currentBaseUrl = getInitialBaseUrl().replace(/\/+$/, '');

export const apiConfig = {
  getBaseUrl: () => currentBaseUrl,
  setBaseUrl: (newUrl) => {
    if (!newUrl) return;
    currentBaseUrl = newUrl.replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem('payarmove_api_base_url', currentBaseUrl);
    }
  },
  resetBaseUrl: () => {
    currentBaseUrl = getInitialBaseUrl().replace(/\/+$/, '');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payarmove_api_base_url');
    }
  },
};

// Token helpers
export const tokenStorage = {
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem('payarmove_access_token') : null),
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem('payarmove_refresh_token') : null),
  setTokens: (access, refresh) => {
    if (typeof window !== 'undefined') {
      if (access) localStorage.setItem('payarmove_access_token', access);
      if (refresh) localStorage.setItem('payarmove_refresh_token', refresh);
    }
  },
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('payarmove_access_token');
      localStorage.removeItem('payarmove_refresh_token');
    }
  },
  isAuthenticated: () => Boolean(tokenStorage.getAccessToken()),
};

// Generic fetch wrapper with auto-auth and error handling
async function request(endpoint, options = {}) {
  const url = `${currentBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  // Only add Content-Type: application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Inject Bearer token
  const token = tokenStorage.getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    // Handle token expiration (401) with refresh attempt
    if (response.status === 401 && !endpoint.includes('/auth/token/refresh/')) {
      let refreshed = false;
      if (tokenStorage.getRefreshToken()) {
        refreshed = await attemptTokenRefresh();
      }
      if (refreshed) {
        headers['Authorization'] = `Bearer ${tokenStorage.getAccessToken()}`;
        response = await fetch(url, { ...options, headers });
      } else {
        tokenStorage.clearTokens();
        // If it was a public read request (like /rentals/vehicles/), retry without stale Auth header
        if (!options.method || options.method === 'GET') {
          delete headers['Authorization'];
          response = await fetch(url, { ...options, headers });
        }
      }
    }

    // Try parsing response JSON
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (typeof data === 'object' && (data.detail || data.message || data.error?.message)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.warn(`[PayarMove API Error] ${options.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
}

async function attemptTokenRefresh() {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${currentBaseUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      tokenStorage.setTokens(data.access, data.refresh || refresh);
      return true;
    }
  } catch (e) {
    // refresh failed
  }
  tokenStorage.clearTokens();
  return false;
}

// Structured API modules
export const api = {
  config: apiConfig,
  tokens: tokenStorage,

  // 1. Authentication & Wallet Connect
  auth: {
    signup: (data) =>
      request('/auth/signup/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    signin: (data) =>
      request('/auth/signin/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getWalletChallenge: (publicKey) =>
      request('/auth/wallet/challenge/', {
        method: 'POST',
        body: JSON.stringify({ public_key: publicKey }),
      }),

    verifyWalletChallenge: (publicKey, signedXdr, walletType = 'FREIGHTER', role = 'RENTER') =>
      request('/auth/wallet/verify/', {
        method: 'POST',
        body: JSON.stringify({
          public_key: publicKey,
          signed_xdr: signedXdr,
          wallet_type: walletType,
          role: role,
        }),
      }),

    getProfile: () => request('/auth/me/'),

    walletLookup: (address) => request(`/auth/wallet/login/?address=${encodeURIComponent(address)}`),

    walletLogin: (publicKey) =>
      request('/auth/wallet/login/', {
        method: 'POST',
        body: JSON.stringify({ public_key: publicKey }),
      }),

    walletSetup: (data) =>
      request('/auth/wallet/setup/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateProfile: (data) =>
      request('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    uploadAvatar: (fileOrFormData) => {
      let body;
      if (fileOrFormData instanceof FormData) {
        body = fileOrFormData;
      } else if (typeof File !== 'undefined' && fileOrFormData instanceof File) {
        body = new FormData();
        body.append('avatar', fileOrFormData);
      } else if (typeof Blob !== 'undefined' && fileOrFormData instanceof Blob) {
        body = new FormData();
        body.append('avatar', fileOrFormData);
      } else {
        body = JSON.stringify({ avatar_url: fileOrFormData });
      }
      return request('/auth/avatar/', {
        method: 'POST',
        body,
      });
    },

    applyHost: (data) =>
      request('/auth/host-application/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getHostApplicationStatus: () => request('/auth/host-application/'),

    logout: () => {
      tokenStorage.clearTokens();
    },
  },


  // 2. KYC & Compliance
  kyc: {
    submit: (formData) =>
      request('/kyc/submit/', {
        method: 'POST',
        body: formData, // FormData handles its own boundary
      }),

    getStatus: () => request('/kyc/status/'),

    adminList: () => request('/kyc/admin/applications/'),

    adminReview: (recordId, action, rejectionReason = '') =>
      request(`/kyc/admin/applications/${recordId}/review/`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          rejection_reason: rejectionReason,
        }),
      }),
  },

  // 3. Mobility Vehicles & Rentals
  rentals: {
    getVehicles: () => request('/rentals/vehicles/'),

    getVehicle: (id) => request(`/rentals/vehicles/${id}/`),

    createVehicle: (vehicleData) =>
      request('/rentals/vehicles/', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      }),

    getRentals: () => request('/rentals/rentals/'),

    getRental: (id) => request(`/rentals/rentals/${id}/`),

    createRental: (rentalData) =>
      request('/rentals/rentals/', {
        method: 'POST',
        body: JSON.stringify(rentalData),
      }),

    confirmDelivery: (rentalId) =>
      request(`/rentals/rentals/${rentalId}/confirm-delivery/`, {
        method: 'POST',
      }),

    confirmReturn: (rentalId) =>
      request(`/rentals/rentals/${rentalId}/confirm-return/`, {
        method: 'POST',
      }),

    getMyVehicles: () => request('/rentals/vehicles/my-vehicles/'),

    getSavedVehicles: () => request('/rentals/saved/'),

    syncSavedVehicles: (vehicleIds) =>
      request('/rentals/saved/sync/', {
        method: 'POST',
        body: JSON.stringify({ vehicle_ids: vehicleIds }),
      }),

    saveVehicle: (vehicleId) =>
      request('/rentals/saved/', {
        method: 'POST',
        body: JSON.stringify({ vehicle_id: vehicleId }),
      }),

    toggleSavedVehicle: (vehicleId) =>
      request('/rentals/saved/toggle/', {
        method: 'POST',
        body: JSON.stringify({ vehicle_id: vehicleId }),
      }),

    removeSavedVehicle: (vehicleId) =>
      request(`/rentals/saved/${vehicleId}/`, {
        method: 'DELETE',
      }),
  },

  // 4. Soroban Smart Contract Escrow
  escrow: {
    prepare: (rentalId) =>
      request(`/escrow/prepare/${rentalId}/`, {
        method: 'POST',
      }),

    getStatus: (rentalId) => request(`/escrow/${rentalId}/`),

    submitDeposit: (rentalId, transactionHash) =>
      request(`/escrow/${rentalId}/submit-deposit/`, {
        method: 'POST',
        body: JSON.stringify({ transaction_hash: transactionHash }),
      }),

    settle: (rentalId) =>
      request(`/escrow/${rentalId}/settle/`, {
        method: 'POST',
      }),

    dispute: (rentalId, { hostDamageAward, renterDepositRefund, disputeReason }) =>
      request(`/escrow/${rentalId}/dispute/`, {
        method: 'POST',
        body: JSON.stringify({
          host_damage_award_usdc: hostDamageAward,
          renter_deposit_refund_usdc: renterDepositRefund,
          dispute_reason: disputeReason,
        }),
      }),
  },

  // 5. Host Payouts Ledger
  payouts: {
    list: () => request('/payouts/'),
  },

  // 6. Dashboards & Analytics
  dashboard: {
    getAdminSummary: () => request('/dashboard/admin/summary/'),
    getHostSummary: () => request('/dashboard/host/summary/'),
  },

  // 7. Health & Connectivity
  health: {
    check: async (customUrl = null) => {
      const target = (customUrl || currentBaseUrl).replace(/\/+$/, '');
      try {
        const res = await fetch(`${target}/rentals/vehicles/`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        return { ok: res.ok, status: res.status };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
  },

  // Configuration access
  config: apiConfig,
};

export default api;
