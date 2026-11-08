#!/usr/bin/env node
import { SeekerOmega } from "./core/omega.js";
import { runOrchestrationDemo } from "./engines/orchestration.js";

const omega = new SeekerOmega();
console.log("=".repeat(56));
console.log("  SEEKER OMEGA · Seekermoneygene");
console.log("  Ethical agent loop · demo tick");
console.log("=".repeat(56));

const result = runOrchestrationDemo(omega);
console.log("\n-> Tick summary:");
console.log(" ", result.tick.summary);
console.log("\n-> Actions:");
for (const a of result.tick.actions) {
  const flag = a.ethicsPassed ? (a.requiresApproval ? "REVIEW" : "OK") : "BLOCK";
  console.log("  [" + flag + "] " + a.role.padEnd(12) + " " + a.intent.slice(0, 60));
}
console.log("\n-> Content pack hooks:");
result.contentPack.hooks.forEach((h, i) => console.log("  " + (i + 1) + ". " + h));
console.log("\n-> Monetization sample:");
console.log("  Offer:", result.monetizationSample.offer.name);
console.log("  Valid:", result.monetizationSample.ok);
if (!result.monetizationSample.ok) {
  console.log("  Reasons:", result.monetizationSample.reasons.join("; "));
}
console.log("\n-> Memory records:", result.status.memoryRecords);
console.log("\nDone. Wire LLM providers or seeker-legacy worker when ready.\n");
