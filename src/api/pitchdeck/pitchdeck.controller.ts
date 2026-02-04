import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PitchDeckService } from './pitchdeck.service';
import { UploadDeckDto } from './dto/upload-deck.dto';
import { PitchDeckResponseDto } from './dto/pitch-deck-response.dto';
import { diskStorage } from 'multer';
import { join } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { JwtAuthGuard } from '../../core/guard/jwt.auth.guard';
import {
  ALLOWED_MIMES,
  MIME_TO_EXT,
  isValidMimeType,
  MAX_FILES_PER_DECK,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
} from './constants/file-types';
import { DeckStatus } from './entities/pitch-deck.entity';

const TEMP_UPLOAD_DIR = join(process.cwd(), 'uploads', 'temp');

@ApiTags('pitchdeck')
@Controller('pitchdeck')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PitchDeckController implements OnModuleInit {
  private readonly logger = new Logger(PitchDeckController.name);

  constructor(private readonly pitchDeckService: PitchDeckService) {}

  async onModuleInit(): Promise<void> {
    try {
      await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
      this.logger.log(`Temp upload directory ready: ${TEMP_UPLOAD_DIR}`);
    } catch (error) {
      this.logger.error('Failed to create temp upload directory', error);
    }
  }

  /**
   * Sanitize filename to prevent log injection and XSS
   * Removes special characters, limits length
   */
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^\w\s.-]/gi, '').substring(0, 50);
  }

  /**
   * Cleanup temp files with proper error handling
   * Awaits all operations to prevent race conditions
   */
  private async cleanupFiles(
    files: Express.Multer.File[],
  ): Promise<{ cleaned: number; failed: number }> {
    const results = await Promise.allSettled(
      files.map(async (f) => {
        try {
          await fs.unlink(f.path);
        } catch (err) {
          this.logger.warn(`Failed to cleanup ${f.path}`, err);
          throw err;
        }
      }),
    );

    const cleaned = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    if (failed > 0) {
      this.logger.warn(
        `Cleanup: ${cleaned}/${files.length} files removed, ${failed} failed`,
      );
    }

    return { cleaned, failed };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a pitch deck with multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Pitch deck uploaded successfully',
    type: PitchDeckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_DECK, {
      storage: diskStorage({
        destination: TEMP_UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uuid = uuidv4();
          const ext = MIME_TO_EXT[file.mimetype] || 'bin';
          cb(null, `${uuid}.${ext}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadDeck(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE })
        .build({
          errorHttpStatusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          exceptionFactory: () =>
            new BadRequestException('File size exceeds 50MB limit'),
        }),
    )
    files: Express.Multer.File[],
    @Body() dto: UploadDeckDto,
    @Request() req: { user: { sub: string } },
  ): Promise<PitchDeckResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Pre-validate total size before expensive magic number checks
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      await this.cleanupFiles(files);
      throw new BadRequestException('Total size exceeds 500MB limit');
    }

    // Validate each file's magic number (actual file content)
    const validationResults = await Promise.all(
      files.map(async (file) => {
        const fileBuffer = await fs.readFile(file.path);
        const fileType = await fileTypeFromBuffer(fileBuffer);
        return { file, fileType };
      }),
    );

    const failedFile = validationResults.find(
      ({ fileType }) => !fileType || !isValidMimeType(fileType.mime),
    );

    if (failedFile) {
      await this.cleanupFiles(files);
      this.logger.warn(
        `Magic number validation failed for file type: ${
          failedFile.fileType?.mime || 'unknown'
        }`,
      );
      throw new BadRequestException(
        'Invalid file type. Allowed: PDF, PPT, PPTX, DOC, DOCX',
      );
    }

    const ownerId = req.user.sub;
    const pitchDeck = await this.pitchDeckService.uploadDeck(
      files,
      dto,
      ownerId,
    );

    return PitchDeckResponseDto.fromEntity(
      pitchDeck,
      await pitchDeck.files.loadItems(),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all pitch decks for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of pitch decks',
    type: [PitchDeckResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listDecks(
    @Request() req: { user: { sub: string } },
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<PitchDeckResponseDto[]> {
    const ownerId = req.user.sub;

    // Validate status parameter if provided
    const validStatuses: DeckStatus[] = [
      'uploading',
      'processing',
      'ready',
      'error',
    ];
    let parsedStatus: DeckStatus | undefined;
    if (status) {
      if (!validStatuses.includes(status as DeckStatus)) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        );
      }
      parsedStatus = status as DeckStatus;
    }

    // Parse and validate limit
    let parsedLimit: number | undefined;
    if (limit) {
      parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
    }

    // Parse and validate offset
    let parsedOffset: number | undefined;
    if (offset) {
      parsedOffset = parseInt(offset, 10);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        throw new BadRequestException('Offset must be a non-negative number');
      }
    }

    const decks = await this.pitchDeckService.findByOwner(ownerId, {
      status: parsedStatus,
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return decks.map((deck) =>
      PitchDeckResponseDto.fromEntity(deck, deck.files.getItems()),
    );
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get a pitch deck by UUID' })
  @ApiResponse({
    status: 200,
    description: 'Pitch deck details',
    type: PitchDeckResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pitch deck not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDeck(
    @Param('uuid') uuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<PitchDeckResponseDto> {
    const ownerId = req.user.sub;
    await this.pitchDeckService.updateLastAccessed(uuid, ownerId);

    const deck = await this.pitchDeckService.findByUuid(uuid, ownerId);
    if (!deck) {
      throw new BadRequestException('Pitch deck not found');
    }

    return PitchDeckResponseDto.fromEntity(deck, deck.files.getItems());
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Delete a pitch deck' })
  @ApiResponse({ status: 204, description: 'Pitch deck deleted' })
  @ApiResponse({ status: 404, description: 'Pitch deck not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteDeck(
    @Param('uuid') uuid: string,
    @Request() req: { user: { sub: string } },
  ): Promise<{ success: boolean }> {
    const ownerId = req.user.sub;
    await this.pitchDeckService.deleteDeck(uuid, ownerId);
    return { success: true };
  }
}
