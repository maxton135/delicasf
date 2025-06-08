import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Square OAuth configuration
    const clientId = process.env.SQUARE_APPLICATION_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/square/callback`;
    const scopes = [
      'ORDERS_READ',
      'ORDERS_WRITE',
      'PAYMENTS_READ',
      'PAYMENTS_WRITE',
      'CUSTOMERS_READ',
      'CUSTOMERS_WRITE',
      'MERCHANT_PROFILE_READ'
    ].join(' ');

    // Construct the Square OAuth URL
    const authUrl = `https://connect.squareup.com/oauth2/authorize?client_id=${clientId}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({ 
      success: true,
      authUrl
    });
  } catch (error: any) {
    console.error('Square OAuth error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate authorization URL',
      details: error.message
    }, { status: 500 });
  }
} 