import { useState } from 'react';

/**
 * useWallet Hook
 * 
 * Returns wallet balance and related state.
 * Replace the hardcoded initial value with your actual data source (API, context, etc.)
 */
export function useWallet() {
  const [balance, setBalance] = useState(45.60); // Default matches your previous hardcoded value

  // Add functions as needed:
  // const addFunds = (amount) => { ... }
  // const deductFunds = (amount) => { ... }

  return {
    balance,
    setBalance,
  };
}