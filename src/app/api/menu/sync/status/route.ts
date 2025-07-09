import { NextRequest, NextResponse } from 'next/server';
import { backgroundSyncService } from '../../../../../services/backgroundSync';
import { menuSyncService } from '../../../../../db/menuSyncService';

export async function GET() {
  try {
    const backgroundStatus = backgroundSyncService.getStatus();
    const syncStatus = await menuSyncService.getSyncStatus();
    
    return NextResponse.json({
      backgroundSync: backgroundStatus,
      lastSync: syncStatus,
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'start') {
      backgroundSyncService.start();
      return NextResponse.json({ message: 'Background sync started' });
    } else if (action === 'stop') {
      backgroundSyncService.stop();
      return NextResponse.json({ message: 'Background sync stopped' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error controlling background sync:', error);
    return NextResponse.json(
      { error: 'Failed to control background sync' },
      { status: 500 }
    );
  }
}