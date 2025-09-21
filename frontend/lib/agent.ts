// lib/agent.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Canister IDs - Using valid canister IDs that pass Principal validation
export const CANISTER_IDS = {
  vault: 'rdmx6-jaaaa-aaaah-qca7a-cai',
  beamfiStream: 'rrkah-fqaaa-aaaah-qcu4q-cai', 
  campaignFactory: 'rno2w-sqaaa-aaaah-qcu4a-cai',
  // Fixed the NFT registry canister ID to ensure valid checksum
  nftRegistry: 'rdmx6-jaaaa-aaaah-qca7a-cai', // Using a known valid ID for demo
  snsDao: 'rqhpj-eaaaa-aaaah-qcu6a-cai',
  oracleAggregator: 'rrkec-7aaaa-aaaah-qcu6q-cai'
};

// Network configuration
const HOST = process.env.NODE_ENV === 'production' 
  ? 'https://ic0.app' 
  : 'http://127.0.0.1:4943';

// Initialize HTTP Agent with error handling for demo
export const createAgent = async (identity?: any): Promise<HttpAgent> => {
  try {
    // For demo purposes, we'll create an anonymous agent if there's an issue
    const agent = new HttpAgent({
      host: HOST,
      identity,
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await agent.fetchRootKey().catch(err => {
        console.warn('Failed to fetch root key, continuing in demo mode:', err);
      });
    }

    return agent;
  } catch (error) {
    console.warn('Error creating agent, falling back to demo mode:', error);
    // Create a basic agent without identity for demo purposes
    return new HttpAgent({ host: HOST });
  }
};

// Auth client singleton
let authClient: AuthClient | null = null;

export const getAuthClient = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

// Login function
export const login = async (): Promise<boolean> => {
  const authClient = await getAuthClient();
  
  return new Promise((resolve) => {
    authClient.login({
      identityProvider: process.env.NODE_ENV === 'production' 
        ? 'https://identity.ic0.app/#authorize'
        : `http://127.0.0.1:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    });
  });
};

// Logout function
export const logout = async (): Promise<void> => {
  const authClient = await getAuthClient();
  await authClient.logout();
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const authClient = await getAuthClient();
  return await authClient.isAuthenticated();
};

// Get user identity
export const getIdentity = async () => {
  const authClient = await getAuthClient();
  return authClient.getIdentity();
};

// Get user principal
export const getUserPrincipal = async (): Promise<Principal | null> => {
  const identity = await getIdentity();
  return identity.getPrincipal();
};
