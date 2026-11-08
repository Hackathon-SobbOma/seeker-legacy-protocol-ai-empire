import { describe, it, expect } from "vitest";
import { runEthicsGate, validateOffer } from "./ethics.js";

describe("ethics gate", () => {
  it("allows value-first language", () => {
    expect(runEthicsGate("Build owned email lists and transparent AI-assisted products").ok).toBe(true);
  });
  it("blocks get-rich-quick patterns", () => {
    const v = runEthicsGate("Guaranteed income $10k per month passive");
    expect(v.ok).toBe(false);
    expect(v.reasons.length).toBeGreaterThan(0);
  });
  it("validates safe offer", () => {
    expect(
      validateOffer({
        name: "Setup",
        priceUsd: 2000,
        marginTarget: 0.9,
        recurring: false,
        valueProposition: "Workflow + ownership of assets",
        claims: ["No revenue guarantees", "You keep the list"],
      }).ok
    ).toBe(true);
  });
});
