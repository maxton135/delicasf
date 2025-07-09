import { NextRequest, NextResponse } from 'next/server';
import { menuSyncService } from '../../../../db/menuSyncService';
import { backgroundSyncService } from '../../../../services/backgroundSync';
import { getDatabase } from '../../../../db/connection';
import { menuItems, menuCategories, menuSyncStatus } from '../../../../db/schema';

export async function GET() {
  try {
    const db = getDatabase();
    
    // Get basic sync status
    const syncStatus = await menuSyncService.getSyncStatus();
    const backgroundStatus = backgroundSyncService.getStatus();
    
    // Get database metrics
    const [itemsCount] = await db.select().from(menuItems);
    const [categoriesCount] = await db.select().from(menuCategories);
    
    // Calculate sync health metrics
    const now = new Date();
    const lastSuccessfulSync = syncStatus?.lastSuccessfulSync ? new Date(syncStatus.lastSuccessfulSync) : null;
    const lastSyncAttempt = syncStatus?.lastSyncAttempt ? new Date(syncStatus.lastSyncAttempt) : null;
    
    const minutesSinceLastSync = lastSuccessfulSync 
      ? Math.floor((now.getTime() - lastSuccessfulSync.getTime()) / (1000 * 60))
      : null;
    
    const minutesSinceLastAttempt = lastSyncAttempt
      ? Math.floor((now.getTime() - lastSyncAttempt.getTime()) / (1000 * 60))
      : null;
    
    // Determine health status
    let healthStatus = 'unknown';
    let healthMessage = 'No sync data available';
    
    if (syncStatus) {
      if (syncStatus.syncStatus === 'success') {
        if (minutesSinceLastSync !== null) {
          if (minutesSinceLastSync <= 60) {
            healthStatus = 'healthy';
            healthMessage = `Last sync ${minutesSinceLastSync} minutes ago`;
          } else if (minutesSinceLastSync <= 120) {
            healthStatus = 'warning';
            healthMessage = `Last sync ${minutesSinceLastSync} minutes ago (getting stale)`;
          } else {
            healthStatus = 'error';
            healthMessage = `Last sync ${minutesSinceLastSync} minutes ago (data is stale)`;
          }
        }
      } else if (syncStatus.syncStatus === 'error') {
        healthStatus = 'error';
        healthMessage = `Sync failed: ${syncStatus.errorMessage || 'Unknown error'}`;
      } else if (syncStatus.syncStatus === 'in_progress') {
        healthStatus = 'syncing';
        healthMessage = 'Sync currently in progress';
      }
    }
    
    // Environment and configuration info
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      squareEnvironment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
      syncIntervalMinutes: parseInt(process.env.MENU_SYNC_INTERVAL_MINUTES || '30', 10),
      hasSquareToken: !!process.env.SQUARE_ACCESS_TOKEN,
    };
    
    const response = NextResponse.json({
      health: {
        status: healthStatus,
        message: healthMessage,
        timestamp: now.toISOString(),
      },
      sync: {
        lastSuccessfulSync: syncStatus?.lastSuccessfulSync || null,
        lastSyncAttempt: syncStatus?.lastSyncAttempt || null,
        syncStatus: syncStatus?.syncStatus || 'unknown',
        errorMessage: syncStatus?.errorMessage || null,
        minutesSinceLastSync,
        minutesSinceLastAttempt,
      },
      backgroundSync: {
        isActive: backgroundStatus.isActive,
        intervalMinutes: backgroundStatus.intervalMinutes,
        isCurrentlyRunning: backgroundStatus.isCurrentlyRunning,
      },
      database: {
        itemsCount: syncStatus?.itemsCount || 0,
        categoriesCount: syncStatus?.categoriesCount || 0,
        connected: true, // If we reach here, DB is connected
      },
      environment: environmentInfo,
      performance: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
    
    // Add appropriate caching headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Error fetching menu health:', error);
    return NextResponse.json(
      { 
        health: {
          status: 'error',
          message: 'Failed to fetch health information',
          timestamp: new Date().toISOString(),
        },
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}