import { NextResponse } from 'next/server';
import { Client } from 'square';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      throw new Error(`Square OAuth error: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Initialize Square client
    const client = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: 'sandbox' // Change to 'production' for live environment
    });

    // Exchange the authorization code for tokens
    const response = await client.oAuth.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET!,
      grantType: 'authorization_code',
      code,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/square/callback`
    });

    if (!response.result.accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Store the tokens securely (you should implement your own storage solution)
    // For example, you might want to store these in a database
    const tokens = {
      accessToken: response.result.accessToken,
      refreshToken: response.result.refreshToken,
      merchantId: response.result.merchantId,
      expiresAt: new Date(Date.now() + (response.result.expiresIn * 1000))
    };

    // Redirect to a success page or return the tokens
    return NextResponse.json({
      success: true,
      message: 'Successfully authenticated with Square',
      merchantId: tokens.merchantId
    });

  } catch (error: any) {
    console.error('Square OAuth callback error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete OAuth flow',
      details: error.message
    }, { status: 500 });
  }
} 