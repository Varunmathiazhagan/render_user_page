const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'https://render-user-page.onrender.com').replace(/\/$/, '');

const PRODUCTS_CACHE_KEY = 'kspProductsCacheV1';
const PRODUCTS_CACHE_TTL_MS = 10 * 60 * 1000;

let inMemoryProductsCache = null;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getStoredProductsCache = () => {
  const raw = sessionStorage.getItem(PRODUCTS_CACHE_KEY);
  const parsed = raw ? safeParse(raw) : null;

  if (!parsed || !Array.isArray(parsed.data)) {
    return null;
  }

  return parsed;
};

const saveProductsCache = (cachePayload) => {
  inMemoryProductsCache = cachePayload;

  // Store only lightweight metadata in sessionStorage (no base64 images)
  // to stay well under the ~5 MB quota.
  try {
    const lightPayload = {
      ...cachePayload,
      data: cachePayload.data.map(({ image, ...rest }) => rest),
    };
    sessionStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(lightPayload));
  } catch {
    // QuotaExceededError – clear stale entry so it doesn't block future writes
    sessionStorage.removeItem(PRODUCTS_CACHE_KEY);
  }
};

const isFreshCache = (cachePayload) => {
  if (!cachePayload || !cachePayload.cachedAt) return false;
  return Date.now() - cachePayload.cachedAt < PRODUCTS_CACHE_TTL_MS;
};

export const getApiBaseUrl = () => API_BASE_URL;

export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    return {
      ok: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error,
    };
  }
};

export const fetchProductsCached = async ({ forceRefresh = false } = {}) => {
  const memoryCache = inMemoryProductsCache;
  if (!forceRefresh && memoryCache && Array.isArray(memoryCache.data) && isFreshCache(memoryCache)) {
    return memoryCache.data;
  }

  const storedCache = getStoredProductsCache();
  // storedCache.data has no images (lightweight); it can only be used for
  // conditional-request headers, not returned to the caller directly.
  // A full network fetch (or 304) is still needed when memory cache is empty.

  const headers = { Accept: 'application/json' };
  if (storedCache?.etag) headers['If-None-Match'] = storedCache.etag;
  if (storedCache?.lastModified) headers['If-Modified-Since'] = storedCache.lastModified;

  const response = await fetch(`${API_BASE_URL}/api/products`, { headers });

  if (response.status === 304 && storedCache?.data) {
    const refreshedCache = {
      ...storedCache,
      cachedAt: Date.now(),
    };
    saveProductsCache(refreshedCache);
    return refreshedCache.data;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  const cachePayload = {
    data: Array.isArray(data) ? data : [],
    cachedAt: Date.now(),
    etag: response.headers.get('etag'),
    lastModified: response.headers.get('last-modified'),
  };

  saveProductsCache(cachePayload);
  return cachePayload.data;
};
