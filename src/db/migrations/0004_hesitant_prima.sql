CREATE TABLE `combo_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `combo_menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`combo_category_id` integer NOT NULL,
	`is_required` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`combo_category_id`) REFERENCES `combo_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_item_combo_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`combo_category_id` integer NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`combo_category_id`) REFERENCES `combo_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_display_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_display_categories`("id", "name", "description", "display_order", "is_active", "created_at", "updated_at") SELECT "id", "name", "description", "display_order", "is_active", "created_at", "updated_at" FROM `display_categories`;--> statement-breakpoint
DROP TABLE `display_categories`;--> statement-breakpoint
ALTER TABLE `__new_display_categories` RENAME TO `display_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_menu_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`square_id` text NOT NULL,
	`name` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_menu_categories`("id", "square_id", "name", "display_order", "is_active", "created_at", "updated_at") SELECT "id", "square_id", "name", "display_order", "is_active", "created_at", "updated_at" FROM `menu_categories`;--> statement-breakpoint
DROP TABLE `menu_categories`;--> statement-breakpoint
ALTER TABLE `__new_menu_categories` RENAME TO `menu_categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `menu_categories_square_id_unique` ON `menu_categories` (`square_id`);--> statement-breakpoint
CREATE TABLE `__new_menu_item_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `menu_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_menu_item_categories`("id", "menu_item_id", "category_id", "created_at") SELECT "id", "menu_item_id", "category_id", "created_at" FROM `menu_item_categories`;--> statement-breakpoint
DROP TABLE `menu_item_categories`;--> statement-breakpoint
ALTER TABLE `__new_menu_item_categories` RENAME TO `menu_item_categories`;--> statement-breakpoint
CREATE TABLE `__new_menu_item_display_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`display_category_id` integer NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`display_category_id`) REFERENCES `display_categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_menu_item_display_categories`("id", "menu_item_id", "display_category_id", "created_at") SELECT "id", "menu_item_id", "display_category_id", "created_at" FROM `menu_item_display_categories`;--> statement-breakpoint
DROP TABLE `menu_item_display_categories`;--> statement-breakpoint
ALTER TABLE `__new_menu_item_display_categories` RENAME TO `menu_item_display_categories`;--> statement-breakpoint
CREATE TABLE `__new_menu_item_variations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`menu_item_id` integer NOT NULL,
	`square_variation_id` text,
	`name` text NOT NULL,
	`type` text,
	`value` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_menu_item_variations`("id", "menu_item_id", "square_variation_id", "name", "type", "value", "is_active", "created_at", "updated_at") SELECT "id", "menu_item_id", "square_variation_id", "name", "type", "value", "is_active", "created_at", "updated_at" FROM `menu_item_variations`;--> statement-breakpoint
DROP TABLE `menu_item_variations`;--> statement-breakpoint
ALTER TABLE `__new_menu_item_variations` RENAME TO `menu_item_variations`;--> statement-breakpoint
CREATE TABLE `__new_menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`square_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_sold_out` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0,
	`raw_square_data` text,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_menu_items`("id", "square_id", "name", "description", "is_active", "is_sold_out", "display_order", "raw_square_data", "created_at", "updated_at") SELECT "id", "square_id", "name", "description", "is_active", "is_sold_out", "display_order", "raw_square_data", "created_at", "updated_at" FROM `menu_items`;--> statement-breakpoint
DROP TABLE `menu_items`;--> statement-breakpoint
ALTER TABLE `__new_menu_items` RENAME TO `menu_items`;--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_square_id_unique` ON `menu_items` (`square_id`);--> statement-breakpoint
CREATE TABLE `__new_menu_sync_status` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`last_sync_attempt` text,
	`last_successful_sync` text,
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`items_count` integer DEFAULT 0,
	`categories_count` integer DEFAULT 0,
	`created_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_menu_sync_status`("id", "last_sync_attempt", "last_successful_sync", "sync_status", "error_message", "items_count", "categories_count", "created_at", "updated_at") SELECT "id", "last_sync_attempt", "last_successful_sync", "sync_status", "error_message", "items_count", "categories_count", "created_at", "updated_at" FROM `menu_sync_status`;--> statement-breakpoint
DROP TABLE `menu_sync_status`;--> statement-breakpoint
ALTER TABLE `__new_menu_sync_status` RENAME TO `menu_sync_status`;--> statement-breakpoint
CREATE TABLE `__new_order_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orders_enabled` integer DEFAULT true NOT NULL,
	`disabled_message` text DEFAULT 'Online ordering is currently unavailable. Please call us to place your order.' NOT NULL,
	`created_at` text DEFAULT '2025-07-20T20:37:13.578Z' NOT NULL,
	`updated_at` text DEFAULT '2025-07-20T20:37:13.579Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_order_config`("id", "orders_enabled", "disabled_message", "created_at", "updated_at") SELECT "id", "orders_enabled", "disabled_message", "created_at", "updated_at" FROM `order_config`;--> statement-breakpoint
DROP TABLE `order_config`;--> statement-breakpoint
ALTER TABLE `__new_order_config` RENAME TO `order_config`;