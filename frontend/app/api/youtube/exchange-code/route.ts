import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { ProofType } from '../../../../types/youtube';
import { generateZkProof } from '../../../../lib/zkProofUtils';

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { code, proofType = ProofType.ChannelOwnership } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

  
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ['snippet', 'statistics'],
      mine: true
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return NextResponse.json({ error: 'No channel found for this user' }, { status: 404 });
    }

    const channelData = channelResponse.data.items[0];

    
    const formattedData = {
      id: channelData.id,
      title: channelData.snippet?.title,
      snippet: {
        publishedAt: channelData.snippet?.publishedAt
      },
      statistics: {
        subscriberCount: channelData.statistics?.subscriberCount,
        viewCount: channelData.statistics?.viewCount,
        videoCount: channelData.statistics?.videoCount
      }
    };

   
    console.log("API: Starting ZK proof generation for YouTube channel:", formattedData.id);
    
    // Generate the ZK proof
    const zkProof = await generateZkProof(formattedData, proofType as ProofType);
    
    console.log("API: ZK proof generation complete!");
    console.log("API: Proof size:", zkProof.proof_bytes.length, "bytes");
    console.log("API: Public inputs:", zkProof.public_inputs);
    
    return NextResponse.json({
      channelData: formattedData,
      zkProof: {
        proof_bytes: Array.from(zkProof.proof_bytes), 
        public_inputs: zkProof.public_inputs,
        timestamp: Date.now()
      }
    });
    
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 }
    );
  }
}
