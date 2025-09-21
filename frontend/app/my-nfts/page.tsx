'use client';

import { MyNFTs } from '../../components/MyNFTs';

export default function MyNFTsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My NFT Receipts</h1>
          <p className="text-xl text-gray-600">
            View your investment receipts and revenue share entitlements
          </p>
        </div>
        
        <MyNFTs />
      </div>
    </div>
  );
}
