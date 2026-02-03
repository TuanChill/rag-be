import {
  Injectable,
  Logger,
  OnModuleDestroy,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AstraDBVectorStore } from '@langchain/community/vectorstores/astradb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import {
  IngestDocument,
  IngestResult,
  QueryResult,
  DeleteResult,
  RagHealthStatus,
} from './types/rag.types';

@Injectable()
export class RagService implements OnModuleDestroy {
  private readonly logger = new Logger(RagService.name);
  private vectorStore: AstraDBVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the vector store and embeddings
   * Called from RagModule.onModuleInit()
   */
  async initialize(): Promise<void> {
    try {
      const astraToken = this.configService.get<string>('astradb.token');
      const astraEndpoint = this.configService.get<string>('astradb.endpoint');
      const collectionName =
        this.configService.get<string>('astradb.collection');
      const openaiApiKey = this.configService.get<string>('openai.apiKey');
      const embeddingModel = this.configService.get<string>(
        'openai.embeddingModel',
      );

      // Validate required configuration
      if (!astraToken || !astraEndpoint) {
        throw new Error('AstraDB token and endpoint are required');
      }
      if (!openaiApiKey) {
        throw new Error('OpenAI API key is required');
      }

      this.logger.log(`Initializing embeddings with model: ${embeddingModel}`);

      // Initialize OpenAI embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: openaiApiKey,
        modelName: embeddingModel || 'text-embedding-ada-002',
      });

      this.logger.log(`Connecting to AstraDB collection: ${collectionName}`);

      // Initialize AstraDB vector store
      this.vectorStore = await AstraDBVectorStore.fromExistingIndex(
        this.embeddings,
        {
          token: astraToken,
          endpoint: astraEndpoint,
          collection: collectionName,
          collectionOptions: {
            vector: {
              dimension: 1536,
              metric: 'cosine',
            },
          },
        },
      );

      this.isInitialized = true;
      this.logger.log('RAG service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize RAG service', error);
      throw error;
    }
  }

  /**
   * Check if service is ready
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.vectorStore) {
      throw new InternalServerErrorException('RAG service not initialized');
    }
  }

  /**
   * Ingest documents into the vector store
   */
  async ingestDocuments(documents: IngestDocument[]): Promise<IngestResult> {
    this.ensureInitialized();

    try {
      if (!documents || documents.length === 0) {
        throw new BadRequestException('No documents provided');
      }

      this.logger.log(`Ingesting documents`);

      // Convert to LangChain Document format
      const langchainDocs = documents.map(
        (doc) =>
          new Document({
            pageContent: doc.pageContent,
            metadata: {
              ...doc.metadata,
              createdAt: new Date().toISOString(),
            },
          }),
      );

      // Add documents to vector store
      // Note: addDocuments returns void, not IDs
      await this.vectorStore.addDocuments(langchainDocs);

      this.logger.log(
        `Successfully ingested ${langchainDocs.length} documents`,
      );

      return {
        success: true,
        documentIds: [], // IDs not returned by AstraDBVectorStore.addDocuments()
        count: langchainDocs.length,
      };
    } catch (error) {
      this.logger.error('Failed to ingest documents', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to ingest documents');
    }
  }

  /**
   * Query similar documents
   */
  async queryDocuments(
    query: string,
    topK = 5,
    filter?: Record<string, unknown>,
  ): Promise<QueryResult[]> {
    this.ensureInitialized();

    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException('Query cannot be empty');
      }

      this.logger.log('Querying documents');

      // Perform similarity search with scores
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        topK,
        filter,
      );

      const queryResults: QueryResult[] = results.map(([doc, score]) => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata as Record<string, unknown>,
        score: score,
      }));

      this.logger.log(`Found ${queryResults.length} matching documents`);

      return queryResults;
    } catch (error) {
      this.logger.error('Failed to query documents', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to query documents');
    }
  }

  /**
   * Delete documents by IDs
   * Note: Filter-based deletion is not supported by AstraDBVectorStore API
   */
  async deleteDocuments(ids?: string[]): Promise<DeleteResult> {
    this.ensureInitialized();

    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestException('IDs must be provided for deletion');
      }

      this.logger.log('Deleting documents');

      // AstraDBVectorStore.delete() only accepts { ids: string[] }
      await this.vectorStore.delete({ ids });

      return {
        success: true,
        deletedCount: ids.length,
      };
    } catch (error) {
      this.logger.error('Failed to delete documents', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete documents');
    }
  }

  /**
   * Health check for the RAG service
   */
  async healthCheck(): Promise<RagHealthStatus> {
    const collection =
      this.configService.get<string>('astradb.collection') || 'unknown';
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'production');

    try {
      if (!this.isInitialized || !this.vectorStore) {
        return {
          status: 'unhealthy',
          collection,
          timestamp: new Date(),
          error: 'Service not initialized',
        };
      }

      // Lightweight check: verify vector store instance exists
      // Actual connectivity verified through initialization success
      // (avoiding expensive similaritySearch on every health check)

      return {
        status: 'healthy',
        collection,
        timestamp: new Date(),
      };
    } catch (error) {
      // Sanitize error messages - don't expose internal details to clients
      this.logger.error('Health check failed', error);

      return {
        status: 'unhealthy',
        collection,
        timestamp: new Date(),
        error:
          nodeEnv === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'Service unavailable',
      };
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Cleaning up RAG service...');
    this.vectorStore = null;
    this.embeddings = null;
    this.isInitialized = false;
  }
}
