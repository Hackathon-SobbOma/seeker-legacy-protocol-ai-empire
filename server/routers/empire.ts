import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getEmpireRun, planEmpire, runEmpire } from "../agents/empire";

const limitsSchema = z
  .object({
    maxGenerationDepth: z.number().int().min(0).max(3).optional(),
    maxTotalAgents: z.number().int().min(1).max(8).optional(),
    maxConcurrentAgents: z.number().int().min(1).max(3).optional(),
    maxTaskRuntimeMs: z.number().int().min(100).max(5000).optional(),
    maxAgentBudgetUsd: z.number().min(0).max(0.25).optional(),
  })
  .optional();

export const empireRouter = router({
  plan: protectedProcedure
    .input(z.object({ goal: z.string().trim().min(8).max(500), limits: limitsSchema }))
    .query(({ input }) => planEmpire(input.goal, input.limits)),

  run: protectedProcedure
    .input(z.object({ goal: z.string().trim().min(8).max(500), limits: limitsSchema }))
    .mutation(({ input }) => runEmpire(input.goal, input.limits)),

  getRun: protectedProcedure
    .input(z.object({ runId: z.string().min(8).max(80) }))
    .query(({ input }) => getEmpireRun(input.runId)),
});
