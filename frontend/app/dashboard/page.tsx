'use client';

import { useState } from 'react';
import Link from 'next/link';

// Enum for slash reasons
enum SlashReason {
  MissedRevenueReports = "Missed Revenue Reports",
  RevenueFraud = "Revenue Fraud",
  ProjectAbandonment = "Project Abandonment",
  GovernanceDecision = "Governance Decision"
}

// Mock data for slash events
interface SlashEvent {
  id: number;
  date: string;
  reason: string;
  amountSlashed: number;
  approvedBy: string[];
  evidence: string;
}

// Mock data for insurance claims
interface InsuranceClaim {
  id: number;
  date: string;
  amount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
}

// Campaign interface
interface Campaign {
  id: number;
  title: string;
  creator: string;
  insuranceFee: number;
  insuranceCoverage: number;
  totalInvestment: number;
  status: string;
  category: string;
  currentFunding: number;
  fundingGoal: number;
  investors: number;
  monthlyRevenue: number;
}

// Portfolio stats interface
interface PortfolioStats {
  totalInvested: number;
  totalValue: number;
  monthlyIncome: number;
  totalEarnings: number;
}

// Investment interface
interface Investment {
  id: number;
  campaignTitle: string;
  shares: number;
  initialInvestment: number;
  monthlyEarnings: number;
  totalEarnings: number;
  currentValue: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('slashing');
  const [walletConnected, setWalletConnected] = useState(true);
  const [slashModalOpen, setSlashModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [slashingReason, setSlashingReason] = useState<SlashReason>(SlashReason.MissedRevenueReports);
  const [evidence, setEvidence] = useState('');
  const [claimAmount, setClaimAmount] = useState(0);
  const [claimReason, setClaimReason] = useState('');
  const [showSlashNotification, setShowSlashNotification] = useState(true);
  const [insurancePoolAmount, setInsurancePoolAmount] = useState(5000000);
  const [lastSlashDate, setLastSlashDate] = useState('2023-07-15');
  
  // Mock slashing events data
  const [slashEvents, setSlashEvents] = useState<SlashEvent[]>([
    {
      id: 1,
      date: '2023-07-15',
      reason: SlashReason.RevenueFraud,
      amountSlashed: 250000,
      approvedBy: [
        'rrkah-fqaaa-aaaaa-aaaaq-cai',
        'renrk-eyaaa-aaaaa-aaada-cai',
        'rdmx6-jaaaa-aaaaa-aaadq-cai'
      ],
      evidence: 'https://github.com/on-chain-evidence/slash-001.md'
    },
    {
      id: 2,
      date: '2023-06-22',
      reason: SlashReason.MissedRevenueReports,
      amountSlashed: 100000,
      approvedBy: [
        'rrkah-fqaaa-aaaaa-aaaaq-cai',
        'renrk-eyaaa-aaaaa-aaada-cai',
      ],
      evidence: 'https://github.com/on-chain-evidence/slash-002.md'
    },
    {
      id: 3,
      date: '2023-05-07',
      reason: SlashReason.ProjectAbandonment,
      amountSlashed: 750000,
      approvedBy: [
        'rrkah-fqaaa-aaaaa-aaaaq-cai',
        'renrk-eyaaa-aaaaa-aaada-cai',
        'rdmx6-jaaaa-aaaaa-aaadq-cai',
        'r7inp-6aaaa-aaaaa-aaabq-cai'
      ],
      evidence: 'https://github.com/on-chain-evidence/slash-003.md'
    }
  ]);

  // Mock insurance claims data
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([
    {
      id: 1,
      date: '2023-07-18',
      amount: 120000,
      reason: 'Compensation for project abandonment - BassFX',
      status: 'Approved'
    },
    {
      id: 2,
      date: '2023-07-25',
      amount: 75000,
      reason: 'Revenue manipulation compensation - MelodicMinds',
      status: 'Pending'
    },
    {
      id: 3,
      date: '2023-06-30',
      amount: 50000,
      reason: 'Missed milestone deadlines - AudioWave',
      status: 'Paid'
    }
  ]);
  
  // Mock campaigns that have insurance protection
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: "Midnight Vibes Album",
      creator: "Luna Echo",
      insuranceFee: 1040, // 2% of investment
      insuranceCoverage: 80, // 80% coverage
      totalInvestment: 52000,
      status: "active",
      category: "Music",
      currentFunding: 42000,
      fundingGoal: 50000,
      investors: 35,
      monthlyRevenue: 3200
    },
    {
      id: 2,
      title: "TaskFlow Mobile App",
      creator: "DevStudio Inc",
      insuranceFee: 3000, // 2% of investment
      insuranceCoverage: 80, // 80% coverage
      totalInvestment: 150000,
      status: "funded",
      category: "Software",
      currentFunding: 150000,
      fundingGoal: 150000,
      investors: 120,
      monthlyRevenue: 12500
    }
  ]);

  // Mock portfolio stats
  const portfolioStats: PortfolioStats = {
    totalInvested: 45000,
    totalValue: 52000,
    monthlyIncome: 1200,
    totalEarnings: 7000
  };

  // Mock investments
  const investments: Investment[] = [
    {
      id: 1,
      campaignTitle: "Midnight Vibes Album",
      shares: 500,
      initialInvestment: 25000,
      monthlyEarnings: 750,
      totalEarnings: 4500,
      currentValue: 30000
    },
    {
      id: 2,
      campaignTitle: "TaskFlow Mobile App",
      shares: 200,
      initialInvestment: 20000,
      monthlyEarnings: 450,
      totalEarnings: 2500,
      currentValue: 22000
    }
  ];
  
  // Function to handle propose slashing submission
  const handleProposeSlashing = () => {
    // Here you would call the canister method: propose_slashing
    console.log('Proposing slashing:', {
      reason: slashingReason,
      evidence
    });
    
    // Mock adding a new slash event
    const newEvent: SlashEvent = {
      id: slashEvents.length + 1,
      date: new Date().toISOString().split('T')[0],
      reason: slashingReason,
      amountSlashed: 300, // Mock amount
      approvedBy: ['2vxsx-fae'], // Current user principal
      evidence: evidence
    };
    
    setSlashEvents([...slashEvents, newEvent]);
    
    // Update pool amount
    setInsurancePoolAmount(prev => prev + 300);
    setLastSlashDate(new Date().toISOString().split('T')[0]);
    
    // Close modal
    setSlashModalOpen(false);
    setEvidence('');
    
    // Show notification
    setShowSlashNotification(true);
    
    // After 5 seconds, hide notification
    setTimeout(() => {
      setShowSlashNotification(false);
    }, 5000);
  };
  
  // Function to handle insurance claim submission
  const handleInsuranceClaim = () => {
    console.log('Filing insurance claim:', {
      amount: claimAmount,
      reason: claimReason
    });
    
    // Mock adding a new claim
    const newClaim: InsuranceClaim = {
      id: insuranceClaims.length + 1,
      date: new Date().toISOString().split('T')[0],
      amount: claimAmount,
      reason: claimReason,
      status: 'Pending'
    };
    
    setInsuranceClaims([...insuranceClaims, newClaim]);
    
    // Close modal
    setClaimModalOpen(false);
    setClaimAmount(0);
    setClaimReason('');
  };
  
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 rounded-lg backdrop-blur">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">
            Connect your Internet Identity to access the IPX Protocol dashboard
          </p>
          <button
            onClick={() => setWalletConnected(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-lg font-semibold transition-colors mb-4"
          >
            Connect Internet Identity
          </button>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Slashing Event Notification */}
      {showSlashNotification && (
        <div className="bg-red-500 text-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Slashing event occurred! Insurance pool increased. You are protected.</span>
            </div>
            <button onClick={() => setShowSlashNotification(false)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            IPX Protocol
          </Link>
         
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg w-fit">
          {['slashing', 'insurance', 'governance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Slashing Tab */}
        {activeTab === 'slashing' && (
          <div className="space-y-8">
         

            {/* Slashing History */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Slashing Events</h3>
                <button
                  onClick={() => setSlashModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Propose Slashing
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Amount Slashed</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Approved By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slashEvents.map((event) => (
                      <tr key={event.id} className="border-t border-gray-700">
                        <td className="px-6 py-4">{event.date}</td>
                        <td className="px-6 py-4">{event.reason}</td>
                        <td className="px-6 py-4 text-red-400">{event.amountSlashed} ICP</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {event.approvedBy.map((principal, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                {principal.substring(0, 8)}...
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={event.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <div className="space-y-8">
            {/* Insurance Pool Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Insurance Pool Balance</h3>
                <p className="text-2xl font-bold text-green-400">${insurancePoolAmount.toLocaleString()} ICP</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">My Protected Investments</h3>
                <p className="text-2xl font-bold">${portfolioStats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Insurance Coverage</h3>
                <p className="text-2xl font-bold text-blue-400">80%</p>
                <p className="text-xs text-gray-400 mt-2">Standard coverage for all campaigns</p>
              </div>
            </div>

            {/* Insurance Claims */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Insurance Claims</h3>
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  File New Claim
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceClaims.map((claim) => (
                      <tr key={claim.id} className="border-t border-gray-700">
                        <td className="px-6 py-4">{claim.date}</td>
                        <td className="px-6 py-4">{claim.amount} ICP</td>
                        <td className="px-6 py-4">{claim.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            claim.status === 'Approved' ? 'bg-green-500/30 text-green-300' :
                            claim.status === 'Paid' ? 'bg-blue-500/30 text-blue-300' :
                            claim.status === 'Rejected' ? 'bg-red-500/30 text-red-300' :
                            'bg-yellow-500/30 text-yellow-300'
                          }`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {claim.status === 'Approved' && (
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              Withdraw Funds
                            </button>
                          )}
                          {claim.status === 'Pending' && (
                            <button className="text-red-400 hover:text-red-300 text-sm">
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Protected Campaigns */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Protected Campaigns</h3>
              
              <div className="grid gap-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-gray-700/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h4 className="font-semibold">{campaign.title}</h4>
                      <p className="text-sm text-gray-400">by {campaign.creator}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-400">Total Investment</p>
                        <p className="font-semibold">{campaign.totalInvestment} ICP</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Insurance Fee</p>
                        <p className="font-semibold text-purple-400">{campaign.insuranceFee} ICP</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Coverage</p>
                        <p className="font-semibold text-blue-400">{campaign.insuranceCoverage}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Governance Tab */}
        {activeTab === 'governance' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Governance Tokens</h3>
                <p className="text-2xl font-bold text-purple-400">250 IPX</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Voting Power</h3>
                <p className="text-2xl font-bold">0.25%</p>
                <p className="text-xs text-gray-400 mt-2">of total network</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Active Proposals</h3>
                <p className="text-2xl font-bold text-yellow-400">3</p>
                <p className="text-xs text-gray-400 mt-2">requiring your vote</p>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Active Governance Proposals</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">Update Slashing Parameters</h4>
                    <span className="px-2 py-1 bg-blue-600 rounded text-xs">Technical</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Proposal to modify the threshold for automatic slashing events from 3 reports to 5 reports.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
                        Reject
                      </button>
                    </div>
                    <span className="text-sm">
                      Ends in 3 days
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">Add New Insurance Pool Collateral</h4>
                    <span className="px-2 py-1 bg-yellow-600 rounded text-xs">Financial</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Proposal to allow ICP, BTC, and ETH as collateral for the insurance pool.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
                        Reject
                      </button>
                    </div>
                    <span className="text-sm">
                      Ends in 5 days
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">New Insurance Premium Model</h4>
                    <span className="px-2 py-1 bg-purple-600 rounded text-xs">Economic</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Proposal to implement a risk-based variable insurance premium model based on campaign track records.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="px-4 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm">
                        Reject
                      </button>
                    </div>
                    <span className="text-sm">
                      Ends in 2 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Slashing Modal */}
      {slashModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Propose Slashing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  value={slashingReason}
                  onChange={(e) => setSlashingReason(e.target.value as SlashReason)}
                >
                  {Object.values(SlashReason).map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Evidence</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="Link to evidence"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setSlashModalOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProposeSlashing}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Propose Slashing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Insurance Claim Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">File Insurance Claim</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Claim Amount (ICP)</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  placeholder="0"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reason</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-32"
                  placeholder="Explain why you're filing this claim"
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInsuranceClaim}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 rounded-lg backdrop-blur">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">
            Connect your Internet Identity to access the IPX Protocol dashboard
          </p>
          <button
            onClick={() => setWalletConnected(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-lg font-semibold transition-colors mb-4"
          >
            Connect Internet Identity
          </button>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
  );
}  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Slashing Event Notification */}
      {showSlashNotification && (
        <div className="bg-red-500 text-white px-6 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Slashing event occurred! Insurance pool increased. You are protected.</span>
            </div>
            <button onClick={() => setShowSlashNotification(false)} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            IPX Protocol
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="ml-2 font-bold">10,000 ICP</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg w-fit">
          {['slashing', 'insurance', 'governance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Slashing Tab */}
        {activeTab === 'slashing' && (
          <div className="space-y-8">
            {/* Slashing and Insurance Pool Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Insurance Pool Balance</h3>
                <p className="text-2xl font-bold text-green-400">${insurancePoolAmount.toLocaleString()} ICP</p>
                <p className="text-xs text-gray-400 mt-2">
                  Last updated: {lastSlashDate} <span className="text-red-400">(Slashing Event)</span>
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Total Slashed Amount</h3>
                <p className="text-2xl font-bold text-red-400">
                  ${slashEvents.reduce((acc, event) => acc + event.amountSlashed, 0).toLocaleString()} ICP
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Slashing Events</h3>
                <p className="text-2xl font-bold">{slashEvents.length}</p>
              </div>
            </div>

            {/* Slashing History */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Slashing Events</h3>
                <button
                  onClick={() => setSlashModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Propose Slashing
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Reason</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Amount Slashed</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Approved By</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slashEvents.map((event) => (
                      <tr key={event.id} className="border-t border-gray-700">
                        <td className="px-6 py-4">{event.date}</td>
                        <td className="px-6 py-4">{event.reason}</td>
                        <td className="px-6 py-4 text-red-400">{event.amountSlashed} ICP</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {event.approvedBy.map((principal, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                                {principal.substring(0, 8)}...
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={event.evidence} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Campaigns</h2>
              <div className="flex gap-2">
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <option>All Categories</option>
                  <option>Music</option>
                  <option>Software</option>
                  <option>Education</option>
                </select>
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <option>Sort by Recent</option>
                  <option>Sort by Funding</option>
                  <option>Sort by Revenue</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      campaign.status === 'active' ? 'bg-blue-500' :
                      campaign.status === 'funded' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </span>
                    <span className="bg-purple-600 px-2 py-1 rounded text-xs">{campaign.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">by {campaign.creator}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((campaign.currentFunding / campaign.fundingGoal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(campaign.currentFunding / campaign.fundingGoal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>${campaign.currentFunding.toLocaleString()}</span>
                      <span>${campaign.fundingGoal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <span>Investors: {campaign.investors}</span>
                    <span className="text-green-400">Revenue: ${campaign.monthlyRevenue.toLocaleString()}/mo</span>
                  </div>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-lg font-semibold transition-colors">
                    {campaign.status === 'funded' ? 'View Details' : 'Invest Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Investments</h2>
            
            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Campaign</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Shares</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Investment</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Current Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Monthly Income</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total Earnings</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr key={investment.id} className="border-t border-gray-700">
                        <td className="px-6 py-4 font-semibold">{investment.campaignTitle}</td>
                        <td className="px-6 py-4">{investment.shares}</td>
                        <td className="px-6 py-4">${investment.initialInvestment}</td>
                        <td className="px-6 py-4 text-green-400">${investment.currentValue}</td>
                        <td className="px-6 py-4 text-blue-400">${investment.monthlyEarnings}</td>
                        <td className="px-6 py-4 text-yellow-400">${investment.totalEarnings}</td>
                        <td className="px-6 py-4">
                          <button className="text-purple-400 hover:text-purple-300 text-sm">
                            Trade Shares
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Create New Campaign</h2>
            
            <div className="bg-gray-800/50 rounded-lg p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Enter your project title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                    <option>Select category</option>
                    <option>Music</option>
                    <option>Software</option>
                    <option>Education</option>
                    <option>Gaming</option>
                    <option>Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-32"
                    placeholder="Describe your intellectual property"
                  ></textarea>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Funding Goal ($)</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Shares</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Revenue Sources</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Streaming/Downloads
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Licensing
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Subscriptions
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Merchandise
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">IP Documentation</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-2">📄</div>
                    <p className="text-gray-400">Upload your IP documentation, contracts, or proof of ownership</p>
                    <button type="button" className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
                      Choose Files
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  Create Campaign
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
