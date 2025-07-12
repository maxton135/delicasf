import { SquareClient, SquareEnvironment } from "square";
import { eq, inArray } from 'drizzle-orm';
import { getDatabase } from './connection';
import { 
  menuCategories, 
  menuItems, 
  menuItemCategories, 
  menuItemVariations, 
  menuSyncStatus,
  type InsertMenuCategory,
  type InsertMenuItem,
  type InsertMenuItemCategory,
  type InsertMenuItemVariation,
  type InsertMenuSyncStatus 
} from './schema';

// Category mapping is now dynamic - no hardcoded categories

export class MenuSyncService {
  private db = getDatabase();
  private squareClient: SquareClient | null = null;

  private getSquareClient(): SquareClient {
    if (!this.squareClient) {
      const accessToken = process.env.SQUARE_ACCESS_TOKEN;
      const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox';
      
      if (!accessToken) {
        throw new Error('SQUARE_ACCESS_TOKEN environment variable is required');
      }
      
      this.squareClient = new SquareClient({
        environment: environment === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
        token: accessToken,
      });
    }
    
    return this.squareClient;
  }

  // Helper function to convert Square response to plain object
  private convertToPlainObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle BigInt
    if (typeof obj === 'bigint') {
      return obj.toString();
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertToPlainObject(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
      const plainObj: any = {};
      for (const key in obj) {
        plainObj[key] = this.convertToPlainObject(obj[key]);
      }
      return plainObj;
    }

    // Return primitives as is
    return obj;
  }

