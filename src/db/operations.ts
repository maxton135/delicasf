import { eq } from 'drizzle-orm';
import { getDatabase } from './connection';
import { orderConfig, OrderConfig, InsertOrderConfig } from './schema';

export class OrderConfigService {
  private db = getDatabase();

  async getOrderConfig(): Promise<OrderConfig | null> {
    try {
      const result = await this.db.select().from(orderConfig).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching order config:', error);
      throw new Error('Failed to fetch order configuration');
    }
  }

  async updateOrderConfig(updates: Partial<InsertOrderConfig>): Promise<OrderConfig> {
    try {
      const existingConfig = await this.getOrderConfig();
      
      if (!existingConfig) {
        // Insert new configuration if none exists
        const newConfig = {
          ordersEnabled: updates.ordersEnabled ?? true,
          disabledMessage: updates.disabledMessage ?? 'Online ordering is currently unavailable. Please call us to place your order.',
          updatedAt: new Date().toISOString(),
        };
        
        const result = await this.db.insert(orderConfig).values(newConfig).returning();
        return result[0];
      } else {
        // Update existing configuration
        const updateData = {
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        const result = await this.db
          .update(orderConfig)
          .set(updateData)
          .where(eq(orderConfig.id, existingConfig.id))
          .returning();
        
        return result[0];
      }
    } catch (error) {
      console.error('Error updating order config:', error);
      throw new Error('Failed to update order configuration');
    }
  }

  async toggleOrders(): Promise<OrderConfig> {
    try {
      const currentConfig = await this.getOrderConfig();
      
      if (!currentConfig) {
        throw new Error('No order configuration found');
      }
      
      return await this.updateOrderConfig({
        ordersEnabled: !currentConfig.ordersEnabled,
      });
    } catch (error) {
      console.error('Error toggling orders:', error);
      throw new Error('Failed to toggle order status');
    }
  }

  async enableOrders(): Promise<OrderConfig> {
    return await this.updateOrderConfig({ ordersEnabled: true });
  }

  async disableOrders(): Promise<OrderConfig> {
    return await this.updateOrderConfig({ ordersEnabled: false });
  }

  async updateDisabledMessage(message: string): Promise<OrderConfig> {
    return await this.updateOrderConfig({ disabledMessage: message });
  }
}

// Export singleton instance
export const orderConfigService = new OrderConfigService();