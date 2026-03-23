import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Save to storage
  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  }, [key, storedValue]);

  // Remove from storage
  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    isLoading,
    error,
    setValue,
    removeValue,
  };
};
