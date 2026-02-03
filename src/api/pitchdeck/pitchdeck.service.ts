import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, Reference, wrap } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { BaseService } from '@core/base/base.service';
import { PitchDeck, DeckStatus } from './entities/pitch-deck.entity';
import { DeckChunk } from './entities/deck-chunk.entity';
import { UploadDeckDto } from './dto/upload-deck.dto';
import { User } from '../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join, extname } from 'path';

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

  /**
   * Upload and store pitch deck file
   * Phase 1: Storage only - file persistence without processing
   */
  async uploadDeck(
    file: Express.Multer.File,
    dto: UploadDeckDto,
    ownerId: string,
  ): Promise<PitchDeck> {
    // Use file from disk storage (controller saves to temp first)
    const tempPath = file.path;
    if (!tempPath) {
      throw new Error('File path not provided by multer');
    }

    // Generate safe storage path with validated extension
    const uuid = uuidv4();
    const safeExtension = MIME_TO_EXT[file.mimetype] || 'bin';
    const storageFileName = `${uuid}.${safeExtension}`;
    const storagePath = join(this.uploadDir, storageFileName);

    let pitchDeck: PitchDeck | null = null;

    try {
      this.logger.log(
        `Uploading pitch deck: ${dto.title} for user: ${ownerId}`,
      );

      // Move file from temp to final location
      await fs.rename(tempPath, storagePath);

      // Create PitchDeck entity with user reference
      pitchDeck = this.pitchDeckRepository.create({
        uuid,
        title: dto.title,
        description: dto.description,
        originalFileName: file.originalname,
        mimeType: file.mimetype as PitchDeck['mimeType'],
        fileSize: file.size,
        storagePath,
        status: 'uploading' as DeckStatus,
        chunkCount: 0,
        astraCollection: 'pitch_decks',
        owner: Reference.createFromPK(User, new ObjectId(ownerId)),
        tags: dto.tags,
        lastAccessedAt: new Date(),
      });

      await this.em.persist(pitchDeck).flush();

      this.logger.log(`Pitch deck uploaded successfully: ${uuid}`);

      return pitchDeck;
    } catch (error) {
      this.logger.error('Failed to upload pitch deck', error);

      // Cleanup: remove moved file if database operation failed
      if (pitchDeck) {
        try {
          await fs.unlink(storagePath);
        } catch (unlinkError) {
          this.logger.warn('Failed to cleanup file after error', unlinkError);
        }
      } else {
        // Restore temp file if move failed
        try {
          await fs.rename(tempPath, storagePath);
        } catch (restoreError) {
          this.logger.warn('Failed to restore temp file', restoreError);
        }
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
      { populate: ['chunks'] },
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
   */
  async deleteDeck(uuid: string, ownerId: string): Promise<void> {
    const deck = await this.findByUuid(uuid, ownerId);
    if (!deck) {
      throw new NotFoundException('Pitch deck not found or access denied');
    }

    this.logger.log(`Deleting pitch deck: ${uuid}`);

    // Delete file from disk
    try {
      await fs.unlink(deck.storagePath);
    } catch (error) {
      this.logger.warn(`Failed to delete file: ${deck.storagePath}`, error);
    }

    // Delete chunks
    await this.deckChunkRepository.nativeDelete({ deck: deck._id });

    // Delete entity
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
