CREATE TABLE `order_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orders_enabled` integer DEFAULT true NOT NULL,
	`disabled_message` text DEFAULT 'Online ordering is currently unavailable. Please call us to place your order.' NOT NULL,
	`created_at` text DEFAULT '2025-07-09T03:40:06.640Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T03:40:06.641Z' NOT NULL
);
