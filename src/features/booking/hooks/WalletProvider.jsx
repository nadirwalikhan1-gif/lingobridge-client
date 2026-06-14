import React, { useState, createContext } from 'react';

// Export context so WalletContext.js can import it
export const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(45.60);

  return (
    <WalletContext.Provider value={{ balance, setBalance }}>
      {children}
    </WalletContext.Provider>
  );
}
