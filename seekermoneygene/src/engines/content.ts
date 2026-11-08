export interface ContentPack {
  sourceTitle: string;
  hooks: string[];
  shortAngles: string[];
  threadOutline: string[];
  disclosure: string;
}

export function buildContentPack(sourceTitle: string, coreIdea: string): ContentPack {
  return {
    sourceTitle,
    hooks: [
      "What most people miss about " + coreIdea,
      "A simple system for " + coreIdea + " (no hype)",
      "I rebuilt my approach to " + coreIdea + " — notes",
    ],
    shortAngles: [
      "Problem to framework to one next step",
      "Before / after process (honest constraints)",
      "3 rules I actually follow for " + coreIdea,
    ],
    threadOutline: [
      "1/ Context: why " + coreIdea + " matters now",
      "2/ Constraint: what we refuse to claim",
      "3/ Mechanism: the loop that compounds",
      "4/ Asset: what you own after the work",
      "5/ CTA: value-first resource or waitlist",
    ],
    disclosure: "AI-assisted drafting. Human review required before publish.",
  };
}
