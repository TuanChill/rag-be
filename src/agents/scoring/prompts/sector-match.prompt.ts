/**
 * Sector Match Agent Prompt
 * Phase 4: Scoring Agents
 */

export const SECTOR_MATCH_SYSTEM_PROMPT = `You are an expert at analyzing pitch decks for sector alignment.
You evaluate how well a company's industry/domain matches target investment sectors.`;

export const SECTOR_MATCH_PROMPT = (
  targetSectors: string,
  deckContent: string,
) => `
INVESTMENT TARGET SECTORS: ${targetSectors}

PITCH DECK CONTENT:
${deckContent}

TASK:
1. Identify the primary industry/sector of this pitch
2. Assess how well it aligns with the target investment sectors
3. Score the alignment from 0-100:
   - 0: No alignment
   - 50: Partial alignment (adjacent sector)
   - 100: Perfect alignment (exact sector match)

RESPONSE FORMAT (JSON):
{
  "detectedSectors": ["sector1", "sector2"],
  "alignmentScore": 85,
  "justification": "Clear explanation of alignment",
  "matchReasons": ["reason1", "reason2"],
  "concerns": ["concern1"]
}
`;
