/**
 * Pitch Deck Test Fixtures
 * Phase 8: Integration Tests
 *
 * Test data for pitch deck analysis
 */

export const mockPitchDeckData = {
  uuid: 'test-deck-uuid',
  title: 'Test Startup Pitch',
  description: 'A revolutionary AI-powered platform',
  originalFileName: 'test-deck.pdf',
  mimeType: 'application/pdf' as const,
  fileSize: 1024000,
  storagePath: '/uploads/test/test-deck.pdf',
  status: 'ready' as const,
  chunkCount: 10,
  astraCollection: 'test_pitch_decks',
  tags: ['ai', 'saas', 'enterprise'],
};

export const mockDeckContent = `
# Team
Founders with 10+ years experience in AI and enterprise software.
Previous exits at Fortune 500 companies.

# Product
AI-powered platform that automates enterprise workflows.
Proprietary LLM fine-tuned for business processes.

# Market
$50B TAM in enterprise automation.
Growing at 25% CAGR.

# Traction
$500K ARR in 6 months.
15 enterprise customers.
Team of 12 engineers.
`.trim();

export const createMockPitchDeck = (ownerId: string) => ({
  ...mockPitchDeckData,
  owner: ownerId,
});
