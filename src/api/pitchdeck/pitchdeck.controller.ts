import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

// Map MIME types to safe file extensions (prevents path traversal)
const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'pptx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

const TEMP_UPLOAD_DIR = join(process.cwd(), 'uploads', 'temp');

// Ensure temp directory exists
// eslint-disable-next-line @typescript-eslint/no-empty-function
fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true }).catch(() => {});

@ApiTags('pitchdeck')
@Controller('pitchdeck')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PitchDeckController {
  constructor(private readonly pitchDeckService: PitchDeckService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a pitch deck file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Pitch deck uploaded successfully',
    type: PitchDeckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('deck', {
      storage: diskStorage({
        destination: TEMP_UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uuid = uuidv4();
          const ext = MIME_TO_EXT[file.mimetype] || 'bin';
          cb(null, `${uuid}.${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async uploadDeck(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 50 * 1024 * 1024 })
        .build({
          errorHttpStatusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          exceptionFactory: () =>
            new BadRequestException('File size exceeds 50MB limit'),
        }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDeckDto,
    @Request() req: { user: { sub: string } },
  ): Promise<PitchDeckResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate MIME type against whitelist
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      // Cleanup temp file on validation failure
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.unlink(file.path).catch(() => {});
      throw new BadRequestException(
        `Invalid file type. Allowed types: PDF, PPT, PPTX, DOC, DOCX`,
      );
    }

    // Validate magic number (actual file content)
    const fileBuffer = await fs.readFile(file.path);
    const fileType = await fileTypeFromBuffer(fileBuffer);

    if (!fileType || !ALLOWED_MIMES.has(fileType.mime)) {
      // Cleanup temp file on validation failure
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.unlink(file.path).catch(() => {});
      throw new BadRequestException(
        'File content does not match expected format',
      );
    }

    const ownerId = req.user.sub;
    const pitchDeck = await this.pitchDeckService.uploadDeck(
      file,
      dto,
      ownerId,
    );

    return PitchDeckResponseDto.fromEntity(pitchDeck);
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

    return decks.map((deck) => PitchDeckResponseDto.fromEntity(deck));
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

    return PitchDeckResponseDto.fromEntity(deck);
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
