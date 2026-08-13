import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { getExecutor } from '../agents/executor';
import {
  checkSubscriptionLimit,
  getTodayUsage,
  trackUsage,
  updateUsage,
} from '../db.subscriptions';

/**
 * Wallet and autonomous agent operations
 */

async function requireAgentExecutionAccess(userId: number) {
  const limit = await checkSubscriptionLimit(userId, 'executions');
  if (!limit.allowed) {
    throw new Error('An active subscription is required, or your daily automated-agent limit has been reached.');
  }

  const usage = await getTodayUsage(userId);
  if (!usage) {
    await trackUsage(userId, {
      date: new Date(),
      agentExecutions: 1,
      apiCalls: 0,
      transactionsProcessed: 0,
      storageUsedMb: '0',
    });
  } else {
    await updateUsage(userId, {
      agentExecutions: (usage.agentExecutions || 0) + 1,
    });
  }

  return {
    current: limit.current + 1,
    limit: limit.limit,
    remaining: Math.max(0, limit.limit - (limit.current + 1)),
  };
}

export const walletRouter = router({
  /**
   * Queue a skill execution for the autonomous agent
   */
  queueSkillExecution: protectedProcedure
    .input(
      z.object({
        skillType: z.enum([
          'agent_management',
          'token_distribution',
          'transaction_monitoring',
          'revenue_tracking',
          'task_completion',
        ]),
        agentId: z.number(),
        parameters: z.record(z.string(), z.unknown()),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: input.skillType,
        agentId: input.agentId,
        userId: ctx.user.id,
        parameters: input.parameters,
        priority: input.priority,
      });

      return {
        success: true,
        executionId,
        message: `Skill execution queued: ${input.skillType}`,
        usage,
      };
    }),

  /**
   * Get execution status
   */
  getExecutionStatus: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ input }) => {
      const executor = await getExecutor();
      const status = await executor.getExecutionStatus(input.executionId);

      if (!status) {
        return {
          found: false,
          message: 'Execution not found',
        };
      }

      return {
        found: true,
        ...status,
      };
    }),

  /**
   * Cancel execution
   */
  cancelExecution: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .mutation(async ({ input }) => {
      const executor = await getExecutor();
      const cancelled = await executor.cancelExecution(input.executionId);

      return {
        success: cancelled,
        message: cancelled ? 'Execution cancelled' : 'Execution not found',
      };
    }),

  /**
   * Get queue status
   */
  getQueueStatus: protectedProcedure.query(async () => {
    const executor = await getExecutor();
    return executor.getQueueStatus();
  }),

  /**
   * Send SOL transaction
   */
  sendSol: protectedProcedure
    .input(
      z.object({
        toAddress: z.string(),
        amount: z.number().positive(),
        agentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      // In a real implementation, this would:
      // 1. Validate the recipient address
      // 2. Check wallet balance
      // 3. Create and sign transaction
      // 4. Submit to blockchain
      // 5. Monitor confirmation

      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      return {
        success: true,
        transactionHash: `tx_${Date.now()}`,
        toAddress: input.toAddress,
        amount: input.amount,
        status: 'pending',
        message: 'Transaction queued for execution',
        usage,
      };
    }),

  /**
   * Transfer tokens
   */
  transferToken: protectedProcedure
    .input(
      z.object({
        toAddress: z.string(),
        amount: z.string(),
        tokenMint: z.string(),
        agentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      // Queue token distribution skill
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'token_distribution',
        agentId: input.agentId || 0,
        userId: ctx.user.id,
        parameters: {
          recipientAddress: input.toAddress,
          amount: input.amount,
          tokenMint: input.tokenMint,
        },
        priority: 'high',
      });

      return {
        success: true,
        executionId,
        toAddress: input.toAddress,
        amount: input.amount,
        tokenMint: input.tokenMint,
        status: 'queued',
        message: 'Token transfer queued',
        usage,
      };
    }),

  /**
   * Get transaction details
   */
  getTransactionDetails: protectedProcedure
    .input(z.object({ transactionHash: z.string() }))
    .query(async ({ input }) => {
      // In a real implementation, this would query the blockchain
      return {
        transactionHash: input.transactionHash,
        status: 'confirmed',
        from: 'wallet_address',
        to: 'recipient_address',
        amount: 0,
        fee: 0,
        timestamp: new Date(),
        confirmations: 32,
      };
    }),

  /**
   * Monitor transaction status
   */
  monitorTransaction: protectedProcedure
    .input(z.object({ transactionHash: z.string() }))
    .query(async ({ input }) => {
      // Queue transaction monitoring skill
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'transaction_monitoring',
        agentId: 0,
        userId: 0,
        parameters: {
          transactionHash: input.transactionHash,
        },
        priority: 'high',
      });

      return {
        transactionHash: input.transactionHash,
        status: 'monitoring',
        executionId,
        message: 'Transaction monitoring started',
      };
    }),

  /**
   * Get wallet balance
   */
  getWalletBalance: protectedProcedure
    .input(z.object({ walletAddress: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // In a real implementation, this would query the blockchain
      return {
        walletAddress: input.walletAddress || 'unknown',
        solBalance: 0,
        tokens: [],
        totalValue: 0,
      };
    }),

  /**
   * Start autonomous agent
   */
  startAutonomousAgent: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'agent_management',
        agentId: input.agentId,
        userId: ctx.user.id,
        parameters: {
          action: 'start',
          agentId: input.agentId,
        },
        priority: 'high',
      });

      return {
        success: true,
        agentId: input.agentId,
        executionId,
        status: 'starting',
        message: 'Agent startup queued',
        usage,
      };
    }),

  /**
   * Stop autonomous agent
   */
  stopAutonomousAgent: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'agent_management',
        agentId: input.agentId,
        userId: ctx.user.id,
        parameters: {
          action: 'stop',
          agentId: input.agentId,
        },
        priority: 'high',
      });

      return {
        success: true,
        agentId: input.agentId,
        executionId,
        status: 'stopping',
        message: 'Agent stop queued',
        usage,
      };
    }),

  /**
   * Calculate revenue metrics
   */
  calculateRevenue: protectedProcedure
    .input(z.object({ period: z.enum(['daily', 'weekly', 'monthly']), agentId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const usage = await requireAgentExecutionAccess(ctx.user.id);
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'revenue_tracking',
        agentId: input.agentId || 0,
        userId: ctx.user.id,
        parameters: {
          period: input.period,
        },
        priority: 'medium',
      });

      return {
        success: true,
        executionId,
        period: input.period,
        status: 'calculating',
        message: 'Revenue calculation queued',
        usage,
      };
    }),

  /**
   * Complete automated task
   */
  completeAutomatedTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const executor = await getExecutor();

      const executionId = await executor.queueSkillExecution({
        skillType: 'task_completion',
        agentId: 0,
        userId: ctx.user.id,
        parameters: {
          taskId: input.taskId,
        },
        priority: 'high',
      });

      return {
        success: true,
        taskId: input.taskId,
        executionId,
        status: 'executing',
        message: 'Task completion queued',
      };
    }),
});
