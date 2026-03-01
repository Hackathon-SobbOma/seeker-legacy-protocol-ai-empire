import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  json,
  boolean,
  bigint
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  walletAddress: varchar("walletAddress", { length: 128 }), // Solana wallet
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Trading agents table - stores configuration and metadata for each agent
 */
export const tradingAgents = mysqlTable("trading_agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "stopped", "error"]).default("active").notNull(),
  agentType: mysqlEnum("agentType", ["solana", "ethereum", "multi-chain"]).default("solana").notNull(),
  configuration: json("configuration").$type<{
    strategy?: string;
    riskLevel?: "low" | "medium" | "high";
    tradingPairs?: string[];
    maxTradeSize?: number;
    stopLoss?: number;
    takeProfit?: number;
  }>(),
  walletAddress: varchar("walletAddress", { length: 128 }),
  isLive: boolean("isLive").default(false).notNull(),
  performanceMetrics: json("performanceMetrics").$type<{
    totalTrades?: number;
    winRate?: number;
    totalProfit?: number;
    roi?: number;
  }>(),
  lastExecuted: timestamp("lastExecuted"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TradingAgent = typeof tradingAgents.$inferSelect;
export type InsertTradingAgent = typeof tradingAgents.$inferInsert;

/**
 * Solana Seeker token allocations table
 */
export const seekerTokenAllocations = mysqlTable("seeker_token_allocations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 128 }).notNull(),
  totalAllocated: decimal("totalAllocated", { precision: 20, scale: 8 }).notNull(),
  amountDistributed: decimal("amountDistributed", { precision: 20, scale: 8 }).default("0").notNull(),
  amountPending: decimal("amountPending", { precision: 20, scale: 8 }).default("0").notNull(),
  allocationStatus: mysqlEnum("allocationStatus", ["pending", "approved", "distributed", "revoked"]).default("pending").notNull(),
  grantType: mysqlEnum("grantType", ["builder", "community", "ecosystem", "other"]).default("builder").notNull(),
  vestingSchedule: json("vestingSchedule").$type<{
    startDate?: string;
    endDate?: string;
    cliffMonths?: number;
    vestingMonths?: number;
  }>(),
  distributionHistory: json("distributionHistory").$type<Array<{
    date: string;
    amount: number;
    txHash: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SeekerTokenAllocation = typeof seekerTokenAllocations.$inferSelect;
export type InsertSeekerTokenAllocation = typeof seekerTokenAllocations.$inferInsert;

/**
 * Blockchain transactions table - tracks all on-chain operations
 */
export const blockchainTransactions = mysqlTable("blockchain_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"),
  transactionHash: varchar("transactionHash", { length: 255 }).notNull().unique(),
  blockchain: mysqlEnum("blockchain", ["solana", "ethereum", "other"]).default("solana").notNull(),
  transactionType: mysqlEnum("transactionType", ["trade", "transfer", "swap", "stake", "other"]).notNull(),
  fromAddress: varchar("fromAddress", { length: 128 }).notNull(),
  toAddress: varchar("toAddress", { length: 128 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  tokenSymbol: varchar("tokenSymbol", { length: 20 }),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  gasUsed: decimal("gasUsed", { precision: 20, scale: 8 }),
  gasFee: decimal("gasFee", { precision: 20, scale: 8 }),
  profitLoss: decimal("profitLoss", { precision: 20, scale: 8 }),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  executedAt: timestamp("executedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
export type InsertBlockchainTransaction = typeof blockchainTransactions.$inferInsert;

/**
 * Revenue tracking table - aggregated trading performance data
 */
export const revenueTracking = mysqlTable("revenue_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"),
  date: timestamp("date").notNull(),
  totalRevenue: decimal("totalRevenue", { precision: 20, scale: 8 }).default("0").notNull(),
  totalExpenses: decimal("totalExpenses", { precision: 20, scale: 8 }).default("0").notNull(),
  netProfit: decimal("netProfit", { precision: 20, scale: 8 }).default("0").notNull(),
  numberOfTrades: int("numberOfTrades").default(0).notNull(),
  winningTrades: int("winningTrades").default(0).notNull(),
  losingTrades: int("losingTrades").default(0).notNull(),
  winRate: decimal("winRate", { precision: 5, scale: 2 }).default("0").notNull(),
  roi: decimal("roi", { precision: 10, scale: 2 }).default("0").notNull(),
  metrics: json("metrics").$type<{
    avgTradeSize?: number;
    maxProfit?: number;
    maxLoss?: number;
    profitFactor?: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueTracking = typeof revenueTracking.$inferSelect;
export type InsertRevenueTracking = typeof revenueTracking.$inferInsert;

/**
 * ClawAI skills execution log - tracks automation task execution
 */
export const clawaiSkillsLog = mysqlTable("clawai_skills_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  skillType: mysqlEnum("skillType", ["agent_management", "token_distribution", "transaction_monitoring", "revenue_tracking", "task_completion", "other"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  taskDescription: text("taskDescription"),
  input: json("input").$type<Record<string, unknown>>(),
  output: json("output").$type<Record<string, unknown>>(),
  errorMessage: text("errorMessage"),
  executionTime: int("executionTime"), // in milliseconds
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClawaiSkillsLog = typeof clawaiSkillsLog.$inferSelect;
export type InsertClawaiSkillsLog = typeof clawaiSkillsLog.$inferInsert;

/**
 * Automated tasks table - tracks suggested tasks and their completion status
 */
export const automatedTasks = mysqlTable("automated_tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskTitle: varchar("taskTitle", { length: 255 }).notNull(),
  taskDescription: text("taskDescription"),
  taskCategory: mysqlEnum("taskCategory", ["agent_setup", "token_distribution", "monitoring", "optimization", "other"]).notNull(),
  status: mysqlEnum("status", ["suggested", "in_progress", "completed", "failed", "skipped"]).default("suggested").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  suggestedBy: varchar("suggestedBy", { length: 255 }), // ClawAI or system
  completedBy: varchar("completedBy", { length: 255 }), // ClawAI or user
  metadata: json("metadata").$type<Record<string, unknown>>(),
  suggestedAt: timestamp("suggestedAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomatedTask = typeof automatedTasks.$inferSelect;
export type InsertAutomatedTask = typeof automatedTasks.$inferInsert;
