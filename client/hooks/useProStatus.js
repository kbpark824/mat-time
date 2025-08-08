/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState, useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { useAuth } from '../auth/context';

export function useProStatus() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const checkSubscription = async () => {
      try {
        // Check both RevenueCat and database for pro status
        const customerInfo = await Purchases.getCustomerInfo();
        const isProFromRevenueCat = typeof customerInfo.entitlements.active.pro !== 'undefined';
        const isProFromDatabase = user?.isPro || false;
        
        // User is pro if either RevenueCat OR database says so
        const userIsPro = isProFromRevenueCat || isProFromDatabase;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setIsPro(userIsPro);
        }
      } catch (_e) {
        // If RevenueCat fails, fall back to database only
        const isProFromDatabase = user?.isPro || false;
        
        // Only update state if component is still mounted
        if (isMounted) {
          setIsPro(isProFromDatabase);
        }
      }
    };

    checkSubscription();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [user]);

  return { isPro, setIsPro };
}