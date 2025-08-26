import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_FREE_CHECKS = 10;
const USAGE_STORAGE_KEY = 'free_tier_usage';

interface UsageState {
  remainingChecks: number;
  maxChecks: number;
  loading: boolean;
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageState>({
    remainingChecks: MAX_FREE_CHECKS,
    maxChecks: MAX_FREE_CHECKS,
    loading: true,
  });

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const savedUsage = await AsyncStorage.getItem(USAGE_STORAGE_KEY);
      if (savedUsage) {
        const parsedUsage = JSON.parse(savedUsage);
        setUsage({
          remainingChecks: parsedUsage.remainingChecks || MAX_FREE_CHECKS,
          maxChecks: MAX_FREE_CHECKS,
          loading: false,
        });
      } else {
        setUsage({
          remainingChecks: MAX_FREE_CHECKS,
          maxChecks: MAX_FREE_CHECKS,
          loading: false,
        });
      }
    } catch (error) {
      console.log('Error loading usage:', error);
      setUsage({
        remainingChecks: MAX_FREE_CHECKS,
        maxChecks: MAX_FREE_CHECKS,
        loading: false,
      });
    }
  };

  const decrementUsage = async () => {
    if (usage.remainingChecks > 0) {
      const newRemainingChecks = usage.remainingChecks - 1;
      const newUsage = {
        ...usage,
        remainingChecks: newRemainingChecks,
      };
      
      setUsage(newUsage);
      
      try {
        await AsyncStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({
          remainingChecks: newRemainingChecks,
        }));
      } catch (error) {
        console.log('Error saving usage:', error);
      }
    }
  };

  const resetUsage = async () => {
    const resetUsage = {
      remainingChecks: MAX_FREE_CHECKS,
      maxChecks: MAX_FREE_CHECKS,
      loading: false,
    };
    
    setUsage(resetUsage);
    
    try {
      await AsyncStorage.removeItem(USAGE_STORAGE_KEY);
    } catch (error) {
      console.log('Error resetting usage:', error);
    }
  };

  return {
    ...usage,
    decrementUsage,
    resetUsage,
    canMakeCheck: usage.remainingChecks > 0,
  };
}