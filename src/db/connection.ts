import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src/db/database.db');

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    db = drizzle(sqlite, { schema });
  }
  return db;
}

export type Database = ReturnType<typeof getDatabase>;