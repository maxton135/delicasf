import { NextRequest, NextResponse } from 'next/server';
import { menuSyncService } from '../../../../db/menuSyncService';
import { menuItemService } from '../../../../db/operations';
import { withAdminAuth } from '@/lib/adminAuth';
import { getDatabase } from '../../../../db/connection';
import { displayCategories, menuItemDisplayCategories } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const GET = withAdminAuth(async () => {
  try {
    const db = getDatabase();
    
    // Get the organized menu data (like customer menu but with sold-out items)
    const cachedMenuData = await menuSyncService.getCachedMenuData();
    const allMenuItems = await menuItemService.getAllMenuItems();
    
    // Get all display category assignments
    const displayCategoryAssignments = await db
      .select({
        menuItemId: menuItemDisplayCategories.menuItemId,
        categoryName: displayCategories.name,
      })
      .from(menuItemDisplayCategories)
      .innerJoin(displayCategories, eq(menuItemDisplayCategories.displayCategoryId, displayCategories.id))
      .where(eq(displayCategories.isActive, true));
    
    // Create a map of menu item ID to display categories
    const itemCategoryMap: { [key: number]: string[] } = {};
    displayCategoryAssignments.forEach(assignment => {
      if (!itemCategoryMap[assignment.menuItemId]) {
        itemCategoryMap[assignment.menuItemId] = [];
      }
      itemCategoryMap[assignment.menuItemId].push(assignment.categoryName);
    });
    
    // Add sold-out status and display categories to menu items
    const menuWithSoldOutStatus: { [key: string]: any[] } = {};
    
    Object.entries(cachedMenuData).forEach(([category, items]) => {
      menuWithSoldOutStatus[category] = items.map(item => {
        // Find the database item to get sold-out status
        const dbItem = allMenuItems.find(dbItem => dbItem.squareId === item.id);
        const displayCategories = dbItem?.id ? (itemCategoryMap[dbItem.id] || []) : [];
        
        return {
          ...item,
          isSoldOut: dbItem?.isSoldOut || false,
          dbId: dbItem?.id || null, // Include database ID for admin operations
          displayCategories: displayCategories, // Add display categories
        };
      });
    });
    
    return NextResponse.json({
      menuItems: menuWithSoldOutStatus,
      totalItems: allMenuItems.length,
      soldOutCount: allMenuItems.filter(item => item.isSoldOut).length,
    });
  } catch (error) {
    console.error('Error fetching admin menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
});

export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { itemId, action, isSoldOut } = body;
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }
    
    let updatedItem;
    
    if (action === 'toggle') {
      updatedItem = await menuItemService.toggleSoldOutStatus(itemId);
    } else if (action === 'set' && typeof isSoldOut === 'boolean') {
      updatedItem = await menuItemService.setSoldOutStatus(itemId, isSoldOut);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "toggle" or "set" with isSoldOut boolean' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        name: updatedItem.name,
        isSoldOut: updatedItem.isSoldOut,
        updatedAt: updatedItem.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: `Failed to update menu item: ${error.message}` },
      { status: 500 }
    );
  }
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { action, itemIds, isSoldOut } = body;
    
    if (action === 'bulk-set') {
      if (!Array.isArray(itemIds) || typeof isSoldOut !== 'boolean') {
        return NextResponse.json(
          { error: 'Bulk action requires itemIds array and isSoldOut boolean' },
          { status: 400 }
        );
      }
      
      await menuItemService.bulkSetSoldOutStatus(itemIds, isSoldOut);
      
      return NextResponse.json({
        success: true,
        message: `${itemIds.length} items ${isSoldOut ? 'marked as sold out' : 'marked as available'}`,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
});