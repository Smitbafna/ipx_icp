'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import FloatingDock from '../components/FloatingDock';

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState('creator');

  const demoProjects = [
    {
      id: 1,
      title: "The Future of AI Series",
      creator: "TechInsight Channel",
      category: "YouTube",
      fundingGoal: 75000,
      currentFunding: 52000,
      investors: 104,
      monthlyRevenue: 8500,
      image: "/images/demo/ai-channel.jpg",
      description: "Popular YouTube channel covering AI advancements & ethics"
    },
    {
      id: 2,
      title: "Indie Game Soundtrack",
      creator: "Melodic Dreams Studio",
      category: "Spotify",
      fundingGoal: 30000,
      currentFunding: 21500,
      investors: 67,
      monthlyRevenue: 3800,
      image: "/images/demo/soundtrack.jpg",
      description: "Award-winning game soundtrack with consistent streaming revenue"
    },
    {
      id: 3,
      title: "Web3 Developer Newsletter",
      creator: "CryptoDevs Weekly",
      category: "Substack",
      fundingGoal: 25000,
      currentFunding: 25000,
      investors: 156,
      monthlyRevenue: 4200,
      image: "/images/demo/newsletter.jpg", 
      description: "Leading subscription newsletter for blockchain developers"
    },
    {
      id: 4,
      title: "Open Source React Library",
      creator: "DevForge Labs",
      category: "GitHub",
      fundingGoal: 40000,
      currentFunding: 27800,
      investors: 88,
      monthlyRevenue: 5100,
      image: "/images/demo/code-library.jpg",
      description: "Popular React component library with 12k GitHub stars"
    }
  ];

  const investorPortfolio = [
    { project: "The Future of AI Series", shares: 10, monthlyEarnings: 85, totalEarnings: 680 },
    { project: "Indie Game Soundtrack", shares: 5, monthlyEarnings: 60, totalEarnings: 420 },
    { project: "Web3 Developer Newsletter", shares: 8, monthlyEarnings: 77, totalEarnings: 539 },
    { project: "Indie Game Studio", shares: 15, monthlyEarnings: 45, totalEarnings: 315 },
    { project: "Podcast Network", shares: 8, monthlyEarnings: 32, totalEarnings: 224 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Navigation */}
      <FloatingDock />
      
      {/* Hero Section */}
      <Hero />
      
      {/* How It Works Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How IPX Protocol Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Creators Tokenize IP</h3>
              <p className="text-gray-600">Upload your intellectual property and create fractional ownership shares as NFTs on the Internet Computer</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Investors Buy Shares</h3>
              <p className="text-gray-600">Purchase fractional NFT shares to own a percentage of future revenue streams from digital assets</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Automatic Revenue</h3>
              <p className="text-gray-600">Oracle tracks earnings and distributes payments proportionally to shareholders in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Interactive Demo Section */}
      <section className="px-6 py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Experience the Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how creators and investors interact with the IPX Protocol ecosystem
            </p>
          </div>
          
          {/* Demo Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-md">
              <button
                onClick={() => setActiveDemo('creator')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeDemo === 'creator' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Creator View
              </button>
              <button
                onClick={() => setActiveDemo('investor')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  activeDemo === 'investor' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Investor View
              </button>
            </div>
          </div>

          {/* Creator Demo */}
          {activeDemo === 'creator' && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold mb-8 text-blue-600">Your Active Campaigns</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {demoProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all">
                    <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-white font-bold">{project.category}</span>
                    </div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">{project.title}</h4>
                    <p className="text-gray-600 mb-6">{project.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="text-blue-600 font-semibold">${project.currentFunding.toLocaleString()} / ${project.fundingGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investors:</span>
                        <span className="text-gray-900 font-semibold">{project.investors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Revenue:</span>
                        <span className="text-green-600 font-semibold">${project.monthlyRevenue.toLocaleString()}</span>
                      </div>
                      <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                        Manage Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investor Demo */}
          {activeDemo === 'investor' && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold mb-8 text-blue-600">Your Investment Portfolio</h3>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-xl font-bold mb-6 text-gray-900">Holdings</h4>
                  <div className="space-y-4">
                    {investorPortfolio.map((holding, index) => (
                      <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-lg text-gray-900">{holding.project}</span>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{holding.shares} shares</span>
                        </div>
                        <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                          <div>
                            <span className="text-gray-500 block mb-1">Monthly Earnings</span>
                            <span className="text-green-600 font-semibold text-lg">${holding.monthlyEarnings}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-500 block mb-1">Total Earned</span>
                            <span className="text-blue-600 font-semibold text-lg">${holding.totalEarnings}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold mb-6 text-gray-900">Revenue Analytics</h4>
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <span className="text-gray-600 block mb-1">Monthly Revenue</span>
                        <span className="text-green-600 font-bold text-2xl">$222</span>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <span className="text-gray-600 block mb-1">Total Earned</span>
                        <span className="text-blue-600 font-bold text-2xl">$1,639</span>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <span className="text-gray-600 block mb-1">Portfolio Value</span>
                        <span className="text-blue-600 font-bold text-2xl">$8,500</span>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <span className="text-gray-600 block mb-1">ROI</span>
                        <span className="text-green-600 font-bold text-2xl">19.3%</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl text-white">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Next Payment</span>
                        <span className="font-bold">2 days</span>
                      </div>
                      <div className="w-full bg-white/30 rounded-full h-2.5">
                        <div className="bg-white h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="text-center mt-4 text-white/80 text-sm">
                        Estimated next payment: $115
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose IPX Protocol</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on the Internet Computer for true decentralization and scalability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform -rotate-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Instant Funding</h3>
              <p className="text-gray-600">Raise capital without debt or giving up creative control of your IP</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-6">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Passive Income</h3>
              <p className="text-gray-600">Earn revenue share automatically from IP performance with transparent tracking</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform -rotate-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Transparent</h3>
              <p className="text-gray-600">All transactions and revenue tracking are publicly verifiable on the blockchain</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform rotate-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Automated</h3>
              <p className="text-gray-600">Smart contracts handle all revenue distribution without intermediaries</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your IP?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Join the future of intellectual property monetization on the Internet Computer blockchain
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/demo" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg">
              Try Interactive Demo
            </Link>
            <Link href="/dashboard" className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all text-white">
              Connect Wallet
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}