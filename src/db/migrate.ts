import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase } from './connection';
import { orderConfig } from './schema';

async function runMigrations() {
  try {
    const db = getDatabase();
    
    // Run migrations
    migrate(db, { migrationsFolder: './src/db/migrations' });
    
    // Check if we need to insert default configuration
    const existingConfig = await db.select().from(orderConfig).limit(1);
    
    if (existingConfig.length === 0) {
      // Insert default configuration
      await db.insert(orderConfig).values({
        ordersEnabled: true,
        disabledMessage: 'Online ordering is currently unavailable. Please call us to place your order.',
      });
      
      console.log('✅ Database initialized with default order configuration');
    }
    
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations when this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };