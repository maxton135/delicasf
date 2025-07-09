import { NextRequest, NextResponse } from 'next/server';
import { orderConfigService } from '../../../../db/operations';

export async function GET() {
  try {
    const config = await orderConfigService.getOrderConfig();
    
    if (!config) {
      return NextResponse.json(
        { error: 'No order configuration found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ordersEnabled: config.ordersEnabled,
      disabledMessage: config.disabledMessage,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (typeof body.ordersEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'ordersEnabled must be a boolean value' },
        { status: 400 }
      );
    }
    
    if (body.disabledMessage && typeof body.disabledMessage !== 'string') {
      return NextResponse.json(
        { error: 'disabledMessage must be a string' },
        { status: 400 }
      );
    }
    
    // Update the configuration using database service
    const updatedConfig = await orderConfigService.updateOrderConfig({
      ordersEnabled: body.ordersEnabled,
      disabledMessage: body.disabledMessage,
    });
    
    return NextResponse.json({
      ordersEnabled: updatedConfig.ordersEnabled,
      disabledMessage: updatedConfig.disabledMessage,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update order configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate and update only provided fields
    const updates: { ordersEnabled?: boolean; disabledMessage?: string } = {};
    
    if (body.ordersEnabled !== undefined) {
      if (typeof body.ordersEnabled !== 'boolean') {
        return NextResponse.json(
          { error: 'ordersEnabled must be a boolean value' },
          { status: 400 }
        );
      }
      updates.ordersEnabled = body.ordersEnabled;
    }
    
    if (body.disabledMessage !== undefined) {
      if (typeof body.disabledMessage !== 'string') {
        return NextResponse.json(
          { error: 'disabledMessage must be a string' },
          { status: 400 }
        );
      }
      updates.disabledMessage = body.disabledMessage;
    }
    
    // Update the configuration using database service
    const updatedConfig = await orderConfigService.updateOrderConfig(updates);
    
    return NextResponse.json({
      ordersEnabled: updatedConfig.ordersEnabled,
      disabledMessage: updatedConfig.disabledMessage,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update order configuration' },
      { status: 500 }
    );
  }
}