'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as nftRegistryIDL } from '../src/declarations/nft-registry';

interface NFT {
  id: number;
  campaign_id: number;
  campaign_title: string;
  contribution_amount: number;
  revenue_share: number;
  timestamp: number;
}

export const MyNFTs = () => {
  const { isAuthenticated, identity, principal } = useAuth();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadMyNFTs = async () => {
    if (!isAuthenticated || !identity) {
      return;
    }

    setLoading(true);
    try {
      const agent = new HttpAgent({ 
        identity,
        host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943'
      });

      if (process.env.NODE_ENV !== 'production') {
        await agent.fetchRootKey();
      }

      const nftRegistry = Actor.createActor(nftRegistryIDL, {
        agent,
        canisterId: process.env.NEXT_PUBLIC_NFT_REGISTRY_CANISTER_ID || 'ryjl3-tyaaa-aaaah-qcqyq-cai',
      });

      const result = await nftRegistry.get_tokens_by_owner(identity.getPrincipal());
      setNfts(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      setMessage('Failed to load your NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMyNFTs();
    }
  }, [isAuthenticated, identity]);

  const formatICP = (amount: number) => {
    return (amount / 1e8).toFixed(2);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp / 1000000).toLocaleDateString(); // Convert from nanoseconds
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to view your NFTs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        <span className="ml-2">Loading your NFTs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My NFT Receipts</h2>
        <button
          onClick={loadMyNFTs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">NFT</span>
          </div>
          <p className="text-gray-600 mb-2">No NFT receipts yet</p>
          <p className="text-gray-500 text-sm">Fund a campaign to receive your first NFT receipt!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* NFT Visual */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">NFT</div>
                  <div className="text-sm font-semibold">NFT Receipt #{nft.id}</div>
                </div>
              </div>
              {/* NFT Details */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2">{nft.campaign_title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contribution:</span>
                    <span className="font-semibold text-blue-600">{formatICP(nft.contribution_amount)} ICP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Share:</span>
                    <span className="font-semibold text-green-600">{nft.revenue_share}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{formatDate(nft.timestamp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign ID:</span>
                    <span className="text-gray-900">#{nft.campaign_id}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800">
                      This NFT represents your ownership stake and entitles you to {nft.revenue_share}% 
                      of future revenue from this campaign.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-800">{message}</p>
          <pre className="text-xs text-gray-600 mt-2">{`Request: nftRegistry.get_tokens_by_owner(identity.getPrincipal())`}</pre>
        </div>
      )}

      {principal && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Your Principal: <span className="font-mono">{principal}</span>
          </p>
        </div>
      )}
    </div>
  );
};
