import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  tradingAgents,
  seekerTokenAllocations,
  blockchainTransactions,
  revenueTracking,
  clawaiSkillsLog,
  automatedTasks,
  TradingAgent,
  SeekerTokenAllocation,
  BlockchainTransaction,
  RevenueTracking,
  ClawaiSkillsLog,
  AutomatedTask
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "walletAddress"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= TRADING AGENT OPERATIONS =============

export async function createTradingAgent(userId: number, agent: Omit<typeof tradingAgents.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tradingAgents).values({
    ...agent,
    userId,
  });
  return result;
}

export async function getTradingAgentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tradingAgents).where(eq(tradingAgents.userId, userId));
}

export async function getTradingAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(tradingAgents).where(eq(tradingAgents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTradingAgent(id: number, updates: Partial<typeof tradingAgents.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(tradingAgents).set(updates).where(eq(tradingAgents.id, id));
}

export async function deleteTradingAgent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(tradingAgents).where(eq(tradingAgents.id, id));
}

// ============= SEEKER TOKEN ALLOCATION OPERATIONS =============

export async function createTokenAllocation(userId: number, allocation: Omit<typeof seekerTokenAllocations.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(seekerTokenAllocations).values({
    ...allocation,
    userId,
  });
}

export async function getTokenAllocationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(seekerTokenAllocations).where(eq(seekerTokenAllocations.userId, userId));
}

export async function getTokenAllocationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(seekerTokenAllocations).where(eq(seekerTokenAllocations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTokenAllocation(id: number, updates: Partial<typeof seekerTokenAllocations.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(seekerTokenAllocations).set(updates).where(eq(seekerTokenAllocations.id, id));
}

// ============= BLOCKCHAIN TRANSACTION OPERATIONS =============

export async function createBlockchainTransaction(userId: number, transaction: Omit<typeof blockchainTransactions.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(blockchainTransactions).values({
    ...transaction,
    userId,
  });
}

export async function getTransactionsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(blockchainTransactions)
    .where(eq(blockchainTransactions.userId, userId))
    .orderBy(desc(blockchainTransactions.createdAt))
    .limit(limit);
}

export async function getTransactionsByAgentId(agentId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(blockchainTransactions)
    .where(eq(blockchainTransactions.agentId, agentId))
    .orderBy(desc(blockchainTransactions.createdAt))
    .limit(limit);
}

export async function getTransactionByHash(hash: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(blockchainTransactions)
    .where(eq(blockchainTransactions.transactionHash, hash))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBlockchainTransaction(id: number, updates: Partial<typeof blockchainTransactions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(blockchainTransactions).set(updates).where(eq(blockchainTransactions.id, id));
}

// ============= REVENUE TRACKING OPERATIONS =============

export async function createRevenueRecord(userId: number, record: Omit<typeof revenueTracking.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(revenueTracking).values({
    ...record,
    userId,
  });
}

export async function getRevenueByUserId(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(revenueTracking)
    .where(and(
      eq(revenueTracking.userId, userId),
      gte(revenueTracking.date, startDate)
    ))
    .orderBy(desc(revenueTracking.date));
}

export async function getRevenueByAgentId(agentId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(revenueTracking)
    .where(and(
      eq(revenueTracking.agentId, agentId),
      gte(revenueTracking.date, startDate)
    ))
    .orderBy(desc(revenueTracking.date));
}

export async function updateRevenueRecord(id: number, updates: Partial<typeof revenueTracking.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(revenueTracking).set(updates).where(eq(revenueTracking.id, id));
}

// ============= CLAWAI SKILLS LOG OPERATIONS =============

export async function createSkillsLog(userId: number, log: Omit<typeof clawaiSkillsLog.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(clawaiSkillsLog).values({
    ...log,
    userId,
  });
}

export async function getSkillsLogByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(clawaiSkillsLog)
    .where(eq(clawaiSkillsLog.userId, userId))
    .orderBy(desc(clawaiSkillsLog.createdAt))
    .limit(limit);
}

export async function getSkillsLogByStatus(userId: number, status: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(clawaiSkillsLog)
    .where(and(
      eq(clawaiSkillsLog.userId, userId),
      eq(clawaiSkillsLog.status, status as any)
    ))
    .orderBy(desc(clawaiSkillsLog.createdAt));
}

export async function updateSkillsLog(id: number, updates: Partial<typeof clawaiSkillsLog.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(clawaiSkillsLog).set(updates).where(eq(clawaiSkillsLog.id, id));
}

// ============= AUTOMATED TASKS OPERATIONS =============

export async function createAutomatedTask(userId: number, task: Omit<typeof automatedTasks.$inferInsert, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(automatedTasks).values({
    ...task,
    userId,
  });
}

export async function getTasksByUserId(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(automatedTasks)
    .where(eq(automatedTasks.userId, userId))
    .orderBy(desc(automatedTasks.createdAt))
    .limit(limit);
}

export async function getTasksByStatus(userId: number, status: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(automatedTasks)
    .where(and(
      eq(automatedTasks.userId, userId),
      eq(automatedTasks.status, status as any)
    ))
    .orderBy(desc(automatedTasks.createdAt));
}

export async function getSuggestedTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(automatedTasks)
    .where(and(
      eq(automatedTasks.userId, userId),
      eq(automatedTasks.status, "suggested")
    ))
    .orderBy(desc(automatedTasks.priority));
}

export async function updateAutomatedTask(id: number, updates: Partial<typeof automatedTasks.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(automatedTasks).set(updates).where(eq(automatedTasks.id, id));
}
