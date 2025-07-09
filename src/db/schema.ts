import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const orderConfig = sqliteTable('order_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ordersEnabled: integer('orders_enabled', { mode: 'boolean' }).notNull().default(true),
  disabledMessage: text('disabled_message').notNull().default('Online ordering is currently unavailable. Please call us to place your order.'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

export type OrderConfig = typeof orderConfig.$inferSelect;
export type InsertOrderConfig = typeof orderConfig.$inferInsert;