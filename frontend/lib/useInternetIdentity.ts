import { useEffect, useState } from 'react';
import { getPrincipal, isAuthenticated, login, logout } from './auth';

export function useInternetIdentity() {
  const [principal, setPrincipal] = useState<string | null>("2vxsx-fae"); // Default demo principal
  const [authenticated, setAuthenticated] = useState<boolean>(true); // Always authenticated for demo
  const [loading, setLoading] = useState<boolean>(false); // No loading in demo mode

  useEffect(() => {
    // In demo mode, we'll skip the actual authentication check
    // and just assume the user is always authenticated
    let mounted = true;
    async function setupDemoIdentity() {
      // In a real app, this would check with the Internet Computer
      // For demo purposes, we'll skip that
      console.log("Demo mode: Using mock Internet Identity");
      
      if (mounted) {
        setAuthenticated(true);
        setPrincipal("2vxsx-fae");
        setLoading(false);
      }
    }
    setupDemoIdentity();
    return () => { mounted = false; };
  }, []);

  const doLogin = async () => {
    // In demo mode, we'll just set the authenticated state directly
    console.log("Demo mode: Login successful with mock principal");
    setAuthenticated(true);
    setPrincipal("2vxsx-fae");
  };

  const doLogout = async () => {
    // In demo mode, we won't actually log out
    console.log("Demo mode: Logout requested but ignored for demo");
    // In a real app, this would call the actual logout function
    // For demo, we'll stay logged in
  };

  return {
    principal,
    isAuthenticated: authenticated,
    loading,
    login: doLogin,
    logout: doLogout,
  };
}
