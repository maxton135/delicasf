import { NextResponse } from 'next/server';
import { orderConfigService } from '../../../db/operations';

export async function GET() {
  try {
    const config = await orderConfigService.getOrderConfig();
    
    if (!config) {
      // Return default values if no config exists
      return NextResponse.json({
        ordersEnabled: true,
        disabledMessage: "Online ordering is currently unavailable. Please call us to place your order.",
      });
    }
    
    const response = NextResponse.json({
      ordersEnabled: config.ordersEnabled,
      disabledMessage: config.disabledMessage,
    });
    
    // Disable all caching to ensure immediate updates
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('API Error:', error);
    // Return default values on error to prevent breaking the frontend
    return NextResponse.json({
      ordersEnabled: true,
      disabledMessage: "Online ordering is currently unavailable. Please call us to place your order.",
    });
  }
}