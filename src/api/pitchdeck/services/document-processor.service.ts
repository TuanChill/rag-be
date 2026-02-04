import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { promises as fs } from 'fs';
import mammoth from 'mammoth';
import { MimeType } from '../constants/file-types';
import { VisionExtractionService } from './vision-extraction.service';

// pdf-parse doesn't have proper TypeScript types, use require
const pdfParse = require('pdf-parse');

export interface ProcessedDocument {
  text: string;
  metadata: {
    filename: string;
    mimeType: string;
    chunkCount: number;
    totalChars: number;
  };
}

export interface TextChunk {
  text: string;
  metadata: {
    filename: string;
    chunkIndex: number;
    mimeType: string;
  };
}

/**
 * Document Processor Service
 * Handles text extraction and chunking for pitch deck files
 * Uses GPT-4o Vision as fallback for image-only PDFs
 */
@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  // LangChain text splitter for chunking
  private readonly textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  constructor(private readonly visionService: VisionExtractionService) {}

  /**
   * Process a file: extract text and create chunks
   */
  async processFile(
    filePath: string,
    filename: string,
    mimeType: MimeType,
  ): Promise<ProcessedDocument> {
    this.logger.log(`Processing file: ${filename} (${mimeType})`);

    // Extract text based on MIME type
    const text = await this.extractText(filePath, mimeType);

    if (!text || text.trim().length === 0) {
      throw new BadRequestException(
        `No text content found in file: ${filename}`,
      );
    }

    // Validate text length
    if (text.length < 50) {
      throw new BadRequestException(
        `File content too short (${text.length} chars). Minimum: 50 chars.`,
      );
    }

    this.logger.log(`Extracted ${text.length} characters from ${filename}`);

    return {
      text,
      metadata: {
        filename,
        mimeType,
        chunkCount: 0, // Will be updated during chunking
        totalChars: text.length,
      },
    };
  }

  /**
   * Split document into chunks for embedding
   */
  async createChunks(
    document: ProcessedDocument,
    deckUuid: string,
  ): Promise<TextChunk[]> {
    this.logger.log(`Creating chunks for ${document.metadata.filename}`);

    const chunks = await this.textSplitter.splitText(document.text);

    this.logger.log(
      `Created ${chunks.length} chunks from ${document.metadata.filename}`,
    );

    return chunks.map((text, index) => ({
      text,
      metadata: {
        filename: document.metadata.filename,
        chunkIndex: index,
        mimeType: document.metadata.mimeType,
        deckUuid,
      },
    }));
  }

  /**
   * Extract text from file based on MIME type
   */
  private async extractText(
    filePath: string,
    mimeType: MimeType,
  ): Promise<string> {
    const buffer = await fs.readFile(filePath);

    switch (mimeType) {
      case 'application/pdf':
        return await this.extractFromPdf(buffer, filePath);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await this.extractFromDocx(buffer);

      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        // PPT/PPTX not fully supported - return placeholder
        this.logger.warn(
          `PPT/PPTX extraction not fully implemented. Using placeholder.`,
        );
        return await this.extractFromDocx(buffer); // Fallback to docx extraction

      case 'application/msword':
        // DOC (legacy) - try mammoth as fallback
        return await this.extractFromDocx(buffer);

      default:
        throw new BadRequestException(
          `Unsupported MIME type for text extraction: ${mimeType}`,
        );
    }
  }

  /**
   * Extract text from PDF buffer
   * Falls back to GPT-4o Vision if pdf-parse returns empty/insufficient text
   */
  private async extractFromPdf(
    buffer: Buffer,
    filePath: string,
  ): Promise<string> {
    // Try standard pdf-parse first
    try {
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length >= 50) {
        return data.text;
      }
      this.logger.debug('PDF text extraction returned insufficient content');
    } catch (error) {
      this.logger.debug(`pdf-parse failed: ${error.message}`);
    }

    // Fallback to GPT-4o Vision if enabled
    const isVisionEnabled = this.visionService.isEnabled();
    this.logger.debug(
      `[DEBUG] Vision service enabled check: ${isVisionEnabled}`,
    );

    if (isVisionEnabled) {
      this.logger.log('Attempting vision extraction fallback...');
      try {
        const filename = filePath.split('/').pop() || 'document.pdf';
        return await this.visionService.extractTextFromPdf(buffer, filename);
      } catch (visionError) {
        this.logger.error('Vision extraction failed', visionError);
      }
    } else {
      this.logger.warn(
        '[DEBUG] Vision extraction is DISABLED - skipping fallback',
      );
    }

    throw new BadRequestException(
      'Unable to extract text from PDF. Enable vision extraction for image-based documents.',
    );
  }

  /**
   * Extract text from DOCX buffer
   * Also works for some PPT/PPTX files as fallback
   */
  private async extractFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
