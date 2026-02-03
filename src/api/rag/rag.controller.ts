import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { IngestDocumentDto, QueryDocumentDto, DeleteDocumentDto } from './dto';
import { HttpExceptionFilter } from '@core/filter/http-exception.filter';
import {
  IngestResult,
  QueryResult,
  DeleteResult,
  RagHealthStatus,
} from './types/rag.types';

@ApiTags('rag')
@Controller('rag')
@UseFilters(HttpExceptionFilter)
export class RagController {
  private readonly logger = new Logger(RagController.name);

  constructor(private readonly ragService: RagService) {}

  /**
   * POST /rag/ingest
   * Ingest documents into the vector store
   */
  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest documents into vector store' })
  @ApiResponse({
    status: 201,
    description: 'Documents successfully ingested',
    schema: {
      example: {
        success: true,
        documentIds: ['uuid-1', 'uuid-2'],
        count: 2,
      },
    },
  })
  async ingestDocuments(@Body() dto: IngestDocumentDto): Promise<IngestResult> {
    this.logger.log(`Ingesting documents`);
    return await this.ragService.ingestDocuments(dto.documents);
  }

  /**
   * POST /rag/query
   * Query similar documents from the vector store
   */
  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query similar documents' })
  @ApiResponse({
    status: 200,
    description: 'Query results with similarity scores',
    type: [Object],
  })
  async queryDocuments(@Body() dto: QueryDocumentDto): Promise<QueryResult[]> {
    this.logger.log(`Querying documents`);
    return await this.ragService.queryDocuments(
      dto.query,
      dto.topK,
      dto.filter,
    );
  }

  /**
   * DELETE /rag/documents
   * Delete documents by IDs or filter
   */
  @Delete('documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete documents by IDs or filter' })
  @ApiResponse({
    status: 200,
    description: 'Documents deleted',
    schema: {
      example: {
        success: true,
        deletedCount: 2,
      },
    },
  })
  async deleteDocuments(@Body() dto: DeleteDocumentDto): Promise<DeleteResult> {
    this.logger.log(`Deleting documents`);
    return await this.ragService.deleteDocuments(dto.ids, dto.filter);
  }

  /**
   * GET /rag/health
   * Check health status of RAG service
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check RAG service health' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
    schema: {
      example: {
        status: 'healthy',
        collection: 'documents',
        timestamp: '2026-02-03T10:30:00.000Z',
      },
    },
  })
  async healthCheck(): Promise<RagHealthStatus> {
    return await this.ragService.healthCheck();
  }
}
