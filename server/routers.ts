import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= TRADING AGENTS ROUTER =============
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTradingAgentsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const agent = await db.getTradingAgentById(input.id);
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        return agent;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        agentType: z.enum(["solana", "ethereum", "multi-chain"]).default("solana"),
        configuration: z.record(z.string(), z.unknown()).optional(),
        walletAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTradingAgent(ctx.user.id, {
          name: input.name,
          description: input.description,
          agentType: input.agentType,
          configuration: input.configuration,
          walletAddress: input.walletAddress,
          status: "active",
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "stopped", "error"]).optional(),
        configuration: z.record(z.string(), z.unknown()).optional(),
        performanceMetrics: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTradingAgent(input.id, {
          name: input.name,
          description: input.description,
          status: input.status,
          configuration: input.configuration,
          performanceMetrics: input.performanceMetrics,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTradingAgent(input.id);
        return { success: true };
      }),
  }),

  // ============= SEEKER TOKEN ALLOCATIONS ROUTER =============
  tokens: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTokenAllocationsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const allocation = await db.getTokenAllocationById(input.id);
        if (!allocation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Token allocation not found" });
        }
        return allocation;
      }),

    create: protectedProcedure
      .input(z.object({
        walletAddress: z.string(),
        totalAllocated: z.string(),
        grantType: z.enum(["builder", "community", "ecosystem", "other"]).default("builder"),
        vestingSchedule: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTokenAllocation(ctx.user.id, {
          walletAddress: input.walletAddress,
          totalAllocated: input.totalAllocated,
          amountDistributed: "0",
          amountPending: input.totalAllocated,
          allocationStatus: "pending",
          grantType: input.grantType,
          vestingSchedule: input.vestingSchedule,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        allocationStatus: z.enum(["pending", "approved", "distributed", "revoked"]).optional(),
        amountDistributed: z.string().optional(),
        amountPending: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateTokenAllocation(input.id, {
          allocationStatus: input.allocationStatus,
          amountDistributed: input.amountDistributed,
          amountPending: input.amountPending,
        });
        return { success: true };
      }),
  }),

  // ============= BLOCKCHAIN TRANSACTIONS ROUTER =============
  transactions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactionsByUserId(ctx.user.id, input.limit);
      }),

    byAgent: protectedProcedure
      .input(z.object({ agentId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await db.getTransactionsByAgentId(input.agentId, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ hash: z.string() }))
      .query(async ({ input }) => {
        const transaction = await db.getTransactionByHash(input.hash);
        if (!transaction) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found" });
        }
        return transaction;
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        transactionHash: z.string(),
        blockchain: z.enum(["solana", "ethereum", "other"]).default("solana"),
        transactionType: z.enum(["trade", "transfer", "swap", "stake", "other"]),
        fromAddress: z.string(),
        toAddress: z.string(),
        amount: z.string(),
        tokenSymbol: z.string().optional(),
        status: z.enum(["pending", "confirmed", "failed"]).default("pending"),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createBlockchainTransaction(ctx.user.id, {
          agentId: input.agentId,
          transactionHash: input.transactionHash,
          blockchain: input.blockchain,
          transactionType: input.transactionType,
          fromAddress: input.fromAddress,
          toAddress: input.toAddress,
          amount: input.amount,
          tokenSymbol: input.tokenSymbol,
          status: input.status,
        });
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "failed"]),
        profitLoss: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateBlockchainTransaction(input.id, {
          status: input.status,
          profitLoss: input.profitLoss,
        });
        return { success: true };
      }),
  }),

  // ============= REVENUE TRACKING ROUTER =============
  revenue: router({
    list: protectedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return await db.getRevenueByUserId(ctx.user.id, input.days);
      }),

    byAgent: protectedProcedure
      .input(z.object({ agentId: z.number(), days: z.number().default(30) }))
      .query(async ({ input }) => {
        return await db.getRevenueByAgentId(input.agentId, input.days);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number().optional(),
        date: z.date(),
        totalRevenue: z.string(),
        totalExpenses: z.string(),
        numberOfTrades: z.number(),
        winningTrades: z.number(),
        losingTrades: z.number(),
        metrics: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const netProfit = (parseFloat(input.totalRevenue) - parseFloat(input.totalExpenses)).toString();
        const winRate = input.numberOfTrades > 0 
          ? ((input.winningTrades / input.numberOfTrades) * 100).toString()
          : "0";

        await db.createRevenueRecord(ctx.user.id, {
          agentId: input.agentId,
          date: input.date,
          totalRevenue: input.totalRevenue,
          totalExpenses: input.totalExpenses,
          netProfit,
          numberOfTrades: input.numberOfTrades,
          winningTrades: input.winningTrades,
          losingTrades: input.losingTrades,
          winRate,
          roi: "0",
          metrics: input.metrics,
        });
        return { success: true };
      }),
  }),

  // ============= CLAWAI SKILLS ROUTER =============
  skills: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        return await db.getSkillsLogByUserId(ctx.user.id, input.limit);
      }),

    byStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ ctx, input }) => {
        return await db.getSkillsLogByStatus(ctx.user.id, input.status);
      }),

    create: protectedProcedure
      .input(z.object({
        skillName: z.string(),
        skillType: z.enum(["agent_management", "token_distribution", "transaction_monitoring", "revenue_tracking", "task_completion", "other"]),
        taskDescription: z.string().optional(),
        input: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSkillsLog(ctx.user.id, {
          skillName: input.skillName,
          skillType: input.skillType,
          taskDescription: input.taskDescription,
          input: input.input,
          status: "pending",
        });
        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "running", "completed", "failed"]),
        output: z.record(z.string(), z.unknown()).optional(),
        errorMessage: z.string().optional(),
        executionTime: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateSkillsLog(input.id, {
          status: input.status,
          output: input.output,
          errorMessage: input.errorMessage,
          executionTime: input.executionTime,
          completedAt: input.status === "completed" || input.status === "failed" ? new Date() : undefined,
        });
        return { success: true };
      }),
  }),

  // ============= AUTOMATED TASKS ROUTER =============
  tasks: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        return await db.getTasksByUserId(ctx.user.id, input.limit);
      }),

    suggested: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSuggestedTasks(ctx.user.id);
    }),

    byStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ ctx, input }) => {
        return await db.getTasksByStatus(ctx.user.id, input.status);
      }),

    create: protectedProcedure
      .input(z.object({
        taskTitle: z.string(),
        taskDescription: z.string().optional(),
        taskCategory: z.enum(["agent_setup", "token_distribution", "monitoring", "optimization", "other"]),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        suggestedBy: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createAutomatedTask(ctx.user.id, {
          taskTitle: input.taskTitle,
          taskDescription: input.taskDescription,
          taskCategory: input.taskCategory,
          priority: input.priority,
          suggestedBy: input.suggestedBy,
          status: "suggested",
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["suggested", "in_progress", "completed", "failed", "skipped"]).optional(),
        completedBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateAutomatedTask(input.id, {
          status: input.status,
          completedBy: input.completedBy,
          completedAt: input.status === "completed" ? new Date() : undefined,
          startedAt: input.status === "in_progress" ? new Date() : undefined,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
