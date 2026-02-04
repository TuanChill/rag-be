import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, Reference, wrap } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseService } from '@core/base/base.service';
import { PitchDeck, DeckStatus } from './entities/pitch-deck.entity';
import { DeckChunk } from './entities/deck-chunk.entity';
import { PitchDeckFile, FileStatus } from './entities/pitch-deck-file.entity';
import { UploadDeckDto } from './dto/upload-deck.dto';
import { User } from '../user/entities/user.entity';
import {
  MIME_TO_EXT,
  MimeType,
  MAX_FILES_PER_DECK,
  MAX_TOTAL_SIZE,
  isValidMimeType,
} from './constants/file-types';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class PitchDeckService extends BaseService<PitchDeck> {
  private readonly logger = new Logger(PitchDeckService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads', 'pitchdecks');

  constructor(
    @InjectRepository(PitchDeck)
    private readonly pitchDeckRepository: EntityRepository<PitchDeck>,
    @InjectRepository(DeckChunk)
    private readonly deckChunkRepository: EntityRepository<DeckChunk>,
  ) {
    super(pitchDeckRepository);
    this.ensureUploadDir();
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create upload directory', error);
    }
  }

  private async getDeckUploadDir(deckUuid: string): Promise<string> {
    const dir = join(this.uploadDir, deckUuid);
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }

  /**
   * Upload and store pitch deck files (multi-file support)
   * Phase 03: Multiple files per deck with transaction safety
   */
  async uploadDeck(
    files: Express.Multer.File[],
    dto: UploadDeckDto,
    ownerId: string,
  ): Promise<PitchDeck> {
    // Validation
    if (files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    if (files.length > MAX_FILES_PER_DECK) {
      throw new BadRequestException(
        `Maximum ${MAX_FILES_PER_DECK} files allowed per deck`,
      );
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      throw new BadRequestException('Total size exceeds 500MB limit');
    }

    // Validate each file has a valid MIME type
    for (const file of files) {
      if (!isValidMimeType(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Allowed: PDF, PPT, PPTX, DOC, DOCX`,
        );
      }
    }

    const deckUuid = uuidv4();
    const deckDir = await this.getDeckUploadDir(deckUuid);

    const pitchDeck = this.pitchDeckRepository.create({
      uuid: deckUuid,
      title: dto.title,
      description: dto.description,
      status: 'uploading' as DeckStatus,
      chunkCount: 0,
      astraCollection: 'pitch_decks',
      owner: Reference.createFromPK(User, new ObjectId(ownerId)),
      tags: dto.tags,
      fileCount: files.length,
      lastAccessedAt: new Date(),
    });

    try {
      this.logger.log(
        `Uploading pitch deck: ${dto.title} with ${files.length} files for user: ${ownerId}`,
      );

      // Process each file (MIME type validated above, safe to cast)
      for (const file of files) {
        const fileUuid = uuidv4();
        const safeExtension = MIME_TO_EXT[file.mimetype] || 'bin';
        const storageFileName = `${fileUuid}.${safeExtension}`;
        const storagePath = join(deckDir, storageFileName);

        // Move from temp to deck directory
        await fs.rename(file.path, storagePath);

        const deckFile = this.em.create(PitchDeckFile, {
          uuid: fileUuid,
          originalFileName: file.originalname,
          mimeType: file.mimetype as MimeType, // Validated by isValidMimeType above
          fileSize: file.size,
          storagePath,
          status: 'ready' as FileStatus,
          deck: pitchDeck,
        });

        pitchDeck.files.add(deckFile);
      }

      pitchDeck.status = 'ready' as DeckStatus;
      await this.em.persist(pitchDeck).flush();

      this.logger.log(
        `Pitch deck uploaded successfully: ${deckUuid} with ${files.length} files`,
      );

      return pitchDeck;
    } catch (error) {
      this.logger.error('Failed to upload pitch deck', error);

      // Cleanup: remove deck directory
      try {
        await fs.rm(deckDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn('Failed to cleanup deck directory', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Find pitch deck by UUID with ownership check
   */
  async findByUuid(uuid: string, ownerId: string): Promise<PitchDeck | null> {
    return await this.pitchDeckRepository.findOne(
      { uuid, owner: new ObjectId(ownerId) },
      { populate: ['chunks', 'files'] },
    );
  }

  /**
   * List all pitch decks for a user
   */
  async findByOwner(
    ownerId: string,
    options?: { status?: DeckStatus; limit?: number; offset?: number },
  ): Promise<PitchDeck[]> {
    const where: any = { owner: new ObjectId(ownerId) };
    if (options?.status) {
      where.status = options.status;
    }

    return await this.pitchDeckRepository.find(where, {
      limit: options?.limit,
      offset: options?.offset,
      orderBy: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete pitch deck with ownership validation
   * Phase 03: Deletes deck directory containing all files
   */
  async deleteDeck(uuid: string, ownerId: string): Promise<void> {
    const deck = await this.findByUuid(uuid, ownerId);
    if (!deck) {
      throw new NotFoundException('Pitch deck not found or access denied');
    }

    this.logger.log(`Deleting pitch deck: ${uuid}`);

    // Delete entire deck directory from disk
    const deckDir = join(this.uploadDir, uuid);
    try {
      await fs.rm(deckDir, { recursive: true, force: true });
      this.logger.log(`Deleted deck directory: ${deckDir}`);
    } catch (error) {
      this.logger.warn(`Failed to delete deck directory: ${deckDir}`, error);
    }

    // Delete chunks from database
    await this.deckChunkRepository.nativeDelete({ deck: deck._id });

    // Delete entity (cascade will delete PitchDeckFile entities from database)
    await this.em.remove(deck).flush();

    this.logger.log(`Pitch deck deleted: ${uuid}`);
  }

  /**
   * Update last accessed time
   */
  async updateLastAccessed(uuid: string, ownerId: string): Promise<void> {
    const deck = await this.findByUuid(uuid, ownerId);
    if (deck) {
      deck.lastAccessedAt = new Date();
      await this.em.flush();
    }
  }
}
