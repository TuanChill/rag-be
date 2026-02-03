/**
 * AstraDB Mock
 * Phase 8: Integration Tests
 *
 * Mock for AstraDB vector store
 */

export class MockAstraDBVectorStore {
  async similaritySearchWithScore(query: string, k: number, filter?: any) {
    return [
      [
        {
          pageContent: 'Test deck content about AI platform',
          metadata: { deckId: 'test-deck-id', pageNumber: 1 },
        },
        0.95,
      ],
    ];
  }

  async addDocuments(docs: any[]) {
    return;
  }

  async delete({ ids }: { ids: string[] }) {
    return;
  }
}
