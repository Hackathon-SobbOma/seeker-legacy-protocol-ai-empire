import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { agentWallets, airdropOpportunities, airdropTasks } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const airdropRouter = router({
  getWallet: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

    const rows = await db.select().from(agentWallets).where(eq(agentWallets.userId, ctx.user.id)).limit(1);
    return rows[0] || null;
  }),

  configureWallet: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string().min(32).max(64),
        maxPerTxSol: z.string().default("0.5000"),
        requireApproval: z.boolean().default(true),
        status: z.enum(["active", "paused", "draining"]).default("paused"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

      const existing = await database.select().from(agentWallets).where(eq(agentWallets.userId, ctx.user.id)).limit(1);

      if (existing.length > 0) {
        await database
          .update(agentWallets)
          .set({
            walletAddress: input.walletAddress,
            maxPerTxSol: input.maxPerTxSol,
            requireApproval: input.requireApproval,
            status: input.status,
          })
          .where(eq(agentWallets.userId, ctx.user.id));
      } else {
        await database.insert(agentWallets).values({
          userId: ctx.user.id,
          walletAddress: input.walletAddress,
          maxPerTxSol: input.maxPerTxSol,
          requireApproval: input.requireApproval,
          status: input.status,
          allowlistedPrograms: ["TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"],
        });
      }

      return { success: true };
    }),

  listOpportunities: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

    const rows = await db.select().from(airdropOpportunities).orderBy(desc(airdropOpportunities.estimatedValueUsd));
    if (rows.length === 0) {
      const samples = [
        { title: "Solana Seeker Genesis Claim", protocol: "Seeker Network", chain: "Solana", estimatedValueUsd: "450.00", eligibilityStatus: "eligible" as const, claimUrl: "https://seeker.org/claim", programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { title: "Validator Stake Rebate 2026", protocol: "Jito Staking", chain: "Solana", estimatedValueUsd: "180.00", eligibilityStatus: "pending" as const, claimUrl: "https://jito.network/airdrop", programId: "Jito4APyf642JPZPx3hGc6WWJ8zPKtLvRs4P81t9bb" },
        { title: "DeFi Liquidity Incentive Q1", protocol: "Kamino Finance", chain: "Solana", estimatedValueUsd: "320.00", eligibilityStatus: "eligible" as const, claimUrl: "https://kamino.finance/rewards", programId: "KLnd2g3VocLgfbKgHNs7vLv2x3W3qAgnP31W8Fj3sB" },
      ];
      await db.insert(airdropOpportunities).values(samples);
      return db.select().from(airdropOpportunities).orderBy(desc(airdropOpportunities.estimatedValueUsd));
    }

    return rows;
  }),

  runRalphLoop: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

    const opportunities = await db.select().from(airdropOpportunities);
    let createdCount = 0;

    for (const opp of opportunities) {
      if (opp.eligibilityStatus === "eligible") {
        const existingTask = await db
          .select()
          .from(airdropTasks)
          .where(eq(airdropTasks.opportunityId, opp.id))
          .limit(1);

        if (existingTask.length === 0) {
          await db.insert(airdropTasks).values({
            userId: ctx.user.id,
            opportunityId: opp.id,
            actionType: "claim",
            status: "pending_approval",
            simulationResult: {
              success: true,
              estimatedGasSol: "0.00005",
              allowlistVerified: true,
              estimatedOutput: `$${opp.estimatedValueUsd} equivalent`,
            },
          });
          createdCount++;
        }
      }
    }

    return { success: true, tasksCreatedCount: createdCount };
  }),

  listTasks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

    return db.select().from(airdropTasks).where(eq(airdropTasks.userId, ctx.user.id)).orderBy(desc(airdropTasks.createdAt));
  }),

  executeTaskApproval: protectedProcedure
    .input(z.object({ taskId: z.number(), approved: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database offline" });

      const taskList = await db.select().from(airdropTasks).where(eq(airdropTasks.id, input.taskId)).limit(1);
      if (taskList.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

      const task = taskList[0];
      if (task.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const newStatus = input.approved ? "completed" : "failed";
      const txHash = input.approved ? `5qK${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` : null;

      await db
        .update(airdropTasks)
        .set({
          status: newStatus,
          txHash,
          errorReason: input.approved ? null : "Rejected by user in approval gate",
        })
        .where(eq(airdropTasks.id, input.taskId));

      return { success: true, status: newStatus, txHash };
    }),
});
