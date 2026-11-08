import type { OmegaTickResult } from "../types.js";
import { OmegaMemory } from "./memory.js";
import { runRoleCycle } from "./agents.js";

export class SeekerOmega {
  private tickCount = 0;
  readonly memory = new OmegaMemory();

  tick(): OmegaTickResult {
    this.tickCount += 1;
    const actions = runRoleCycle();
    let blocked = 0;
    let writes = 0;
    for (const action of actions) {
      if (!action.ethicsPassed) {
        blocked += 1;
        continue;
      }
      this.memory.write(
        "agent_action",
        { role: action.role, intent: action.intent, requiresApproval: action.requiresApproval },
        [action.role, action.priority]
      );
      writes += 1;
      action.result = action.requiresApproval ? "Queued for human review" : "Accepted into loop";
    }
    return {
      tick: this.tickCount,
      timestamp: new Date().toISOString(),
      actions,
      memoryWrites: writes,
      blockedByEthics: blocked,
      summary:
        "Tick " +
        this.tickCount +
        ": " +
        writes +
        " actions stored, " +
        blocked +
        " blocked by ethics, memory size " +
        this.memory.size(),
    };
  }

  status() {
    return {
      ticks: this.tickCount,
      memoryRecords: this.memory.size(),
      recent: this.memory.list("agent_action").slice(-5),
    };
  }
}
