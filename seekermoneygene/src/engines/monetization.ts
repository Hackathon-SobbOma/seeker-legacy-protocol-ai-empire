import type { OfferDraft } from "../types.js";
import { validateOffer } from "../core/ethics.js";

export function draftOffer(input: {
  name: string;
  priceUsd: number;
  recurring: boolean;
  valueProposition: string;
  claims: string[];
}): { offer: OfferDraft; ok: boolean; reasons: string[] } {
  const offer: OfferDraft = { ...input, marginTarget: 0.9 };
  const verdict = validateOffer(offer);
  return { offer, ok: verdict.ok, reasons: verdict.reasons };
}

export const EXAMPLE_SAFE_OFFER = draftOffer({
  name: "SEEKER Content Matrix Setup",
  priceUsd: 2500,
  recurring: false,
  valueProposition:
    "Done-with-you setup of long-form to short repurposing pipeline with approval gates and disclosure templates.",
  claims: [
    "Includes documented workflow and ethics checklist",
    "You retain full ownership of lists and assets",
    "No revenue guarantees — outcomes depend on execution",
  ],
});
