import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAirdropContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 99,
    openId: "airdrop-test-user",
    email: "airdrop@seeker.org",
    name: "Airdrop Tester",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("airdropRouter and Ralph loop", () => {
  it("allows configuring an agent hot wallet with spend limits", async () => {
    const { ctx } = createAirdropContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.airdrop.configureWallet({
      walletAddress: "SeekerAgentTest1111111111111111111111111",
      maxPerTxSol: "0.2500",
      requireApproval: true,
      status: "active",
    });

    expect(result).toEqual({ success: true });

    const wallet = await caller.airdrop.getWallet();
    expect(wallet).toMatchObject({
      walletAddress: "SeekerAgentTest1111111111111111111111111",
      maxPerTxSol: "0.2500",
      status: "active",
    });
  });

  it("lists opportunities and seeds sample data", async () => {
    const { ctx } = createAirdropContext();
    const caller = appRouter.createCaller(ctx);

    const opportunities = await caller.airdrop.listOpportunities();
    expect(Array.isArray(opportunities)).toBe(true);
    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities[0]).toHaveProperty("title");
    expect(opportunities[0]).toHaveProperty("estimatedValueUsd");
  });

  it("runs the Ralph loop to queue eligible opportunities for approval", async () => {
    const { ctx } = createAirdropContext();
    const caller = appRouter.createCaller(ctx);

    const loopResult = await caller.airdrop.runRalphLoop();
    expect(loopResult.success).toBe(true);
    expect(typeof loopResult.tasksCreatedCount).toBe("number");

    const tasks = await caller.airdrop.listTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });
});
