CREATE TABLE `bullets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`text` text,
	`reflection` text,
	`createdUTCTimestamp` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bulletsToCollections` (
	`bulletId` integer,
	`collectionId` integer,
	`order` integer,
	PRIMARY KEY(`bulletId`, `collectionId`),
	FOREIGN KEY (`bulletId`) REFERENCES `bullets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collectionId`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`createdLocalDate` text DEFAULT (date('now', 'localtime')) NOT NULL,
	`createdUTCTimestamp` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
DROP TABLE `countTable`;