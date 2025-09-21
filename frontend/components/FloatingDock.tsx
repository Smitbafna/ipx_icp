import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import WalletConnect from './WalletConnect';

export default function FloatingDock() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Create', path: '/create-campaign' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Documentation', path: '/docs' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div 
        className={`bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200 px-3 py-2 transition-all duration-300 pointer-events-auto ${
          isExpanded ? 'pr-6' : ''
        }`}
      >
        <div className="flex items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col space-y-1.5 w-6">
              <span className={`block h-0.5 w-6 bg-gray-600 transition-all ${isExpanded ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 bg-gray-600 transition-all ${isExpanded ? 'w-0 opacity-0' : 'w-6 opacity-100'}`}></span>
              <span className={`block h-0.5 w-6 bg-gray-600 transition-all ${isExpanded ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
          
          {/* Logo always visible */}
          <Link 
            href="/"
            className={`flex items-center ml-1 mr-2 transition-all ${isExpanded ? '' : 'lg:mr-0'}`}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-2">
              IPX
            </div>
            <span className={`font-bold text-blue-600 transition-all ${isExpanded ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
              IPX Protocol
            </span>
          </Link>

          {/* Navigation Items - hidden when collapsed on mobile/tablet */}
          <nav className={`transition-all duration-300 ${
            isExpanded 
              ? 'opacity-100 max-w-md' 
              : 'opacity-0 max-w-0 lg:opacity-100 lg:max-w-md overflow-hidden'
          }`}>
            <ul className="flex items-center space-x-1 px-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Wallet button - hidden when collapsed on mobile */}
          <div className={`ml-2 transition-all duration-300 ${
            isExpanded 
              ? 'opacity-100 w-auto' 
              : 'opacity-0 w-0 lg:opacity-100 lg:w-auto overflow-hidden'
          }`}>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}
