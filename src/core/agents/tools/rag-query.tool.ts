import { Injectable, Logger } from '@nestjs/common';
import { DynamicTool } from '@langchain/core/tools';
import { RagService } from '@api/rag/rag.service';

/**
 * RAG Query Tool
 * Wraps the existing RAG service as a LangChain tool
 * Used by agents to query pitch deck content for context
 */
@Injectable()
export class RagQueryTool {
  private readonly logger = new Logger(RagQueryTool.name);

  constructor(private readonly ragService: RagService) {}

  /**
   * Create a LangChain DynamicTool for querying pitch deck content
   * @param deckId - The pitch deck UUID to query
   * @returns LangChain tool instance
   */
  createTool(deckId: string): DynamicTool {
    return new DynamicTool({
      name: 'query_pitch_deck',
      description:
        'Query the pitch deck content for relevant information. Use this to find specific details about the deck such as company description, market analysis, financial projections, team background, product details, funding history, and competitive landscape.',
      func: async (query: string) => {
        try {
          this.logger.debug(`RAG query for deck ${deckId}: ${query}`);

          const results = await this.ragService.queryDocuments(query, 5, {
            deckUuid: deckId,
          });

          return JSON.stringify({
            success: true,
            results: results.map((r) => ({
              content: r.pageContent,
              score: r.score,
            })),
            count: results.length,
          });
        } catch (error) {
          this.logger.error('RAG query failed', error);
          return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  }
}
