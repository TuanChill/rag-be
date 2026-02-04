export const REPORT_USER_PROMPT = (
  deckContent: string,
  analysisData: string,
  reportType: 'executive' | 'detailed' | 'investor',
) => `
PITCH DECK CONTENT:
${deckContent}

ANALYSIS RESULTS:
${analysisData}

TASK: Generate a ${reportType} report synthesizing the analysis into actionable insights.

${
  reportType === 'executive'
    ? EXECUTIVE_INSTRUCTIONS
    : reportType === 'investor'
    ? INVESTOR_INSTRUCTIONS
    : DETAILED_INSTRUCTIONS
}

OUTPUT FORMAT (JSON):
{
  "title": "Investment Analysis: [Company Name]",
  "executiveSummary": "2-3 paragraph summary...",
  "sections": [
    { "title": "Market Opportunity", "content": "...", "order": 1 },
    { "title": "Team Assessment", "content": "...", "order": 2 },
    ...
  ],
  "recommendations": [
    "Primary recommendation...",
    "Secondary recommendation..."
  ],
  "conclusion": "Final investment thesis paragraph"
}
`;

const EXECUTIVE_INSTRUCTIONS = `
Executive Report Requirements:
- 1-2 pages total
- Focus on key metrics and decision points
- Include go/no-go recommendation
`;

const DETAILED_INSTRUCTIONS = `
Detailed Report Requirements:
- 4-6 pages total
- Deep dive on each analysis category
- Include evidence citations from pitch deck
`;

const INVESTOR_INSTRUCTIONS = `
Investor Report Requirements:
- 2-4 pages total
- Balanced view of opportunities and risks
- Include specific next steps and due diligence recommendations
`;
