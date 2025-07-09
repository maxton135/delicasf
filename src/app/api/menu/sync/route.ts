import { NextRequest, NextResponse } from 'next/server';
import { menuSyncService } from '../../../../db/menuSyncService';

export async function POST() {
  try {
    console.log('Manual menu sync triggered via API');
    const result = await menuSyncService.syncMenuData();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Menu sync completed successfully',
        itemsCount: result.itemsCount,
        categoriesCount: result.categoriesCount,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Menu sync failed' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during manual menu sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync menu data' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const syncStatus = await menuSyncService.getSyncStatus();
    
    return NextResponse.json({
      syncStatus: syncStatus || {
        syncStatus: 'pending',
        lastSyncAttempt: null,
        lastSuccessfulSync: null,
        itemsCount: 0,
        categoriesCount: 0,
      }
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}