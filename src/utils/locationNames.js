import { useEffect, useMemo, useState } from 'react';

export const GPS_ACCURACY_THRESHOLD = 500;

const CACHE_PREFIX = 'repairboy-place-name:';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const locationKeyForPoint = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return '';
  return `${nLat.toFixed(5)},${nLng.toFixed(5)}`;
};

export const formatCoordinates = (point) => {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '-';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export const formatPointType = (source) => {
  if (source === 'clock-in') return 'Clock-In';
  if (source === 'clock-out') return 'Clock-Out';
  return 'Ping';
};

export const isLowAccuracyPoint = (point) => {
  const accuracy = Number(point?.accuracy || 0);
  return accuracy > GPS_ACCURACY_THRESHOLD;
};

export const formatAccuracyLabel = (accuracy) => {
  const value = Number(accuracy || 0);
  if (!value) return '-';
  if (value > GPS_ACCURACY_THRESHOLD) {
    return `~${Math.max(1, Math.round(value / 1000))}km No GPS`;
  }
  return `+/-${Math.round(value)}m`;
};

const readCachedPlaceName = (key) => {
  if (!key || typeof window === 'undefined' || !window.localStorage) return undefined;
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - Number(parsed.savedAt || 0) > CACHE_TTL_MS) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return undefined;
    }
    return typeof parsed.label === 'string' ? parsed.label : '';
  } catch {
    return undefined;
  }
};

const writeCachedPlaceName = (key, label) => {
  if (!key || typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({
      label: label || '',
      savedAt: Date.now(),
    }));
  } catch {
    // Cache failures should never block the tracking screen.
  }
};

const compactPlaceLabel = (payload) => {
  const address = payload?.address || {};
  const road = [address.house_number, address.road].filter(Boolean).join(' ');
  const settlement = address.suburb
    || address.neighbourhood
    || address.village
    || address.town
    || address.city_district
    || address.city;
  const city = address.city || address.town || address.county || address.state_district;

  const candidates = [
    payload?.name,
    address.building,
    address.amenity,
    address.shop,
    address.office,
    road,
    settlement,
    city,
    address.state,
  ].filter(Boolean);

  const uniqueParts = [];
  for (const item of candidates) {
    const label = String(item).trim();
    if (!label) continue;
    const normalized = label.toLowerCase();
    if (uniqueParts.some((part) => part.toLowerCase() === normalized)) continue;
    uniqueParts.push(label);
    if (uniqueParts.length === 3) break;
  }

  if (uniqueParts.length > 0) return uniqueParts.join(', ');
  return String(payload?.display_name || '').split(',').slice(0, 3).map((part) => part.trim()).filter(Boolean).join(', ');
};

const reverseGeocodePoint = async (point, signal) => {
  if (typeof fetch !== 'function') return '';
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
    },
  });
  if (!response.ok) return '';
  const payload = await response.json();
  return compactPlaceLabel(payload);
};

export const useLocationNames = (points) => {
  const signature = useMemo(
    () => points.map((point) => locationKeyForPoint(point.lat, point.lng)).filter(Boolean).join('|'),
    [points],
  );
  const [namesByKey, setNamesByKey] = useState({});
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const resolveNames = async () => {
      await Promise.resolve();
      if (cancelled) return;

      const pointByKey = {};
      const keys = [];
      for (const point of points) {
        const key = locationKeyForPoint(point.lat, point.lng);
        if (!key || pointByKey[key]) continue;
        pointByKey[key] = point;
        keys.push(key);
      }

      if (keys.length === 0) {
        setIsResolving(false);
        return;
      }

      const cachedNames = {};
      const missingKeys = [];
      for (const key of keys) {
        const cached = readCachedPlaceName(key);
        if (cached !== undefined) cachedNames[key] = cached;
        else missingKeys.push(key);
      }

      setNamesByKey((previous) => {
        const next = {};
        for (const key of keys) {
          if (Object.prototype.hasOwnProperty.call(cachedNames, key)) next[key] = cachedNames[key];
          else if (Object.prototype.hasOwnProperty.call(previous, key)) next[key] = previous[key];
        }
        return next;
      });

      if (missingKeys.length === 0) {
        setIsResolving(false);
        return;
      }

      setIsResolving(true);
      for (let index = 0; index < missingKeys.length; index += 1) {
        const key = missingKeys[index];
        const point = pointByKey[key];
        try {
          const label = await reverseGeocodePoint(point, controller.signal);
          if (cancelled) return;
          writeCachedPlaceName(key, label);
          setNamesByKey((previous) => ({ ...previous, [key]: label || '' }));
        } catch {
          if (cancelled) return;
          writeCachedPlaceName(key, '');
          setNamesByKey((previous) => ({ ...previous, [key]: '' }));
        }
        if (!cancelled && index < missingKeys.length - 1) await wait(1000);
      }
      if (!cancelled) setIsResolving(false);
    };

    resolveNames();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [points, signature]);

  return { namesByKey, isResolving };
};
