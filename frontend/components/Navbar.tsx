'use client';

import Link from 'next/link';
import IPXComponents from './IPXComponents';

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
         
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IPX</span>
              </div>
              <span className="text-xl font-bold text-gray-900">IPX Protocol</span>
            </Link>
          </div>

       
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/create-campaign" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Start Campaign
            </Link>
            <Link 
              href="/explore" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Explore Campaigns
            </Link>
            <Link 
              href="/my-nfts" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              My NFTs
            </Link>
          </div>

       
          <div className="flex items-center">
            <IPXComponents />
          </div>

      
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
