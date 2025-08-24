import { NextRequest, NextResponse } from 'next/server';
import { squareOrdersService } from '@/services/squareOrdersService';
import { getDatabase } from '@/db/connection';
import { menuItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = getDatabase();

// Helper function to convert BigInt values to numbers for JSON serialization
function sanitizeForJson(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForJson(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeForJson(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}

// Validate cart items against current menu
async function validateCartItems(cartItems: any[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  console.log('=== CART VALIDATION DEBUG ===');
  console.log('Cart items received:', JSON.stringify(cartItems, null, 2));
  
  // Get all active menu items from database
  const activeMenuItems = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.isActive, true));
  
  console.log('Active menu items from DB:', activeMenuItems.map(item => ({
    id: item.id,
    squareId: item.squareId,
    name: item.name,
    rawData: item.rawSquareData ? JSON.parse(item.rawSquareData) : null
  })));
  
  const activeItemIds = new Set(activeMenuItems.map(item => item.squareId));
  const soldOutItemIds = new Set(
    activeMenuItems.filter(item => item.isSoldOut).map(item => item.squareId)
  );
  
  console.log('Active item IDs:', Array.from(activeItemIds));
  console.log('Sold out item IDs:', Array.from(soldOutItemIds));

  for (const cartItem of cartItems) {
    const itemId = cartItem.itemData?.id;
    
    console.log(`Processing cart item:`, {
      name: cartItem.itemData?.name,
      id: itemId,
      isCombo: cartItem.isCombo,
      comboSelections: cartItem.comboSelections
    });
    
    if (!itemId) {
      errors.push(`Invalid item: ${cartItem.itemData?.name || 'Unknown item'}`);
      console.log(`ERROR: No item ID found for ${cartItem.itemData?.name}`);
      continue;
    }

    // Check if item exists and is active
    if (!activeItemIds.has(itemId)) {
      errors.push(`Item not available: ${cartItem.itemData.name}`);
      console.log(`ERROR: Item ID ${itemId} not found in active items for ${cartItem.itemData.name}`);
      continue;
    }

    // Check if item is sold out
    if (soldOutItemIds.has(itemId)) {
      errors.push(`Item sold out: ${cartItem.itemData.name}`);
      continue;
    }

    // Validate combo selections if it's a combo item
    if (cartItem.isCombo && cartItem.comboSelections) {
      for (const [categoryName, selection] of Object.entries(cartItem.comboSelections)) {
        const selectionId = (selection as any).itemData?.id;
        
        if (!selectionId) {
          errors.push(`Invalid combo selection in ${categoryName}: ${(selection as any).name}`);
          continue;
        }

        if (!activeItemIds.has(selectionId)) {
          errors.push(`Combo selection not available in ${categoryName}: ${(selection as any).name}`);
          continue;
        }

        if (soldOutItemIds.has(selectionId)) {
          errors.push(`Combo selection sold out in ${categoryName}: ${(selection as any).name}`);
          continue;
        }
      }
    }

    // Validate quantity
    if (!cartItem.quantity || cartItem.quantity < 1 || cartItem.quantity > 10) {
      errors.push(`Invalid quantity for ${cartItem.itemData.name}: ${cartItem.quantity}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate customer information
function validateCustomerInfo(customer: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!customer.name || typeof customer.name !== 'string' || customer.name.trim().length < 2) {
    errors.push('Customer name is required and must be at least 2 characters');
  }

  if (!customer.phone || typeof customer.phone !== 'string') {
    errors.push('Customer phone number is required');
  } else {
    // Basic phone validation (US format)
    const phoneRegex = /^[\+]?[1]?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!phoneRegex.test(customer.phone.replace(/\s/g, ''))) {
      errors.push('Please provide a valid phone number');
    }
  }

  // Validate pickup time if provided
  if (customer.pickupTime) {
    const pickupDate = new Date(customer.pickupTime);
    const now = new Date();
    
    if (isNaN(pickupDate.getTime())) {
      errors.push('Invalid pickup time format');
    } else if (pickupDate < now) {
      errors.push('Pickup time must be in the future');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  console.log('=== ORDERS API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body received:', {
      hasItems: !!body.items,
      itemsLength: body.items?.length,
      hasCustomer: !!body.customer,
      hasPayment: !!body.payment,
      paymentHasToken: !!body.payment?.token
    });
    
    const { items, customer, payment } = body;

    // Validate request structure
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!payment || !payment.token) {
      return NextResponse.json(
        { error: 'Payment information is required' },
        { status: 400 }
      );
    }

    // Validate customer information
    const customerValidation = validateCustomerInfo(customer);
    if (!customerValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid customer information', 
          details: customerValidation.errors 
        },
        { status: 400 }
      );
    }

    // Validate cart items
    const cartValidation = await validateCartItems(items);
    if (!cartValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid cart items', 
          details: cartValidation.errors 
        },
        { status: 400 }
      );
    }

    // Calculate total price for payment
    const totalPrice = items.reduce((sum: number, item: any) => {
      if (item.isCombo && item.comboSelections) {
        // For combo items, sum up all selections
        return sum + Object.values(item.comboSelections).reduce((comboSum: number, selection: any) => {
          const price = Number(selection.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount) || 0;
          return comboSum + price;
        }, 0) * item.quantity;
      } else {
        // For regular items
        const price = Number(item.itemData?.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount) || 0;
        return sum + (price * item.quantity);
      }
    }, 0);

    console.log('Processing payment with total price:', totalPrice);
    
    // Process payment first with Square Payments API
    const paymentResult = await squareOrdersService.processPayment({
      token: payment.token,
      amount: totalPrice,
      currency: 'USD',
      note: `Order for ${customer.name.trim()}`
    });

    console.log('Payment result:', {
      success: paymentResult.success,
      hasPaymentId: !!paymentResult.paymentId,
      error: paymentResult.error
    });

    if (!paymentResult.success) {
      console.error('Payment failed:', paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error || 'Payment failed' },
        { status: 400 }
      );
    }

    // Create order with Square after successful payment
    console.log('Creating order with payment ID:', paymentResult.paymentId);
    
    const orderResult = await squareOrdersService.createOrder({
      items,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        pickupTime: customer.pickupTime,
        notes: customer.notes?.trim(),
      },
      paymentId: paymentResult.paymentId,
    });

    console.log('Order result:', {
      success: orderResult.success,
      orderId: orderResult.squareOrderId,
      error: orderResult.error
    });

    if (!orderResult.success) {
      console.error('Failed to create Square order:', orderResult.error);
      return NextResponse.json(
        { error: 'Failed to create order. Please contact support if payment was charged.' },
        { status: 500 }
      );
    }

    // Calculate totals for response
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Return success response
    const responseData = {
      success: true,
      order: {
        id: orderResult.squareOrderId,
        totalItems,
        estimatedTotal: totalPrice,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          pickupTime: customer.pickupTime,
        },
        items: items.map((item: any) => ({
          name: item.itemData.itemData.name,
          quantity: item.quantity,
          isCombo: item.isCombo,
          comboSelections: item.comboSelections ? 
            Object.entries(item.comboSelections).map(([category, selection]: [string, any]) => ({
              category,
              item: selection.name,
            })) : undefined,
        })),
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      },
      squareOrder: sanitizeForJson(orderResult.order),
    };
    
    console.log('Returning success response with order ID:', orderResult.squareOrderId);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error processing order:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// Get order by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching order with ID:', orderId);
    const orderResult = await squareOrdersService.getOrder(orderId);
    console.log('Square getOrder result:', {
      success: orderResult.success,
      error: orderResult.error,
      hasOrder: !!orderResult.order
    });

    if (!orderResult.success) {
      console.error('Failed to fetch order from Square:', orderResult.error);
      return NextResponse.json(
        { error: orderResult.error || 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: orderResult.order,
    });

  } catch (error) {
    console.error('Error retrieving order:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}