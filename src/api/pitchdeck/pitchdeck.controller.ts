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
import { join, basename } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { JwtAuthGuard } from '../../core/guard/jwt.auth.guard';
import { ALLOWED_MIMES, MIME_TO_EXT } from './constants/file-types';

const TEMP_UPLOAD_DIR = join(process.cwd(), 'uploads', 'temp');

// Ensure temp directory exists (async, best effort)
// eslint-disable-next-line @typescript-eslint/no-empty-function
fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true }).catch(() => {});

@ApiTags('pitchdeck')
@Controller('pitchdeck')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PitchDeckController {
  private readonly logger = new Logger(PitchDeckController.name);

  constructor(private readonly pitchDeckService: PitchDeckService) {}

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
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: TEMP_UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uuid = uuidv4();
          const ext = MIME_TO_EXT[file.mimetype as any] || 'bin';
          cb(null, `${uuid}.${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
    }),
  )
  async uploadDeck(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 50 * 1024 * 1024 })
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

    // Validate each file
    for (const file of files) {
      // Validate MIME type against whitelist
      if (!ALLOWED_MIMES.includes(file.mimetype as any)) {
        // Cleanup all temp files on validation failure (await to avoid race condition)
        await Promise.allSettled(files.map((f) => fs.unlink(f.path)));
        this.logger.warn(
          `Cleaned up ${files.length} temp files after MIME validation failure`,
        );
        throw new BadRequestException(
          `Invalid file type: ${basename(
            file.originalname,
          )}. Allowed: PDF, PPT, PPTX, DOC, DOCX`,
        );
      }

      // Validate magic number (actual file content)
      const fileBuffer = await fs.readFile(file.path);
      const fileType = await fileTypeFromBuffer(fileBuffer);

      if (!fileType || !ALLOWED_MIMES.includes(fileType.mime as any)) {
        // Cleanup all temp files on validation failure (await to avoid race condition)
        await Promise.allSettled(files.map((f) => fs.unlink(f.path)));
        this.logger.warn(
          `Cleaned up ${files.length} temp files after magic number validation failure`,
        );
        throw new BadRequestException(
          `File content mismatch: ${basename(file.originalname)}`,
        );
      }
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
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PitchDeckResponseDto[]> {
    const ownerId = req.user.sub;
    const decks = await this.pitchDeckService.findByOwner(ownerId, {
      status: status as any,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
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
