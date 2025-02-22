PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`frequency` integer DEFAULT 1 NOT NULL,
	`scheduledTo` text DEFAULT '2025-01-01' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_habits`("id", "title", "active", "frequency", "scheduledTo") SELECT "id", "title", "active", "frequency", "scheduledTo" FROM `habits`;--> statement-breakpoint
DROP TABLE `habits`;--> statement-breakpoint
ALTER TABLE `__new_habits` RENAME TO `habits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;