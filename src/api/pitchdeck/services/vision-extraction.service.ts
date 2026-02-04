import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

const execFileAsync = promisify(execFile);

/** Maximum PDF size for vision extraction (20MB - OpenAI Vision API limit) */
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

/** Maximum pages to process (to avoid excessive API calls) */
const MAX_PAGES_TO_PROCESS = 50;

/** Image DPI for PDF rendering (higher = better quality but larger files) */
const PDF_RENDER_DPI = 150;

/**
 * Vision Extraction Service
 * Uses OpenAI GPT-4o Vision to extract text from image-based PDFs
 * Converts PDF pages to images using pdftoppm (poppler) before sending to Vision API
 */
@Injectable()
export class VisionExtractionService {
  private readonly logger = new Logger(VisionExtractionService.name);
  private chatModel: ChatOpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    // Log config at startup for debugging
    const visionConfig = this.configService.get('vision');
    this.logger.log(
      `[STARTUP] Vision config loaded: ${JSON.stringify(visionConfig)}`,
    );
  }

  /**
   * Lazy-initialize ChatOpenAI model with vision capabilities
   */
  private getChatModel(): ChatOpenAI {
    if (!this.chatModel) {
      this.chatModel = new ChatOpenAI({
        openAIApiKey: this.configService.get<string>('openai.apiKey'),
        modelName: this.configService.get<string>('vision.model') || 'gpt-4o',
        maxTokens: this.configService.get<number>('vision.maxTokens') || 4096,
        temperature: 0.1,
      });
    }
    return this.chatModel;
  }

  /**
   * Check if vision extraction is enabled via config
   */
  isEnabled(): boolean {
    const visionConfig = this.configService.get('vision');
    const enabled = visionConfig?.enabled;
    this.logger.debug(
      `[DEBUG] vision config: ${JSON.stringify(
        visionConfig,
      )}, enabled: ${enabled} (type: ${typeof enabled})`,
    );
    return enabled === true;
  }

  /**
   * Convert PDF buffer to array of base64 PNG images using pdftoppm (poppler)
   * Requires poppler to be installed: brew install poppler
   */
  private async convertPdfToImages(buffer: Buffer): Promise<string[]> {
    // Create temp directory for processing
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-vision-'));
    const pdfPath = path.join(tempDir, 'input.pdf');
    const outputPrefix = path.join(tempDir, 'page');

    try {
      // Write PDF buffer to temp file
      await fs.writeFile(pdfPath, buffer);

      // Get page count using pdfinfo
      let numPages: number;
      try {
        const { stdout } = await execFileAsync('pdfinfo', [pdfPath]);
        const pagesMatch = stdout.match(/Pages:\s+(\d+)/);
        numPages = pagesMatch ? parseInt(pagesMatch[1], 10) : 1;
      } catch {
        // Fallback: assume we can process at least some pages
        numPages = MAX_PAGES_TO_PROCESS;
      }

      this.logger.log(`PDF has ${numPages} pages`);

      // Limit pages to avoid excessive API calls
      const lastPage = Math.min(numPages, MAX_PAGES_TO_PROCESS);
      if (numPages > MAX_PAGES_TO_PROCESS) {
        this.logger.warn(
          `PDF has ${numPages} pages, processing only first ${MAX_PAGES_TO_PROCESS}`,
        );
      }

      // Convert PDF to PNG images using pdftoppm
      await execFileAsync('pdftoppm', [
        '-png',
        '-r',
        PDF_RENDER_DPI.toString(),
        '-l',
        lastPage.toString(), // Last page to convert
        pdfPath,
        outputPrefix,
      ]);

      // Read generated image files
      const files = await fs.readdir(tempDir);
      const imageFiles = files
        .filter((f) => f.startsWith('page-') && f.endsWith('.png'))
        .sort((a, b) => {
          // Sort by page number (page-01.png, page-02.png, etc.)
          const numA = parseInt(a.match(/page-(\d+)/)?.[1] || '0', 10);
          const numB = parseInt(b.match(/page-(\d+)/)?.[1] || '0', 10);
          return numA - numB;
        });

      const images: string[] = [];
      for (const imageFile of imageFiles) {
        const imagePath = path.join(tempDir, imageFile);
        const imageBuffer = await fs.readFile(imagePath);
        const base64 = imageBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;
        images.push(dataUrl);
      }

      this.logger.log(`Converted ${images.length} pages to images`);
      return images;
    } finally {
      // Cleanup temp directory
      try {
        const files = await fs.readdir(tempDir);
        for (const file of files) {
          await fs.unlink(path.join(tempDir, file));
        }
        await fs.rmdir(tempDir);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Extract text from a single image using GPT-4o Vision
   */
  private async extractTextFromImage(
    imageDataUrl: string,
    pageNum: number,
  ): Promise<string> {
    const message = new HumanMessage({
      content: [
        {
          type: 'text',
          text: `Extract ALL text content from this PDF page (page ${pageNum}).
Include: headings, bullet points, paragraphs, captions, and any visible text.
Format the output as clean, readable text preserving the document structure.
If there are charts or graphs, describe their key data points.
Focus on extracting complete content, not just a summary.`,
        },
        {
          type: 'image_url',
          image_url: { url: imageDataUrl },
        },
      ],
    });

    const response = await this.getChatModel().invoke([message]);
    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
  }

  /**
   * Extract text from PDF buffer using GPT-4o Vision
   * Converts PDF to images first, then sends each image to vision model
   */
  async extractTextFromPdf(buffer: Buffer, filename: string): Promise<string> {
    if (!this.isEnabled()) {
      throw new Error('Vision extraction is disabled');
    }

    // Validate buffer size (OpenAI Vision API limit: 20MB)
    if (buffer.length > MAX_PDF_SIZE_BYTES) {
      throw new BadRequestException(
        `PDF too large for vision extraction (${Math.round(
          buffer.length / 1024 / 1024,
        )}MB). Maximum: 20MB.`,
      );
    }

    this.logger.log(`Extracting text via GPT-4o Vision from: ${filename}`);

    // Convert PDF to images
    const imageDataUrls = await this.convertPdfToImages(buffer);

    if (imageDataUrls.length === 0) {
      throw new BadRequestException('PDF has no pages to extract');
    }

    this.logger.log(
      `Processing ${imageDataUrls.length} pages via GPT-4o Vision`,
    );

    // Extract text from each page sequentially to avoid rate limits
    const pageTexts: string[] = [];
    for (let i = 0; i < imageDataUrls.length; i++) {
      const pageNum = i + 1;
      this.logger.debug(`Processing page ${pageNum}/${imageDataUrls.length}`);

      try {
        const text = await this.extractTextFromImage(imageDataUrls[i], pageNum);
        pageTexts.push(`--- Page ${pageNum} ---\n${text}`);
      } catch (error) {
        this.logger.warn(`Failed to extract page ${pageNum}: ${error.message}`);
        // Continue with other pages even if one fails
      }
    }

    if (pageTexts.length === 0) {
      throw new BadRequestException('Failed to extract text from any PDF page');
    }

    const fullText = pageTexts.join('\n\n');
    this.logger.log(
      `Extracted ${fullText.length} chars via vision from ${filename} (${pageTexts.length} pages)`,
    );

    return fullText;
  }
}
