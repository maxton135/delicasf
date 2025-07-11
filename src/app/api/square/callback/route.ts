import { NextResponse } from 'next/server';
import { SquareClient, SquareEnvironment } from 'square';

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
    const client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: SquareEnvironment.Sandbox
    });

    // Exchange the authorization code for tokens
    const response = await client.oAuth.obtainToken({
      clientId: process.env.SQUARE_APPLICATION_ID!,
      clientSecret: process.env.SQUARE_APPLICATION_SECRET!,
      grantType: 'authorization_code',
      code,
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/square/callback`
    });

    // Handle the response with proper typing
    const responseData = response as any;
    if (!responseData.result?.accessToken) {
      throw new Error('Failed to obtain access token');
    }

    // Store the tokens securely (you should implement your own storage solution)
    // For example, you might want to store these in a database
    const tokens = {
      accessToken: responseData.result.accessToken,
      refreshToken: responseData.result.refreshToken,
      merchantId: responseData.result.merchantId,
      expiresAt: new Date(Date.now() + ((responseData.result.expiresIn || 0) * 1000))
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