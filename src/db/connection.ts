import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/db/database.db');

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    const sqlite = new Database(dbPath);
    // Set database pragmas for better error handling
    sqlite.pragma('journal_mode = DELETE'); // Use DELETE mode instead of WAL
    sqlite.pragma('synchronous = NORMAL'); // Balance performance and safety
    sqlite.pragma('temp_store = memory'); // Store temp tables in memory
    sqlite.pragma('mmap_size = 268435456'); // 256MB memory map
    db = drizzle(sqlite, { schema });
  }
  return db;
}

export type Database = ReturnType<typeof getDatabase>;