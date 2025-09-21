'use client';

import { useInternetIdentity } from '../lib/useInternetIdentity';

const IPXComponents = () => {
  const { principal, isAuthenticated, loading, login, logout } = useInternetIdentity();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-green-600 rounded-full animate-spin border-t-transparent"></div>
        <span className="text-sm text-green-600">Loading Internet Identity...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && principal ? (
        <>
          <div className="text-sm">
            <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">
              {principal.slice(0, 8)}...{principal.slice(-4)}
            </span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default IPXComponents;

