import { NextResponse } from 'next/server';

export async function GET() {
  console.log('API Route: Starting catalog fetch...');
  try {
    const baseUrl = 'https://connect.squareupsandbox.com';
    console.log('API Route: Using baseUrl:', baseUrl);

    const response = await fetch(`${baseUrl}/v2/catalog/list`, {
      headers: {
        'Square-Version': '2024-04-16',
        'Authorization': 'Bearer EAAAENBwqBv2oXZn6jUr9mb90iH0_HWWgaHve9nYFaImt5iOBRcZyW_icBA396D7',
        'Content-Type': 'application/json'
      }
    });

    console.log('API Route: Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Route: Error response:', error);
      throw new Error(error.message || 'Failed to fetch catalog');
    }

    const data = await response.json();
    console.log('API Route: Successfully fetched data');
    
    return NextResponse.json({ 
      success: true,
      data
    });
  } catch (error: any) {
    console.error('API Route: Error caught:', error);

    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch catalog',
      details: error.message
    }, { status: 500 });
  }
}
