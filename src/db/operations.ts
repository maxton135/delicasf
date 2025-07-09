import { eq } from 'drizzle-orm';
import { getDatabase } from './connection';
import { orderConfig, menuItems, OrderConfig, InsertOrderConfig, MenuItem } from './schema';

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

export class MenuItemService {
  private db = getDatabase();

  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const items = await this.db.select().from(menuItems);
      return items;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new Error('Failed to fetch menu items');
    }
  }

  async getMenuItemById(id: number): Promise<MenuItem | null> {
    try {
      const result = await this.db.select().from(menuItems).where(eq(menuItems.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw new Error('Failed to fetch menu item');
    }
  }

  async toggleSoldOutStatus(id: number): Promise<MenuItem> {
    try {
      const currentItem = await this.getMenuItemById(id);
      
      if (!currentItem) {
        throw new Error('Menu item not found');
      }
      
      const newSoldOutStatus = !currentItem.isSoldOut;
      
      const result = await this.db
        .update(menuItems)
        .set({ 
          isSoldOut: newSoldOutStatus,
          updatedAt: new Date().toISOString()
        })
        .where(eq(menuItems.id, id))
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error toggling sold out status:', error);
      throw new Error('Failed to toggle sold out status');
    }
  }

  async setSoldOutStatus(id: number, isSoldOut: boolean): Promise<MenuItem> {
    try {
      const result = await this.db
        .update(menuItems)
        .set({ 
          isSoldOut,
          updatedAt: new Date().toISOString()
        })
        .where(eq(menuItems.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('Menu item not found');
      }
      
      return result[0];
    } catch (error) {
      console.error('Error setting sold out status:', error);
      throw new Error('Failed to set sold out status');
    }
  }

  async bulkSetSoldOutStatus(ids: number[], isSoldOut: boolean): Promise<void> {
    try {
      await this.db
        .update(menuItems)
        .set({ 
          isSoldOut,
          updatedAt: new Date().toISOString()
        })
        .where(eq(menuItems.id, ids[0])); // Will need to update this for multiple IDs
      
      // TODO: Implement proper bulk update for multiple IDs
    } catch (error) {
      console.error('Error bulk setting sold out status:', error);
      throw new Error('Failed to bulk set sold out status');
    }
  }
}

// Export singleton instance
export const menuItemService = new MenuItemService();