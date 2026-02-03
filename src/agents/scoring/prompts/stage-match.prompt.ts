/**
 * Stage Match Agent Prompt
 * Phase 4: Scoring Agents
 */

export const STAGE_MATCH_SYSTEM_PROMPT = `You are an expert at evaluating startup funding stages.
You analyze traction, revenue, team size, and product maturity to determine funding stage fit.`;

export const STAGE_MATCH_PROMPT = (
  targetStages: string,
  deckContent: string,
) => `
TARGET STAGES: ${targetStages}

PITCH DECK CONTENT:
${deckContent}

TASK:
1. Identify the current stage of this startup
2. Assess fit with target investment stages
3. Consider: traction, revenue, team size, product maturity

STAGE GUIDELINES:
- Pre-seed: Idea/prototype, < $100k revenue, 1-3 founders
- Seed: MVP launched, < $1M revenue, 3-10 team
- Series A: Product-market fit, < $10M revenue, 10-50 team
- Series B: Scaling, $10-50M revenue, 50-150 team
- Series C+: Expansion, $50M+ revenue, 150+ team

RESPONSE FORMAT (JSON):
{
  "detectedStage": "Seed",
  "alignmentScore": 90,
  "justification": "Clear explanation of stage fit",
  "metrics": {
    "traction": "...",
    "revenue": "...",
    "teamSize": 8
  }
}
`;
