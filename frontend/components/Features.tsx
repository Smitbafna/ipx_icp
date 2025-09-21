import Image from 'next/image';

export default function Features() {
  const features = [
    {
      title: "NFT Registry",
      description: "Secure token registry for intellectual property assets on the Internet Computer blockchain",
      icon: "",
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Vault System",
      description: "Transparent storage and management of funds with automated revenue distribution",
      icon: "",
      color: "from-indigo-500 to-purple-600"
    },
    {
      title: "Oracle Integration",
      description: "Real-time data feeds connect off-chain revenue sources to on-chain distribution",
      icon: "",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Campaign Factory",
      description: "Launch customizable IP tokenization campaigns with flexible terms and governance",
      icon: "",
      color: "from-pink-500 to-red-600"
    },
    {
      title: "Revenue Streaming",
      description: "Continuous micropayments ensure creators and investors receive earnings in real-time",
      icon: "",
      color: "from-red-500 to-orange-600"
    },
    {
      title: "DAO Governance",
      description: "Democratic ecosystem management with proposal-based decision making for protocol upgrades",
      icon: "🏛️",
      color: "from-orange-500 to-yellow-600"
    }
  ];

  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Powerful Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            IPX Protocol combines advanced blockchain technology with real-world IP management
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100"
            >
              <div className={`w-14 h-14 mb-6 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${feature.color}`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Built on Internet Computer</h3>
              <p className="text-lg text-gray-600 mb-6">
                The IPX Protocol leverages the Internet Computer blockchain's unique capabilities:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <span className="text-gray-800 font-medium">Canister Smart Contracts</span>
                    <p className="text-gray-600">Powerful WebAssembly containers with unbounded capacity</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <span className="text-gray-800 font-medium">Reverse Gas Model</span>
                    <p className="text-gray-600">No gas fees for users, making frictionless micropayments possible</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <span className="text-gray-800 font-medium">Chain-Key Cryptography</span>
                    <p className="text-gray-600">Secure threshold signatures for seamless cross-chain integration</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Internet Computer logo placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                  <div className="text-white text-5xl font-bold">IC</div>
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute w-full h-full animate-spin-slow">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-lg">🔗</div>
                  </div>
                </div>
                <div className="absolute w-full h-full animate-spin-slow-reverse" style={{ animationDelay: '-5s' }}>
                  <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-lg">💻</div>
                  </div>
                </div>
                <div className="absolute w-full h-full animate-spin-slow" style={{ animationDelay: '-10s' }}>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-lg">🌐</div>
                  </div>
                </div>
                <div className="absolute w-full h-full animate-spin-slow-reverse" style={{ animationDelay: '-15s' }}>
                  <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg">⚡</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
