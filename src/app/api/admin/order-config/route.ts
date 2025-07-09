import { NextRequest, NextResponse } from 'next/server';

// In a production environment, this would be stored in a database
// For now, we'll use a simple in-memory storage that resets on server restart
let orderConfig = {
  ordersEnabled: true,
  disabledMessage: "Online ordering is currently unavailable. Please call us to place your order."
};

export async function GET() {
  try {
    return NextResponse.json(orderConfig);
  } catch (error) {
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
    
    // Update the configuration
    orderConfig.ordersEnabled = body.ordersEnabled;
    
    if (body.disabledMessage) {
      orderConfig.disabledMessage = body.disabledMessage;
    }
    
    return NextResponse.json(orderConfig);
  } catch (error) {
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
    if (body.ordersEnabled !== undefined) {
      if (typeof body.ordersEnabled !== 'boolean') {
        return NextResponse.json(
          { error: 'ordersEnabled must be a boolean value' },
          { status: 400 }
        );
      }
      orderConfig.ordersEnabled = body.ordersEnabled;
    }
    
    if (body.disabledMessage !== undefined) {
      if (typeof body.disabledMessage !== 'string') {
        return NextResponse.json(
          { error: 'disabledMessage must be a string' },
          { status: 400 }
        );
      }
      orderConfig.disabledMessage = body.disabledMessage;
    }
    
    return NextResponse.json(orderConfig);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update order configuration' },
      { status: 500 }
    );
  }
}