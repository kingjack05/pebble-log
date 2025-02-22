CREATE TABLE `habitCompletions` (
	`habitId` integer NOT NULL,
	`date` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	PRIMARY KEY(`date`, `habitId`),
	FOREIGN KEY (`habitId`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `habits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`frequency` integer DEFAULT 1 NOT NULL,
	`scheduledTo` text
);
