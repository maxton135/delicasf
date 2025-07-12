import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/db/connection';
import { displayCategories, menuItemDisplayCategories, menuItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { menuSyncService } from '../../../db/menuSyncService';

const db = getDatabase();

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

      // Parse raw Square data and format items
      const formattedItems = categoryItems.map(item => {
        let squareData = {};
        if (item.rawSquareData) {
          try {
            squareData = JSON.parse(item.rawSquareData);
          } catch (e) {
            console.warn(`Failed to parse raw Square data for item ${item.id}:`, e);
          }
        }

        return {
          id: item.squareId,
          name: item.name,
          description: item.description,
          isSoldOut: item.isSoldOut,
          ...squareData,
        };
      });

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
    
    // Add caching headers
    // Cache for 30 seconds with stale-while-revalidate for more responsive updates
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
    // Add ETag for conditional requests
    // Include both sync status and current timestamp for categories to ensure fresh data
    const currentTime = new Date().toISOString();
    const etagData = syncStatus?.lastSuccessfulSync 
      ? `${syncStatus.lastSuccessfulSync}-${categories.length}-${currentTime.substring(0, 16)}` // Minute-level precision
      : `no-sync-${categories.length}-${currentTime.substring(0, 16)}`;
    const etag = `"${Buffer.from(etagData).toString('base64')}"`;
    response.headers.set('ETag', etag);
    
    return response;
  } catch (error) {
    console.error('Error fetching display category menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}