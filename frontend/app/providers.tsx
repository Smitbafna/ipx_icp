'use client'

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from '@/components/AuthProvider';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.ic && window.ic.plug) {
      window.ic.plug.requestConnect().then((connected: boolean) => {
        if (connected) {
          
          console.log('Plug wallet connected:', window.ic.plug.sessionManager.sessionData.principalId);
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;