  // Update sync status in database
  private async updateSyncStatus(status: Partial<InsertMenuSyncStatus>) {
    try {
      const existingStatus = await this.db.select().from(menuSyncStatus).limit(1);
      
      if (existingStatus.length === 0) {
        // Insert new status record
        await this.db.insert(menuSyncStatus).values({
          ...status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Update existing status record
        await this.db
          .update(menuSyncStatus)
          .set({
            ...status,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(menuSyncStatus.id, existingStatus[0].id));
      }
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }

  // Fetch catalog data from Square API
  private async fetchSquareCatalog() {
    try {
      const client = this.getSquareClient();
      
      // Fetch all catalog items without category filtering
      const response = await client.catalog.searchItems({
        limit: 100,
        sortOrder: 'ASC'
      });

      return this.convertToPlainObject(response);
    } catch (error) {
      console.error('Error fetching Square catalog:', error);
      throw error;
    }
  }

  // Sync categories to database dynamically from Square items
  private async syncCategories(squareResponse: any) {
    const categoryMap = new Map<string, string>();
    
    // Extract categories from items
    if (squareResponse.items && Array.isArray(squareResponse.items)) {
      squareResponse.items.forEach((item: any) => {
        if (item.itemData && item.itemData.categories) {
          item.itemData.categories.forEach((category: { id: string }) => {
            // For now, use the category ID as the name
            // In a future update, we can fetch actual category names from Square
            categoryMap.set(category.id, `Category ${category.id}`);
          });
        }
      });
    }
    
    const categoriesToInsert: InsertMenuCategory[] = Array.from(categoryMap.entries()).map(
      ([squareId, name], index) => ({
        squareId,
        name,
        displayOrder: index,
        isActive: true,
      })
    );

    // Clear existing categories
    await this.db.delete(menuCategories);
    
    // Insert new categories if any exist
    if (categoriesToInsert.length > 0) {
      await this.db.insert(menuCategories).values(categoriesToInsert);
    }
    
    return categoriesToInsert.length;
  }

  // Sync menu items and their relationships
  private async syncMenuItems(squareResponse: any) {
    if (!squareResponse.items || !Array.isArray(squareResponse.items)) {
      console.log('No items found in Square response');
      return { itemsCount: 0, variationsCount: 0 };
    }

    // Get existing menu items to preserve sold-out status
    const existingItems = await this.db.select().from(menuItems);
    const existingItemsMap = new Map(existingItems.map(item => [item.squareId, item]));
    
    // Clear existing data
    await this.db.delete(menuItemCategories);
    await this.db.delete(menuItemVariations); 
    await this.db.delete(menuItems);

    const itemsToInsert: InsertMenuItem[] = [];
    const itemCategoriesToInsert: InsertMenuItemCategory[] = [];
    const variationsToInsert: InsertMenuItemVariation[] = [];

    // Get category mappings from database
    const dbCategories = await this.db.select().from(menuCategories);
    const categoryMap = new Map(dbCategories.map(cat => [cat.squareId, cat.id]));

    for (let itemIndex = 0; itemIndex < squareResponse.items.length; itemIndex++) {
      const item = squareResponse.items[itemIndex];
      
      if (!item.itemData) continue;

      // Insert menu item, preserving sold-out status from existing item
      const existingItem = existingItemsMap.get(item.id);
      const menuItem: InsertMenuItem = {
        squareId: item.id,
        name: item.itemData.name || 'Unnamed Item',
        description: item.itemData.description || '',
        displayOrder: itemIndex,
        isActive: true,
        isSoldOut: existingItem?.isSoldOut || false, // Preserve existing sold-out status
        rawSquareData: JSON.stringify(item),
      };

      itemsToInsert.push(menuItem);

      // Handle categories
      if (item.itemData.categories && Array.isArray(item.itemData.categories)) {
        for (const category of item.itemData.categories) {
          const categoryId = categoryMap.get(category.id);
          if (categoryId) {
            itemCategoriesToInsert.push({
              menuItemId: itemIndex + 1, // Will be actual ID after insert
              categoryId,
            });
          }
        }
      }

      // Handle variations (combo types, etc.)
      if (item.itemData.variations && Array.isArray(item.itemData.variations)) {
        for (const variation of item.itemData.variations) {
          if (variation.customAttributeValues) {
            const customAttrs = Object.values(variation.customAttributeValues);
            for (const attr of customAttrs) {
              if (attr && typeof attr === 'object' && 'name' in attr && 'stringValue' in attr) {
                variationsToInsert.push({
                  menuItemId: itemIndex + 1, // Will be actual ID after insert
                  squareVariationId: variation.id,
                  name: (attr.name as string) || 'Unknown',
                  type: (attr.name as string)?.includes('combo_type') ? 'combo_type' : 'other',
                  value: (attr.stringValue as string) || '',
                  isActive: true,
                });
              }
            }
          }
        }
      }
    }

    // Insert all data
    if (itemsToInsert.length > 0) {
      await this.db.insert(menuItems).values(itemsToInsert);
    }

    if (itemCategoriesToInsert.length > 0) {
      // Update with actual menu item IDs
      const insertedItems = await this.db.select().from(menuItems);
      const itemIdMap = new Map(insertedItems.map((item, index) => [index + 1, item.id]));
      
      const updatedItemCategories = itemCategoriesToInsert.map(ic => ({
        ...ic,
        menuItemId: itemIdMap.get(ic.menuItemId) || ic.menuItemId,
      }));
      
      await this.db.insert(menuItemCategories).values(updatedItemCategories);
    }

    if (variationsToInsert.length > 0) {
      // Update with actual menu item IDs
      const insertedItems = await this.db.select().from(menuItems);
      const itemIdMap = new Map(insertedItems.map((item, index) => [index + 1, item.id]));
      
      const updatedVariations = variationsToInsert.map(v => ({
        ...v,
        menuItemId: itemIdMap.get(v.menuItemId) || v.menuItemId,
      }));
      
      await this.db.insert(menuItemVariations).values(updatedVariations);
    }

    return {
      itemsCount: itemsToInsert.length,
      variationsCount: variationsToInsert.length,
    };
  }

  // Main sync method
  async syncMenuData(): Promise<{ success: boolean; error?: string; itemsCount?: number; categoriesCount?: number }> {
    const syncStartTime = new Date().toISOString();
    
    try {
      // Update sync status to in_progress
      await this.updateSyncStatus({
        lastSyncAttempt: syncStartTime,
        syncStatus: 'in_progress',
        errorMessage: null,
      });

      console.log('Starting menu sync...');
      
      // Fetch data from Square
      const squareResponse = await this.fetchSquareCatalog();
      
      // Sync categories
      const categoriesCount = await this.syncCategories(squareResponse);
      
      // Sync menu items
      const { itemsCount, variationsCount } = await this.syncMenuItems(squareResponse);
      
      // Update sync status to success
      await this.updateSyncStatus({
        lastSuccessfulSync: new Date().toISOString(),
        syncStatus: 'success',
        errorMessage: null,
        itemsCount,
        categoriesCount,
      });

      console.log(`Menu sync completed successfully: ${itemsCount} items, ${categoriesCount} categories, ${variationsCount} variations`);
      
      return {
        success: true,
        itemsCount,
        categoriesCount,
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      console.error('Menu sync failed:', errorMessage);
      
      // Update sync status to error
      await this.updateSyncStatus({
        syncStatus: 'error',
        errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const status = await this.db.select().from(menuSyncStatus).limit(1);
      return status[0] || null;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  // Get cached menu data from database
  async getCachedMenuData() {
    try {
      const categories = await this.db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.isActive, true))
        .orderBy(menuCategories.displayOrder);

      const items = await this.db
        .select()
        .from(menuItems)
        .where(eq(menuItems.isActive, true))
        .orderBy(menuItems.displayOrder);

      const itemCategories = await this.db.select().from(menuItemCategories);
      const variations = await this.db.select().from(menuItemVariations);

      // Organize items by category
      const menuByCategory: { [key: string]: any[] } = {};
      
      categories.forEach(category => {
        menuByCategory[category.name] = [];
      });

      items.forEach(item => {
        const itemCategoryIds = itemCategories
          .filter(ic => ic.menuItemId === item.id)
          .map(ic => ic.categoryId);
        
        const itemCategs = categories.filter(cat => itemCategoryIds.includes(cat.id));
        const itemVariations = variations.filter(v => v.menuItemId === item.id);
        
        // Parse raw Square data and add variations
        let itemData;
        try {
          itemData = JSON.parse(item.rawSquareData || '{}');
        } catch {
          itemData = {
            id: item.squareId,
            itemData: {
              name: item.name,
              description: item.description,
            }
          };
        }

        // Add processed variations to item data
        if (itemVariations.length > 0) {
          itemData.itemData.variations = [{
            customAttributeValues: itemVariations.reduce((acc, variation) => {
              acc[variation.name] = {
                name: variation.name,
                stringValue: variation.value,
              };
              return acc;
            }, {} as any)
          }];
        }

        // Add item to appropriate categories
        itemCategs.forEach(category => {
          if (menuByCategory[category.name]) {
            menuByCategory[category.name].push(itemData);
          }
        });
      });

      return menuByCategory;
    } catch (error) {
      console.error('Error getting cached menu data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const menuSyncService = new MenuSyncService();