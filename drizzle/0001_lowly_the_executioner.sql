CREATE TABLE `automated_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskTitle` varchar(255) NOT NULL,
	`taskDescription` text,
	`taskCategory` enum('agent_setup','token_distribution','monitoring','optimization','other') NOT NULL,
	`status` enum('suggested','in_progress','completed','failed','skipped') NOT NULL DEFAULT 'suggested',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`suggestedBy` varchar(255),
	`completedBy` varchar(255),
	`metadata` json,
	`suggestedAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automated_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blockchain_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int,
	`transactionHash` varchar(255) NOT NULL,
	`blockchain` enum('solana','ethereum','other') NOT NULL DEFAULT 'solana',
	`transactionType` enum('trade','transfer','swap','stake','other') NOT NULL,
	`fromAddress` varchar(128) NOT NULL,
	`toAddress` varchar(128) NOT NULL,
	`amount` decimal(20,8) NOT NULL,
	`tokenSymbol` varchar(20),
	`status` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`gasUsed` decimal(20,8),
	`gasFee` decimal(20,8),
	`profitLoss` decimal(20,8),
	`metadata` json,
	`executedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blockchain_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `blockchain_transactions_transactionHash_unique` UNIQUE(`transactionHash`)
);
--> statement-breakpoint
CREATE TABLE `clawai_skills_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`skillType` enum('agent_management','token_distribution','transaction_monitoring','revenue_tracking','task_completion','other') NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`taskDescription` text,
	`input` json,
	`output` json,
	`errorMessage` text,
	`executionTime` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clawai_skills_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentId` int,
	`date` timestamp NOT NULL,
	`totalRevenue` decimal(20,8) NOT NULL DEFAULT '0',
	`totalExpenses` decimal(20,8) NOT NULL DEFAULT '0',
	`netProfit` decimal(20,8) NOT NULL DEFAULT '0',
	`numberOfTrades` int NOT NULL DEFAULT 0,
	`winningTrades` int NOT NULL DEFAULT 0,
	`losingTrades` int NOT NULL DEFAULT 0,
	`winRate` decimal(5,2) NOT NULL DEFAULT '0',
	`roi` decimal(10,2) NOT NULL DEFAULT '0',
	`metrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenue_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seeker_token_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAddress` varchar(128) NOT NULL,
	`totalAllocated` decimal(20,8) NOT NULL,
	`amountDistributed` decimal(20,8) NOT NULL DEFAULT '0',
	`amountPending` decimal(20,8) NOT NULL DEFAULT '0',
	`allocationStatus` enum('pending','approved','distributed','revoked') NOT NULL DEFAULT 'pending',
	`grantType` enum('builder','community','ecosystem','other') NOT NULL DEFAULT 'builder',
	`vestingSchedule` json,
	`distributionHistory` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seeker_token_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trading_agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','paused','stopped','error') NOT NULL DEFAULT 'active',
	`agentType` enum('solana','ethereum','multi-chain') NOT NULL DEFAULT 'solana',
	`configuration` json,
	`walletAddress` varchar(128),
	`isLive` boolean NOT NULL DEFAULT false,
	`performanceMetrics` json,
	`lastExecuted` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trading_agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `walletAddress` varchar(128);