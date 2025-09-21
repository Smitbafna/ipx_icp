import { useState } from 'react';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleConnect = () => {
    // Placeholder for actual wallet connection logic
    setIsConnected(true);
  };
  
  const handleDisconnect = () => {
    setIsConnected(false);
    setIsDropdownOpen(false);
  };
  
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-full transition-all shadow-md hover:shadow-lg"
      >
        Connect Wallet
      </button>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-full transition-all"
      >
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span>0x7a...3f9b</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 py-2 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-500">Connected as</p>
            <p className="font-medium text-gray-800">0x7a...3f9b</p>
          </div>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="font-medium text-gray-800">12.45 ICP</p>
          </div>
          <div className="px-2 py-2">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/my-campaigns'}
              className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              My Campaigns
            </button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Settings
            </button>
            <button
              onClick={handleDisconnect}
              className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
