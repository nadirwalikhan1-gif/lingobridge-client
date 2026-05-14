import { useState } from 'react';

/**
 * useNotifications Hook
 * 
 * Returns notification count and related state.
 * Replace the hardcoded initial value with your actual data source (API, WebSocket, context, etc.)
 */
export function useNotifications() {
  const [count, setCount] = useState(2); // Default matches your previous hardcoded badge value

  // Add functions as needed:
  // const markAsRead = (id) => { ... }
  // const clearAll = () => { ... }

  return {
    count,
    setCount,
  };
}