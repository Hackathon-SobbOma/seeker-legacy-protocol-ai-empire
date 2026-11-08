import type { EthicsVerdict, OfferDraft } from "../types.js";

const BLOCKED_PATTERNS = [
  /guaranteed\s+(income|returns|profit)/i,
  /make\s+\$?\d+[kKmM]?\s*(per|\/)?\s*(day|week|month)/i,
  /passive\s+income\s+overnight/i,
  /no\s+work\s+required/i,
  /get\s+rich\s+quick/i,
  /100%\s+win\s+rate/i,
  /secret\s+method/i,
];
const SUSPICIOUS_CLAIM = /\b(proven|verified|clients made)\b.*\$?\d+/i;

export function runEthicsGate(text: string): EthicsVerdict {
  const reasons: string[] = [];
  for (const re of BLOCKED_PATTERNS) {
    if (re.test(text)) reasons.push("Blocked pattern: " + re.source);
  }
  if (SUSPICIOUS_CLAIM.test(text) && !/example|hypothetical|illustrative/i.test(text)) {
    reasons.push("Unsourced performance claim");
  }
  return { ok: reasons.length === 0, reasons };
}

export function validateOffer(offer: OfferDraft): EthicsVerdict {
  const blob = [offer.name, offer.valueProposition, ...offer.claims].join(" ");
  const base = runEthicsGate(blob);
  if (offer.marginTarget < 0.5) base.reasons.push("Margin target unrealistically low for digital product focus");
  if (offer.claims.length === 0) base.reasons.push("Offer must state at least one concrete value claim");
  return { ok: base.reasons.length === 0, reasons: base.reasons };
}
