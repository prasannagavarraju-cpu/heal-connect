import { useState, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser.';
        setState((s) => ({ ...s, error: err }));
        reject(new Error(err));
        return;
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setState({ latitude, longitude, accuracy, error: null, isLoading: false });
          resolve({ latitude, longitude });
        },
        (err) => {
          const msg = err.message || 'Unable to retrieve your location.';
          setState((s) => ({ ...s, error: msg, isLoading: false }));
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }, []);

  return { ...state, getCurrentLocation };
};
