'use client';

import { CreateCampaign } from '../../components/CreateCampaign';

export default function CreateCampaignPage() {
  const handleCampaignCreated = () => {
    console.log('Campaign created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Campaign</h1>
          <p className="text-xl text-gray-600">
            Tokenize your intellectual property and raise funding from supporters
          </p>
        </div>
        
        <CreateCampaign onCampaignCreated={handleCampaignCreated} />
      </div>
    </div>
  );
}
