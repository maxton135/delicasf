import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Order Configuration Table
export const orderConfig = sqliteTable('order_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ordersEnabled: integer('orders_enabled', { mode: 'boolean' }).notNull().default(true),
  disabledMessage: text('disabled_message').notNull().default('Online ordering is currently unavailable. Please call us to place your order.'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Menu Categories Table
export const menuCategories = sqliteTable('menu_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  squareId: text('square_id').notNull().unique(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Menu Items Table
export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  squareId: text('square_id').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isSoldOut: integer('is_sold_out', { mode: 'boolean' }).notNull().default(false),
  displayOrder: integer('display_order').default(0),
  rawSquareData: text('raw_square_data'), // Store complete Square API response as JSON
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Junction table for menu items and categories (many-to-many)
export const menuItemCategories = sqliteTable('menu_item_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menuItemId: integer('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Menu Item Variations Table (for combo types, sizes, etc.)
export const menuItemVariations = sqliteTable('menu_item_variations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menuItemId: integer('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  squareVariationId: text('square_variation_id'),
  name: text('name').notNull(),
  type: text('type'), // 'combo_type', 'size', 'option', etc.
  value: text('value').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Display Categories Table (Admin-controlled categories for website display)
export const displayCategories = sqliteTable('display_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Junction table for menu items and display categories (many-to-many)
export const menuItemDisplayCategories = sqliteTable('menu_item_display_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  menuItemId: integer('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  displayCategoryId: integer('display_category_id').notNull().references(() => displayCategories.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Sync Status Table
export const menuSyncStatus = sqliteTable('menu_sync_status', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  lastSyncAttempt: text('last_sync_attempt'),
  lastSuccessfulSync: text('last_successful_sync'),
  syncStatus: text('sync_status').notNull().default('pending'), // 'success', 'error', 'in_progress', 'pending'
  errorMessage: text('error_message'),
  itemsCount: integer('items_count').default(0),
  categoriesCount: integer('categories_count').default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Type exports
export type OrderConfig = typeof orderConfig.$inferSelect;
export type InsertOrderConfig = typeof orderConfig.$inferInsert;

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = typeof menuCategories.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

export type MenuItemCategory = typeof menuItemCategories.$inferSelect;
export type InsertMenuItemCategory = typeof menuItemCategories.$inferInsert;

export type MenuItemVariation = typeof menuItemVariations.$inferSelect;
export type InsertMenuItemVariation = typeof menuItemVariations.$inferInsert;

export type DisplayCategory = typeof displayCategories.$inferSelect;
export type InsertDisplayCategory = typeof displayCategories.$inferInsert;

export type MenuItemDisplayCategory = typeof menuItemDisplayCategories.$inferSelect;
export type InsertMenuItemDisplayCategory = typeof menuItemDisplayCategories.$inferInsert;

export type MenuSyncStatus = typeof menuSyncStatus.$inferSelect;
export type InsertMenuSyncStatus = typeof menuSyncStatus.$inferInsert;