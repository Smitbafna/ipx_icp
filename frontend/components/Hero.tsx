import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-indigo-400 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-blue-500/20 px-4 py-2 rounded-full text-blue-200 font-semibold mb-6">
              Built on Internet Computer
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transform IP Into 
              <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {" "}Liquid Assets
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-lg">
              IPX Protocol enables fractional ownership of intellectual property. 
              Creators raise capital, investors earn revenue share automatically.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/create-campaign" className="bg-white hover:bg-gray-100 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg">
                Start Campaign
              </Link>
              <Link href="/explore" className="border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all text-white">
                Explore Campaigns
              </Link>
            </div>
          </div>
          
          <div className="relative">
            {/* Placeholder for hero image */}
            <div className="bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-2xl p-8 shadow-2xl border border-white/20">
              <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
                <div className="absolute inset-0 opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">IPX Protocol</h3>
                    <p className="text-white/80">Tokenizing IP on the Internet Computer</p>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-24 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute top-10 left-4 w-16 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-24 h-2 bg-white/30 rounded-full"></div>
                <div className="absolute bottom-10 right-4 w-16 h-2 bg-white/30 rounded-full"></div>
              </div>
              
              {/* Stats displayed in cards */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-sm text-blue-100">Total Value Locked</div>
                  <div className="text-xl font-bold text-white">$4.2M</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-sm text-blue-100">Active Campaigns</div>
                  <div className="text-xl font-bold text-white">142</div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-blue-100">Verified by</div>
                  <div className="text-sm font-bold text-white">Internet Computer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white text-white overflow-hidden">
        <svg className="absolute bottom-0 fill-current text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
        </svg>
      </div>
    </section>
  );
}
