import { AuthClient } from "@dfinity/auth-client";
import { Identity } from "@dfinity/agent";

let authClient: AuthClient | null = null;

export async function initAuth(): Promise<AuthClient> {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
}

export async function login(): Promise<boolean> {
  try {
    const client = await initAuth();
    
    return new Promise((resolve) => {
      client.login({
        identityProvider: process.env.NODE_ENV === 'production' 
          ? "https://identity.ic0.app" 
          : `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`,
        onSuccess: () => {
          console.log("Login successful");
          resolve(true);
        },
        onError: (error) => {
          console.error("Login failed:", error);
          resolve(false);
        },
      });
    });
  } catch (error) {
    console.error("Auth initialization failed:", error);
    return false;
  }
}

export async function logout(): Promise<void> {
  const client = await initAuth();
  await client.logout();
}

export async function isAuthenticated(): Promise<boolean> {
  const client = await initAuth();
  return await client.isAuthenticated();
}

export async function getIdentity(): Promise<Identity | null> {
  const client = await initAuth();
  const authenticated = await client.isAuthenticated();
  
  if (authenticated) {
    return client.getIdentity();
  }
  
  return null;
}

export async function getPrincipal(): Promise<string | null> {
  const identity = await getIdentity();
  return identity ? identity.getPrincipal().toText() : null;
}
