ALTER TABLE `habits` ADD `order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `habits` DROP COLUMN `scheduledTo`;