"use client";

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/lib/msal-config';
import { ReactNode, useEffect, useState } from 'react';

// MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface MSALProviderProps {
  children: ReactNode;
}

export function MSALProviderWrapper({ children }: MSALProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // useEffect(() => {
  //   const initializeMsal = async () => {
  //     try {
  //       console.log("Initializing MSAL...");
  //       await msalInstance.initialize();
  //       setIsInitialized(true);
  //     } catch (error) {
  //       console.error('MSAL initialization failed:', error);
  //       setIsInitialized(true); // Still render children even if MSAL fails
  //     }
  //   };

  //   initializeMsal();
  // }, []);

  // if (!isInitialized) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2] mx-auto mb-4"></div>
  //         <p className="text-gray-600">Initializing authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}