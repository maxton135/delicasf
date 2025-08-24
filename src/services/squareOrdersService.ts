import { SquareClient, SquareEnvironment } from "square";

interface CartItem {
  itemData: {
    name: string;
    description?: string;
    variations?: any[];
    [key: string]: any;
  };
  quantity: number;
  isCombo?: boolean;
  comboSelections?: {
    [categoryName: string]: {
      id: string;
      dbId: number;
      name: string;
      description?: string;
      itemData?: any;
    };
  };
}

interface CustomerInfo {
  name: string;
  phone: string;
  pickupTime?: string;
  notes?: string;
}

interface OrderRequest {
  items: CartItem[];
  customer: CustomerInfo;
  paymentId?: string;
}

interface PaymentRequest {
  token: string;
  amount: bigint | number;
  currency: string;
  note?: string;
}

export class SquareOrdersService {
  private squareClient: SquareClient | null = null;

  private getSquareClient(): SquareClient {
    if (!this.squareClient) {
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
      const locationId = process.env.SQUARE_LOCATION_ID;
      
      console.log('Square environment check:', {
        hasAccessToken: !!accessToken,
        environment,
        hasLocationId: !!locationId,
      });
      
      if (!accessToken) {
        throw new Error('SQUARE_ACCESS_TOKEN environment variable is required');
      }
      
      if (!locationId) {
        throw new Error('SQUARE_LOCATION_ID environment variable is required');
      }
      
      this.squareClient = new SquareClient({
        environment: environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
        token: accessToken,
      });
    }
    
    return this.squareClient;
  }

  // Helper function to get item price from Square data
  private getItemPrice(itemData: any): bigint {
    const variation = itemData.variations?.[0];
    const amount = variation?.itemVariationData?.priceMoney?.amount;
    
    console.log('Getting price for item:', {
      name: itemData.name,
      amount: amount,
      type: typeof amount
    });
    
    if (amount !== undefined && amount !== null) {
      // Convert to BigInt - handle both string and number inputs
      if (typeof amount === 'bigint') {
        return amount;
      } else if (typeof amount === 'string') {
        return BigInt(amount);
      } else if (typeof amount === 'number') {
        return BigInt(Math.round(amount));
      } else {
        console.warn('Unexpected amount type:', typeof amount, amount);
        return BigInt(1000); // Default fallback
      }
    }
    
    // Default price if not found (e.g., $10.00 = 1000 cents)
    console.warn('No price found for item, using default $10.00');
    return BigInt(1000);
  }

  // Helper function to get Square catalog object ID from item data
  private getCatalogObjectId(itemData: any): string | null {
    // Use the variation ID as the catalog object ID
    const variation = itemData.variations?.[0];
    if (variation?.id) {
      return variation.id;
    }
    
    console.warn('No variation ID found for item:', itemData.name);
    return null;
  }

  // Convert cart items to Square line items
  private convertCartToLineItems(cartItems: CartItem[]): any[] {
    const lineItems: any[] = [];

    console.log('=== SQUARE SERVICE DEBUG ===');
    console.log('Converting cart items to line items:', JSON.stringify(cartItems, null, 2));

    cartItems.forEach((cartItem) => {
      if (cartItem.isCombo && cartItem.comboSelections) {
        // For combo items, create separate line items for each selection
        Object.entries(cartItem.comboSelections).forEach(([categoryName, selection]) => {
          const catalogObjectId = this.getCatalogObjectId(selection.itemData);
          
          if (catalogObjectId) {
            const price = this.getItemPrice(selection.itemData);
            
            lineItems.push({
              name: `${cartItem.itemData.itemData.name} - ${selection.name}`,
              quantity: cartItem.quantity.toString(),
              catalogObjectId: catalogObjectId,
              basePriceMoney: {
                amount: price,
                currency: 'USD'
              },
              note: `Part of combo: ${cartItem.itemData.itemData.name}`,
            });
          } else {
            // If no catalog object ID, create a custom line item
            const price = this.getItemPrice(selection.itemData);
            
            lineItems.push({
              name: `${cartItem.itemData.itemData.name} - ${selection.name}`,
              quantity: cartItem.quantity.toString(),
              basePriceMoney: {
                amount: price,
                currency: 'USD'
              },
              note: `Part of combo: ${cartItem.itemData.itemData.name} (${categoryName})`,
            });
          }
        });
      } else {
        // For regular items, create a single line item
        const catalogObjectId = this.getCatalogObjectId(cartItem.itemData);
        
        if (catalogObjectId) {
          const price = this.getItemPrice(cartItem.itemData.itemData);
          
          lineItems.push({
            name: cartItem.itemData.itemData.name,
            quantity: cartItem.quantity.toString(),
            catalogObjectId: catalogObjectId,
            basePriceMoney: {
              amount: price,
              currency: 'USD'
            },
            note: cartItem.itemData.itemData.description || '',
          });
        } else {
          // If no catalog object ID, create a custom line item
          const price = this.getItemPrice(cartItem.itemData.itemData);
          
          lineItems.push({
            name: cartItem.itemData.itemData.name,
            quantity: cartItem.quantity.toString(),
            basePriceMoney: {
              amount: price,
              currency: 'USD'
            },
            note: cartItem.itemData.itemData.description || '',
          });
        }
      }
    });

    return lineItems;
  }

