import { menuSyncService } from '../db/menuSyncService';

class BackgroundSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private intervalMinutes: number;

  constructor() {
    // Get sync interval from environment variable or default to 30 minutes
    this.intervalMinutes = parseInt(process.env.MENU_SYNC_INTERVAL_MINUTES || '30', 10);
    
    // Ensure minimum interval of 5 minutes to avoid excessive API calls
    if (this.intervalMinutes < 5) {
      this.intervalMinutes = 5;
    }
  }

  async performSync() {
    if (this.isRunning) {
      console.log('Background sync already running, skipping...');
      return;
    }

    this.isRunning = true;
    
    try {
      console.log('Starting background menu sync...');
      const result = await menuSyncService.syncMenuData();
      
      if (result.success) {
        console.log(`Background sync completed successfully: ${result.itemsCount} items, ${result.categoriesCount} categories`);
      } else {
        console.error('Background sync failed:', result.error);
      }
    } catch (error) {
      console.error('Background sync encountered an error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    if (this.syncInterval) {
      console.log('Background sync already running');
      return;
    }

    console.log(`Starting background sync service (every ${this.intervalMinutes} minutes)`);
    
    // Run initial sync after 30 seconds (to allow app to fully start)
    setTimeout(() => {
      this.performSync();
    }, 30000);
    
    // Set up recurring sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.intervalMinutes * 60 * 1000);
  }

  stop() {
    if (this.syncInterval) {
      console.log('Stopping background sync service');
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getStatus() {
    return {
      isActive: this.syncInterval !== null,
      intervalMinutes: this.intervalMinutes,
      isCurrentlyRunning: this.isRunning,
    };
  }
}

// Export singleton instance
export const backgroundSyncService = new BackgroundSyncService();

// Auto-start disabled - menu sync is now manual only
// if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
//   backgroundSyncService.start();
// }