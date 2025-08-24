import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/db/connection';
import { 
  displayCategories, 
  menuItemDisplayCategories, 
  menuItems, 
  comboMenuItems, 
  comboCategories,
  menuItemComboCategories
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { menuSyncService } from '../../../db/menuSyncService';

const db = getDatabase();

// Helper function to get combo information for a menu item
async function getComboInfo(menuItemId: number) {
  try {
    // Check if this menu item is a combo (has required combo categories)
    const comboRequirements = await db
      .select({
        categoryId: comboCategories.id,
        categoryName: comboCategories.name,
        categoryDescription: comboCategories.description,
        isRequired: comboMenuItems.isRequired,
        displayOrder: comboMenuItems.displayOrder,
      })
      .from(comboMenuItems)
      .innerJoin(comboCategories, eq(comboMenuItems.comboCategoryId, comboCategories.id))
      .where(
        and(
          eq(comboMenuItems.menuItemId, menuItemId),
          eq(comboCategories.isActive, true)
        )
      )
      .orderBy(comboMenuItems.displayOrder, comboCategories.name);

    if (comboRequirements.length === 0) {
      return null; // Not a combo item
    }

    // For each combo category, get the available items
    const comboOptions: any = {};
    for (const requirement of comboRequirements) {
      const availableItems = await db
        .select({
          id: menuItems.id,
          squareId: menuItems.squareId,
          name: menuItems.name,
          description: menuItems.description,
          rawSquareData: menuItems.rawSquareData,
        })
        .from(menuItemComboCategories)
        .innerJoin(menuItems, eq(menuItemComboCategories.menuItemId, menuItems.id))
        .where(
          and(
            eq(menuItemComboCategories.comboCategoryId, requirement.categoryId),
            eq(menuItems.isActive, true),
            eq(menuItems.isSoldOut, false)
          )
        )
        .orderBy(menuItems.name);

      // Format the available items
      const formattedItems = availableItems.map(item => {
        let squareData = {};
        if (item.rawSquareData) {
          try {
            squareData = JSON.parse(item.rawSquareData);
          } catch (e) {
            console.warn(`Failed to parse raw Square data for combo item ${item.id}:`, e);
          }
        }

        return {
          id: item.squareId,
          dbId: item.id,
          name: item.name,
          description: item.description,
          ...squareData,
        };
      });

      comboOptions[requirement.categoryName] = {
        id: requirement.categoryId,
        name: requirement.categoryName,
        description: requirement.categoryDescription,
        isRequired: requirement.isRequired,
        displayOrder: requirement.displayOrder,
        items: formattedItems,
      };
    }

    return {
      isCombo: true,
      comboCategories: comboOptions,
    };
  } catch (error) {
    console.error('Error fetching combo info:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Get all active display categories
    const categories = await db
      .select()
      .from(displayCategories)
      .where(eq(displayCategories.isActive, true))
      .orderBy(displayCategories.displayOrder, displayCategories.name);

    // Get menu items organized by display categories
    const menuData: { [key: string]: any[] } = {};
    
    for (const category of categories) {
      // Get menu items assigned to this display category
      const categoryItems = await db
        .select({
          id: menuItems.id,
          squareId: menuItems.squareId,
          name: menuItems.name,
          description: menuItems.description,
          isActive: menuItems.isActive,
          isSoldOut: menuItems.isSoldOut,
          displayOrder: menuItems.displayOrder,
          rawSquareData: menuItems.rawSquareData,
        })
        .from(menuItems)
        .innerJoin(menuItemDisplayCategories, eq(menuItems.id, menuItemDisplayCategories.menuItemId))
        .where(
          and(
            eq(menuItemDisplayCategories.displayCategoryId, category.id),
            eq(menuItems.isActive, true)
          )
        )
        .orderBy(menuItems.displayOrder, menuItems.name);

      // Parse raw Square data and format items with combo information
      const formattedItems = await Promise.all(
        categoryItems.map(async (item) => {
          let squareData = {};
          if (item.rawSquareData) {
            try {
              squareData = JSON.parse(item.rawSquareData);
            } catch (e) {
              console.warn(`Failed to parse raw Square data for item ${item.id}:`, e);
            }
          }

          // Get combo information for this item
          const comboInfo = await getComboInfo(item.id);

          return {
            id: item.squareId,
            dbId: item.id,
            name: item.name,
            description: item.description,
            isSoldOut: item.isSoldOut,
            ...squareData,
            ...(comboInfo || {}),
          };
        })
      );

      // Only include categories that have items
      if (formattedItems.length > 0) {
        menuData[category.name] = formattedItems;
      }
    }

    // Get sync status for compatibility
    const syncStatus = await menuSyncService.getSyncStatus();
    
    const response = NextResponse.json({
      menuItems: menuData,
      syncStatus: syncStatus ? {
        lastSuccessfulSync: syncStatus.lastSuccessfulSync,
        lastSyncAttempt: syncStatus.lastSyncAttempt,
        syncStatus: syncStatus.syncStatus,
        itemsCount: syncStatus.itemsCount,
        categoriesCount: syncStatus.categoriesCount,
      } : null,
    });
    
    // Disable all caching to ensure immediate menu updates
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching display category menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}