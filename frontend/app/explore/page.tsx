'use client';

import { CampaignExplorer } from '../../components/CampaignExplorer';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Campaigns</h1>
          <p className="text-xl text-gray-600">
            Discover innovative projects and earn revenue share by supporting creators
          </p>
        </div>
        
        <CampaignExplorer />
      </div>
    </div>
  );
}