  // Process payment with Square Payments API
  async processPayment(paymentRequest: PaymentRequest): Promise<any> {
    try {
      const client = this.getSquareClient();
      const { token, amount, currency, note } = paymentRequest;

      // Convert amount to BigInt if it's not already
      const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount);

      console.log('Processing payment with Square:', {
        token: token.substring(0, 10) + '...',
        amount: amountBigInt.toString(),
        currency,
        note
      });

      const paymentData = {
        sourceId: token,
        amountMoney: {
          amount: amountBigInt,
          currency: 'USD' as any
        },
        locationId: process.env.SQUARE_LOCATION_ID,
        note: note || 'Online order payment',
        idempotencyKey: `payment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };

      const response = await client.payments.create(paymentData);

      if (response.errors && response.errors.length > 0) {
        throw new Error(`Square Payment API errors: ${JSON.stringify(response.errors)}`);
      }

      const payment = response.payment;
      console.log('Payment processed successfully:', payment?.id);

      return {
        success: true,
        paymentId: payment?.id,
        payment: this.sanitizeForJson(payment)
      };

    } catch (error) {
      console.error('Error processing Square payment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process payment',
      };
    }
  }

  // Helper function to sanitize BigInt values for JSON serialization
  private sanitizeForJson(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return Number(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForJson(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeForJson(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }

  // Create a Square Order
  async createOrder(orderRequest: OrderRequest): Promise<any> {
    try {
      const client = this.getSquareClient();
      const { items, customer } = orderRequest;

      // Convert cart items to Square line items
      const lineItems = this.convertCartToLineItems(items);

      // Calculate total for validation (optional)
      // const totalAmount = lineItems.reduce((sum, item) => {
      //   return sum + (item.basePriceMoney.amount * parseInt(item.quantity));
      // }, 0);

      // Create the order request
      const orderData = {
        order: {
          locationId: process.env.SQUARE_LOCATION_ID,
          lineItems: lineItems,
          fulfillments: [
            {
              type: 'PICKUP' as any,
              state: 'PROPOSED' as any,
              pickupDetails: {
                recipient: {
                  displayName: customer.name,
                  phoneNumber: customer.phone,
                },
                pickupAt: customer.pickupTime || undefined,
                note: customer.notes || undefined,
              },
            },
          ],
          metadata: {
            customerName: customer.name,
            customerPhone: customer.phone,
            orderSource: 'website',
            timestamp: new Date().toISOString(),
          },
        },
        idempotencyKey: `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      };

      // Custom JSON stringifier that handles BigInt
      console.log('Creating Square order with data:', JSON.stringify(orderData, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2
      ));

      // Create the order
      const response = await client.orders.create(orderData);

      if (response.errors && response.errors.length > 0) {
        throw new Error(`Square API errors: ${JSON.stringify(response.errors)}`);
      }

      const order = response.order;
      
      console.log('Square order created successfully:', order?.id);

      return {
        success: true,
        order: {
          id: order?.id,
          state: order?.state,
          totalMoney: order?.totalMoney,
          lineItems: order?.lineItems,
          fulfillments: order?.fulfillments,
          createdAt: order?.createdAt,
          updatedAt: order?.updatedAt,
        },
        squareOrderId: order?.id,
      };

    } catch (error) {
      console.error('Error creating Square order:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<any> {
    try {
      const client = this.getSquareClient();
      
      console.log('Calling Square API to get order:', orderId);
      const response = await client.orders.get({ orderId });
      
      console.log('Square API response:', {
        hasOrder: !!response.order,
        hasErrors: !!(response.errors && response.errors.length > 0),
        errors: response.errors
      });
      
      if (response.errors && response.errors.length > 0) {
        throw new Error(`Square API errors: ${JSON.stringify(response.errors)}`);
      }

      if (!response.order) {
        throw new Error('Order not found in Square API response');
      }

      return {
        success: true,
        order: this.sanitizeForJson(response.order),
      };

    } catch (error) {
      console.error('Error retrieving Square order:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve order',
      };
    }
  }

  // Update order fulfillment state
  async updateOrderFulfillment(orderId: string, fulfillmentUid: string, state: string): Promise<any> {
    try {
      const client = this.getSquareClient();
      
      const response = await client.orders.update({
        orderId,
        order: {
          locationId: process.env.SQUARE_LOCATION_ID,
          version: 1, // This should be the current order version
          fulfillments: [
            {
              uid: fulfillmentUid,
              state: state as any,
            },
          ],
        },
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(`Square API errors: ${JSON.stringify(response.errors)}`);
      }

      return {
        success: true,
        order: response.order,
      };

    } catch (error) {
      console.error('Error updating Square order fulfillment:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order fulfillment',
      };
    }
  }
}

// Export singleton instance
export const squareOrdersService = new SquareOrdersService();