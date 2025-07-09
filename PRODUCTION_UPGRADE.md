# Production Database Upgrade Guide

## Current Setup
- **Development**: SQLite database with Drizzle ORM
- **Storage**: Local `src/db/database.db` file
- **Features**: Order toggle system with database persistence

## Production Migration Options

### Option 1: PostgreSQL (Recommended)

#### Step 1: Choose a PostgreSQL Provider
- **Supabase** (Easy setup, includes auth/storage)
- **Neon** (Serverless PostgreSQL)
- **Railway** (Simple deployment)
- **Vercel Postgres** (Integrated with Vercel)

#### Step 2: Update Configuration
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

#### Step 3: Install PostgreSQL Dependencies
```bash
npm install pg @types/pg
npm uninstall better-sqlite3 @types/better-sqlite3
```

#### Step 4: Update Database Connection
```typescript
// src/db/connection.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);
```

#### Step 5: Update Schema (if needed)
```typescript
// src/db/schema.ts
import { pgTable, serial, boolean, text, timestamp } from 'drizzle-orm/pg-core';

export const orderConfig = pgTable('order_config', {
  id: serial('id').primaryKey(),
  ordersEnabled: boolean('orders_enabled').notNull().default(true),
  disabledMessage: text('disabled_message').notNull().default('Online ordering is currently unavailable. Please call us to place your order.'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

#### Step 6: Environment Variables
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Step 7: Run Migration
```bash
npm run db:generate
npm run db:migrate
```

### Option 2: Turso (SQLite in Production)

#### Step 1: Setup Turso
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create delica-orders

# Get connection URL
turso db show delica-orders
```

#### Step 2: Update Configuration
```typescript
// drizzle.config.ts
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
```

#### Step 3: Install Turso Client
```bash
npm install @libsql/client
```

#### Step 4: Update Connection
```typescript
// src/db/connection.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

### Option 3: Supabase (Recommended for Rapid Setup)

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get database URL from Settings > Database

#### Step 2: Use Supabase's Built-in Features
```typescript
// Optional: Use Supabase client directly
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Migration Checklist

- [ ] Choose production database provider
- [ ] Update drizzle.config.ts
- [ ] Install new database dependencies
- [ ] Update connection configuration
- [ ] Set environment variables
- [ ] Run migrations in production
- [ ] Test order toggle functionality
- [ ] Update deployment scripts
- [ ] Monitor database performance

## Environment Variables

Add these to your production environment:

```env
# PostgreSQL
DATABASE_URL=postgresql://...

# Turso
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Deployment Notes

1. **Database First**: Set up your production database before deploying
2. **Migrations**: Run migrations in production environment
3. **Environment**: Ensure all environment variables are set
4. **Testing**: Test the order toggle functionality thoroughly
5. **Monitoring**: Set up database monitoring and alerts

## Current Features That Will Work

✅ **Order Toggle**: Admin can enable/disable orders
✅ **Real-time Sync**: All users see changes within 30 seconds
✅ **Message Customization**: Custom disabled messages
✅ **Error Handling**: Graceful fallbacks and error messages
✅ **localStorage Cache**: Offline fallback support
✅ **API Integration**: RESTful API endpoints
✅ **Database Persistence**: Survives server restarts