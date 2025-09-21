import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { principal, state, requiredProofType } = body;
    
    if (!principal || !state) {
      return NextResponse.json({ error: 'Principal and state are required' }, { status: 400 });
    }
    
    const scopes = ['https://www.googleapis.com/auth/youtube.readonly'];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state, 
      include_granted_scopes: true
    });
    
    return NextResponse.json({ 
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error initializing YouTube OAuth:', error);
    return NextResponse.json({ error: 'Failed to initialize OAuth' }, { status: 500 });
  }
}
