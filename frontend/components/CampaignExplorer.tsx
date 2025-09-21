'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: number;
  title: string;
  description: string;
  goal: number;
  current_funding: number;
  revenue_share: number;
  creator: string;
  is_active: boolean;
  youtube_channel: string;
  estimated_monthly_revenue: number;
  supporters_count: number;
}

export const CampaignExplorer = () => {

  const isAuthenticated = false;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [contributing, setContributing] = useState<number | null>(null);
  const [contributionAmounts, setContributionAmounts] = useState<{[key: number]: string}>({});
  const [message, setMessage] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<{[key: number]: string}>({});

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const canisterUrl = 'https://ic0.app/api/v2/canister/rrkah-fqaaa-aaaah-qcqyq-cai/call';
      const response = await fetch(canisterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor',
        },
        body: JSON.stringify({
          method_name: 'list_campaigns',
          arg: {}
        })
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const result = await response.json();
     
      setCampaigns(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setMessage('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const contribute = async (campaignId: number) => {
    if (!isAuthenticated) {
      setMessage('Please connect your wallet to contribute');
      return;
    }

    const amount = contributionAmounts[campaignId];
    const currency = selectedCurrency[campaignId] || 'ICP';
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid contribution amount');
      return;
    }

    setContributing(campaignId);
    setMessage('');

    try {
    
      const vaultUrl = 'https://ic0.app/api/v2/canister/oe55z-chin3-hrwrz-kw3bg-uu66d-3z7x3-3d5el-x7ls4-reoqq-fjzqt-wae/call';
      const contributionAmount = parseFloat(amount) * 1e8; 
      
      const contributionPayload = {
        method_name: 'contribute',
        arg: {
          campaign_id: campaignId,
          amount: contributionAmount,
          currency: currency
        }
      };

      const response = await fetch(vaultUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/cbor',
        },
        body: JSON.stringify(contributionPayload)
      });

      const result = await response.text();
      console.log('Contribution response:', result.substring(0, 200) + '...');
      
      // Mock NFT receipt ID for demonstration
      const nftId = `NFT-${Math.floor(Math.random() * 1000000)}`;

      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === campaignId 
            ? { 
                ...campaign, 
                current_funding: campaign.current_funding + contributionAmount,
                supporters_count: campaign.supporters_count + 1
              }
            : campaign
        )
      );

      setMessage(`Successfully contributed ${amount} ${currency}! NFT Receipt: ${nftId}`);
      setContributionAmounts(prev => ({ ...prev, [campaignId]: '' }));
      
    } catch (error) {

      setMessage(`Contribution failed: ${error}`);
    } finally {
      setContributing(null);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const formatICP = (amount: number) => {
    return (amount / 1e8).toFixed(2);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
        <span className="ml-2">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Explore Campaigns</h2>
        <button
          onClick={loadCampaigns}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No campaigns found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{campaign.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  campaign.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {campaign.is_active ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
              
            
              <div className="flex items-center mb-3 text-sm">
                <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-gray-700">@{campaign.youtube_channel}</span>
                <span className="text-gray-500 ml-2">• ${campaign.estimated_monthly_revenue}/mo</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress:</span>
                    <span className="font-semibold">
                      {formatICP(campaign.current_funding)} / {formatICP(campaign.goal)} ICP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgressPercentage(campaign.current_funding, campaign.goal)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{campaign.supporters_count} supporters</span>
                    <span>{Math.round(getProgressPercentage(campaign.current_funding, campaign.goal))}% funded</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Revenue Share:</span>
                  <span className="font-semibold text-green-600">{campaign.revenue_share}%</span>
                </div>

                {campaign.is_active && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-3">
          
                      <select
                        value={selectedCurrency[campaign.id] || 'ICP'}
                        onChange={(e) => setSelectedCurrency(prev => ({ 
                          ...prev, 
                          [campaign.id]: e.target.value 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                      >
                        <option value="ICP">ICP (Internet Computer)</option>
                        <option value="ckBTC">ckBTC (Chain-key Bitcoin)</option>
                        <option value="ckETH">ckETH (Chain-key Ethereum)</option>
                      </select>
                      
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={contributionAmounts[campaign.id] || ''}
                          onChange={(e) => setContributionAmounts(prev => ({ 
                            ...prev, 
                            [campaign.id]: e.target.value 
                          }))}
                          placeholder={`${selectedCurrency[campaign.id] || 'ICP'} amount`}
                          min="0.1"
                          step="0.1"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                        />
                        <button
                          onClick={() => contribute(campaign.id)}
                          disabled={contributing === campaign.id || !isAuthenticated}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                        >
                          {contributing === campaign.id ? 'Funding...' : 'Fund'}
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        You'll receive an NFT representing your {campaign.revenue_share}% share
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={`mt-6 p-4 rounded-lg ${
          message.includes('Successfully') 
            ? 'bg-green-100 border border-green-300 text-green-800' 
            : 'bg-red-100 border border-red-300 text-red-800'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};
