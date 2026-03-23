import { useState, useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'SurviLens needs location access',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      setIsLoading(false);
      return null;
    }

    return new Promise<Location | null>((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const loc: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          };
          setLocation(loc);
          setIsLoading(false);
          resolve(loc);
        },
        (err) => {
          setError(err.message);
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
  }, [requestPermission]);

  const startWatching = useCallback(() => {
    if (isWatching) return;

    const watchId = Geolocation.watchPosition(
      (position) => {
        const loc: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };
        setLocation(loc);
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    setIsWatching(true);

    return () => {
      Geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
  }, [isWatching]);

  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(2)}km`;
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    isWatching,
    getCurrentLocation,
    startWatching,
    calculateDistance,
  };
};
