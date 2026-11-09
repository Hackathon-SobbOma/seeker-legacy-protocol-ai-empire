CREATE TABLE IF NOT EXISTS `social_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('x','linkedin') NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`displayName` varchar(255),
	`encryptedAccessToken` text,
	`encryptedRefreshToken` text,
	`tokenExpiresAt` timestamp,
	`scopes` text,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_connections_user_provider_unique` UNIQUE(`userId`,`provider`)
);
