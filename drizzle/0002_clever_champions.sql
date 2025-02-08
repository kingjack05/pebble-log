PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bullets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`time` text NOT NULL,
	`reflection` text,
	`createdUTCTimestamp` text DEFAULT (datetime('now')) NOT NULL
);
ALTER TABLE `bullets` ADD COLUMN `time` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
INSERT INTO `__new_bullets`("id", "type", "text", "time", "reflection", "createdUTCTimestamp") SELECT "id", "type", "text", "time", "reflection", "createdUTCTimestamp" FROM `bullets`;--> statement-breakpoint
DROP TABLE `bullets`;--> statement-breakpoint
ALTER TABLE `__new_bullets` RENAME TO `bullets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_bulletsToCollections` (
	`bulletId` integer NOT NULL,
	`collectionId` integer NOT NULL,
	`order` integer NOT NULL,
	PRIMARY KEY(`bulletId`, `collectionId`),
	FOREIGN KEY (`bulletId`) REFERENCES `bullets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "orderIsPositive" CHECK("__new_bulletsToCollections"."order" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_bulletsToCollections`("bulletId", "collectionId", "order") SELECT "bulletId", "collectionId", "order" FROM `bulletsToCollections`;--> statement-breakpoint
DROP TABLE `bulletsToCollections`;--> statement-breakpoint
ALTER TABLE `__new_bulletsToCollections` RENAME TO `bulletsToCollections`;