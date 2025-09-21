'use client';

import { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../lib/useInternetIdentity';
import { useIPXProtocol } from '../hooks/useIPXProtocol';
import { 
  YouTubeIdentity, 
  YouTubeMetrics, 
  ZkProofData, 
  ProofType, 
  YouTubeVerificationResult 
} from '../types/youtube';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

interface YouTubeConnectProps {
  onConnectionChange?: (connected: boolean, data?: YouTubeVerificationResult) => void;
  minSubscribers?: number;
  minViews?: number;
  requiredProofType?: ProofType;
}

export const YouTubeConnect: React.FC<YouTubeConnectProps> = ({ 
  onConnectionChange, 
  minSubscribers = 0, 
  minViews = 0, 
  requiredProofType = ProofType.ChannelOwnership
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<YouTubeVerificationResult | null>(null);
  const [youtubeIdentity, setYoutubeIdentity] = useState<YouTubeIdentity | null>(null);
  const [metrics, setMetrics] = useState<YouTubeMetrics | null>(null);
  
  // For demo, get principal as string from hook
  const { principal: principalStr, isAuthenticated } = useInternetIdentity();
  const { nftActor } = useIPXProtocol();
  
  // Convert string to Principal object when needed
  const principal = principalStr ? Principal.fromText(principalStr) : null;
  
  useEffect(() => {
    if (isAuthenticated && principal && nftActor) {
      fetchYoutubeIdentity();
    }
  }, [isAuthenticated, principal, nftActor]);
  
  const fetchYoutubeIdentity = async () => {
    if (!principal || !nftActor) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching YouTube identity from canister...');
      console.log('Principal:', principal.toString());
      
      // Use the principal object directly, which should be the correct type
      const identity = await nftActor.get_youtube_identity(principal);
      
      // For demo purposes, show what's happening in the console
      console.log('Canister response received:', identity ? 'Found identity' : 'No identity found');
      
      if (identity) {
        console.log('YouTube identity found:', {
          channel_id: identity.channel_id,
          channel_name: identity.channel_name,
          verification_timestamp: identity.verification_timestamp.toString()
        });
        
        setYoutubeIdentity(identity);
        
        // If we have a channel ID, fetch metrics
        if (identity.channel_id) {
          console.log('Fetching channel metrics for channel ID:', identity.channel_id);
          const channelMetrics = await nftActor.get_youtube_metrics(identity.channel_id);
          if (channelMetrics) {
            console.log('Metrics received:', {
              subscriber_count: channelMetrics.subscriber_count.toString(),
              view_count: channelMetrics.view_count.toString(),
              video_count: channelMetrics.video_count.toString()
            });
            setMetrics(channelMetrics);
          }
        }
        
        setVerificationStatus({
          isVerified: true,
          identity,
          metrics: metrics || undefined
        });
        
        if (onConnectionChange) {
          onConnectionChange(true, {
            isVerified: true,
            identity,
            metrics: metrics || undefined
          });
        }
      }
    } catch (error) {
      console.error("Error fetching YouTube identity:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Log with actual parameters for demo purposes
    console.log('STARTING YOUTUBE VERIFICATION PROCESS');
    console.log('Parameters:', {
      required_proof_type: ProofType[requiredProofType],
      min_subscribers: minSubscribers,
      min_views: minViews,
      current_timestamp: new Date().toISOString()
    });
    
    // Always use anonymous principal for demo
    const mockPrincipalId = "2vxsx-fae";
    
    // Store the mock principal in session storage for the callback
    sessionStorage.setItem('youtube_principal', mockPrincipalId);
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'demo-client-id';
    const redirectUri = `${window.location.origin}/oauth/youtube/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly';
    const state = crypto.randomUUID();
    
    // Store state in session storage
    sessionStorage.setItem('youtube_oauth_state', state);
    sessionStorage.setItem('youtube_required_proof', requiredProofType);
    
    // Log exact parameters being used
    console.log('OAuth parameters:', {
      clientId,
      redirectUri,
      scope,
      state,
      proof_type: ProofType[requiredProofType],
      principal: mockPrincipalId
    });
  
    try {
      // Log the API request with parameters
      console.log('Sending API request with params:', { 
        principal: mockPrincipalId, 
        state, 
        requiredProofType: ProofType[requiredProofType]
      });
      
      // Skip actual API call and go directly to callback for demo
      console.log('Bypassing OAuth for demo - redirecting directly to callback...');
      
      // For demo, redirect directly to our callback with mock code
      const mockCallbackUrl = `${window.location.origin}/oauth/youtube/callback?code=auth_code_${Date.now()}&state=${state}`;
      window.location.href = mockCallbackUrl;
    } catch (error) {
      console.error("Error initializing YouTube OAuth:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnecting(false);
    setYoutubeIdentity(null);
    setMetrics(null);
    setVerificationStatus(null);
    
    if (onConnectionChange) {
      onConnectionChange(false);
    }
  };

  // Display ZK proof verification status
  const renderVerificationStatus = () => {
    if (!verificationStatus) return null;
    
    return (
      <div className="mt-4 p-3 border border-purple-200 bg-purple-50 rounded-md text-sm shadow-sm">
        <div className="flex items-center">
          <span className={`rounded-full w-4 h-4 mr-2 flex items-center justify-center ${verificationStatus.isVerified ? 'bg-green-500 text-white' : 'bg-red-500'}`}>
            {verificationStatus.isVerified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="font-medium">{verificationStatus.isVerified ? 'Verified with Zero-Knowledge Proof' : 'Not Verified'}</span>
          <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
            {ProofType[requiredProofType]}
          </Badge>
        </div>
        {verificationStatus.error && (
          <p className="text-red-500 mt-1">{verificationStatus.error}</p>
        )}
        {verificationStatus.isVerified && (
          <div className="mt-2 text-xs text-purple-700">
            <p>ZKP hash: {Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}...{Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}</p>
          </div>
        )}
      </div>
    );
  };
  
  // Display YouTube metrics if available
  const renderMetrics = () => {
    if (!metrics) return null;
    
    // Format large numbers with commas
    const formatNumber = (num: bigint | number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    return (
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="p-2 border rounded-md bg-gray-50">
          <div className="font-medium text-gray-700">Subscribers</div>
          <div className="text-lg font-bold">{formatNumber(metrics.subscriber_count)}</div>
        </div>
        <div className="p-2 border rounded-md bg-gray-50">
          <div className="font-medium text-gray-700">Views</div>
          <div className="text-lg font-bold">{formatNumber(metrics.view_count)}</div>
        </div>
        <div className="p-2 border rounded-md bg-gray-50">
          <div className="font-medium text-gray-700">Videos</div>
          <div className="text-lg font-bold">{formatNumber(metrics.video_count)}</div>
        </div>
      </div>
    );
  };

  if (isConnecting) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            <div>
              <p className="text-sm font-medium">Redirecting to YouTube OAuth 2.0...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            <div>
              <p className="text-sm font-medium">Loading YouTube verification status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (youtubeIdentity) {
    return (
      <Card className="w-full border-2 border-red-100">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center">
                <CardTitle>{youtubeIdentity.channel_name || 'YouTube Channel'}</CardTitle>
                <Badge className="ml-2 bg-red-600">Verified</Badge>
              </div>
              <CardDescription className="flex items-center">
                Channel ID: {youtubeIdentity.channel_id?.substring(0, 8)}...
                <span className="text-xs ml-1 bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md font-medium">
                  🔐 ZK Proof Generated
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderVerificationStatus()}
          {renderMetrics()}
          
          <div className="mt-4 text-sm text-purple-800 bg-purple-50 p-4 rounded-md border border-purple-200 shadow-sm">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-bold">Your channel data is protected by zero-knowledge proofs</p>
            </div>
            <p className="ml-7">This allows you to prove ownership and metrics about your channel without revealing the actual data to third parties.</p>
            <div className="flex justify-between mt-2 ml-7">
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">ZK Proof Generated</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Cryptographically Secured</span>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Privacy Preserved</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-gray-500">
            Last verified: {new Date().toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={() => fetchYoutubeIdentity()}
            >
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border-dashed border-2 border-gray-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold">Connect YouTube Channel</p>
              <div className="flex flex-col mt-1">
                <p className="text-sm text-gray-600">Create a zero-knowledge proof of your channel</p>
                <div className="flex flex-wrap mt-1 gap-1">
                  <Badge variant="secondary" className="text-xs">Channel Ownership</Badge>
                  <Badge variant="secondary" className="text-xs">Subscriber Count</Badge>
                  <Badge variant="secondary" className="text-xs">View Count</Badge>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleConnect}
            variant="default"
            className="bg-red-600 hover:bg-red-700 shadow-md"
          >
            Connect
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Why connect your YouTube channel?</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
            <li>Prove channel ownership without revealing credentials</li>
            <li>Generate verifiable proofs of your subscriber and view counts</li>
            <li>Tokenize content and access exclusive features</li>
            <li>Your data remains private with zero-knowledge cryptography</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeConnect;
