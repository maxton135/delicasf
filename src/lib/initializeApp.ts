// Initialize background services when the app starts
import { backgroundSyncService } from '../services/backgroundSync';

let initialized = false;

export function initializeApp() {
  // Only initialize once
  if (initialized) return;
  
  // Only run on server side
  if (typeof window !== 'undefined') return;
  
  console.log('Initializing application services...');
  
  try {
    // Background sync service disabled - menu sync is now manual only
    // backgroundSyncService.start();
    
    initialized = true;
    console.log('Application services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application services:', error);
  }
}

// Call initialization immediately in production
if (process.env.NODE_ENV === 'production') {
  initializeApp();
}