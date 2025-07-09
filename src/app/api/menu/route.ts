import { NextRequest, NextResponse } from 'next/server';
import { menuSyncService } from '../../../db/menuSyncService';
import { menuItemService } from '../../../db/operations';

export async function GET() {
  try {
    const cachedMenuData = await menuSyncService.getCachedMenuData();
    const syncStatus = await menuSyncService.getSyncStatus();
    const allMenuItems = await menuItemService.getAllMenuItems();
    
    // Filter out sold-out items for customer menu
    const filteredMenuData: { [key: string]: any[] } = {};
    
    Object.entries(cachedMenuData).forEach(([category, items]) => {
      filteredMenuData[category] = items.filter(item => {
        // Find the database item to check sold-out status
        const dbItem = allMenuItems.find(dbItem => dbItem.squareId === item.id);
        
        // Only include items that are not sold out
        return !dbItem?.isSoldOut;
      });
    });
    
    // Remove empty categories
    Object.keys(filteredMenuData).forEach(category => {
      if (filteredMenuData[category].length === 0) {
        delete filteredMenuData[category];
      }
    });
    
    const response = NextResponse.json({
      menuItems: filteredMenuData,
      syncStatus: syncStatus ? {
        lastSuccessfulSync: syncStatus.lastSuccessfulSync,
        lastSyncAttempt: syncStatus.lastSyncAttempt,
        syncStatus: syncStatus.syncStatus,
        itemsCount: syncStatus.itemsCount,
        categoriesCount: syncStatus.categoriesCount,
      } : null,
    });
    
    // Add caching headers
    // Cache for 5 minutes (300 seconds) with stale-while-revalidate
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    
    // Add ETag for conditional requests
    if (syncStatus?.lastSuccessfulSync) {
      const etag = `"${Buffer.from(syncStatus.lastSuccessfulSync).toString('base64')}"`;
      response.headers.set('ETag', etag);
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching cached menu data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu data' },
      { status: 500 }
    );
  }
}