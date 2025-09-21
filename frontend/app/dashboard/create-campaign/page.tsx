"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';

export default function CreateCampaign() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState('');

  const handleCreate = () => {
    if (campaignName.trim() === '') {
      alert('Campaign name cannot be empty');
      return;
    }

    console.log('Creating campaign:', campaignName);
    // Simulate campaign creation
    setTimeout(() => {
      alert(`Campaign "${campaignName}" created successfully!`);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4">Create Campaign</h1>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Enter campaign name"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Create Campaign
        </Button>
      </div>
    </div>
  );
}
