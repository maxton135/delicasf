CREATE TABLE `menu_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`square_id` text NOT NULL,
	`name` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_categories_square_id_unique` ON `menu_categories` (`square_id`);--> statement-breakpoint
CREATE TABLE `menu_item_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` text DEFAULT '2025-07-09T04:04:06.167Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_item_variations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`square_variation_id` text,
	`name` text NOT NULL,
	`type` text,
	`value` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-09T04:04:06.167Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T04:04:06.167Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`square_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0,
	`raw_square_data` text,
	`created_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_square_id_unique` ON `menu_items` (`square_id`);--> statement-breakpoint
CREATE TABLE `menu_sync_status` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`last_sync_attempt` text,
	`last_successful_sync` text,
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`items_count` integer DEFAULT 0,
	`categories_count` integer DEFAULT 0,
	`created_at` text DEFAULT '2025-07-09T04:04:06.167Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T04:04:06.167Z' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orders_enabled` integer DEFAULT true NOT NULL,
	`disabled_message` text DEFAULT 'Online ordering is currently unavailable. Please call us to place your order.' NOT NULL,
	`created_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-09T04:04:06.166Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_order_config`("id", "orders_enabled", "disabled_message", "created_at", "updated_at") SELECT "id", "orders_enabled", "disabled_message", "created_at", "updated_at" FROM `order_config`;--> statement-breakpoint
DROP TABLE `order_config`;--> statement-breakpoint
ALTER TABLE `__new_order_config` RENAME TO `order_config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;