import { Test, TestingModule } from '@nestjs/testing';
import { PitchDeckService } from './pitchdeck.service';
import { EntityRepository } from '@mikro-orm/core';
import { PitchDeck, DeckStatus } from './entities/pitch-deck.entity';
import { DeckChunk } from './entities/deck-chunk.entity';
import { User } from '../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from '@mikro-orm/mongodb';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock the BaseService to avoid complex MikroORM dependencies
jest.mock('fs');

describe('PitchDeckService', () => {
  let service: PitchDeckService;
  let pitchDeckRepository: EntityRepository<PitchDeck>;
  let deckChunkRepository: EntityRepository<DeckChunk>;

  const mockOwner = {
    _id: new ObjectId(),
    username: 'testuser',
  } as User;

  const mockPitchDeck = {
    id: 'test-id',
    uuid: 'test-uuid',
    title: 'Test Pitch Deck',
    description: 'Test description',
    originalFileName: 'test.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    storagePath: '/uploads/pitchdecks/test-uuid.pdf',
    status: 'uploading' as DeckStatus,
    chunkCount: 0,
    astraCollection: 'pitch_decks',
    owner: mockOwner,
    tags: ['test'],
    lastAccessedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PitchDeck;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PitchDeckService,
        {
          provide: EntityRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            nativeDelete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: EntityRepository,
          useValue: {
            nativeDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PitchDeckService>(PitchDeckService);
    pitchDeckRepository =
      module.get<EntityRepository<PitchDeck>>(EntityRepository);
    deckChunkRepository =
      module.get<EntityRepository<DeckChunk>>(EntityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDeck', () => {
    it('should upload and store pitch deck file', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      const dto = {
        title: 'Test Pitch Deck',
        description: 'Test description',
        tags: ['test'],
      };

      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
      pitchDeckRepository.create = jest.fn().mockReturnValue(mockPitchDeck);

      const result = await service.uploadDeck(
        mockFile,
        dto,
        mockOwner._id.toString(),
      );

      expect(result).toEqual(mockPitchDeck);
      expect(fs.mkdir).toHaveBeenCalledWith(
        join(process.cwd(), 'uploads', 'pitchdecks'),
        { recursive: true },
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        mockFile.buffer,
      );
      expect(pitchDeckRepository.create).toHaveBeenCalledWith({
        uuid: expect.any(String),
        title: dto.title,
        description: dto.description,
        originalFileName: mockFile.originalname,
        mimeType: mockFile.mimetype as PitchDeck['mimeType'],
        fileSize: mockFile.size,
        storagePath: expect.any(String),
        status: 'uploading',
        chunkCount: 0,
        astraCollection: 'pitch_decks',
        owner: expect.any(Object),
        tags: dto.tags,
        lastAccessedAt: expect.any(Date),
      });
    });
  });

  describe('findByUuid', () => {
    it('should find pitch deck by UUID with ownership check', async () => {
      const uuid = 'test-uuid';
      jest
        .spyOn(pitchDeckRepository, 'findOne')
        .mockResolvedValue(mockPitchDeck);

      const result = await service.findByUuid(uuid, mockOwner._id.toString());

      expect(result).toEqual(mockPitchDeck);
      expect(pitchDeckRepository.findOne).toHaveBeenCalledWith(
        { uuid, owner: mockOwner._id },
        { populate: ['chunks'] },
      );
    });

    it('should return null when pitch deck not found', async () => {
      const uuid = 'non-existent-uuid';
      jest.spyOn(pitchDeckRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findByUuid(uuid, mockOwner._id.toString());

      expect(result).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('should list all pitch decks for a user', async () => {
      const ownerId = mockOwner._id.toString();
      const options = { status: 'ready' as DeckStatus, limit: 10, offset: 0 };
      jest
        .spyOn(pitchDeckRepository, 'find')
        .mockResolvedValue([mockPitchDeck]);

      const result = await service.findByOwner(ownerId, options);

      expect(result).toEqual([mockPitchDeck]);
      expect(pitchDeckRepository.find).toHaveBeenCalledWith(
        { owner: mockOwner._id, status: 'ready' },
        {
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'DESC' },
        },
      );
    });

    it('should list all pitch decks without status filter', async () => {
      const ownerId = mockOwner._id.toString();
      jest
        .spyOn(pitchDeckRepository, 'find')
        .mockResolvedValue([mockPitchDeck]);

      const result = await service.findByOwner(ownerId);

      expect(result).toEqual([mockPitchDeck]);
      expect(pitchDeckRepository.find).toHaveBeenCalledWith(
        { owner: mockOwner._id },
        {
          orderBy: { createdAt: 'DESC' },
        },
      );
    });
  });

  describe('deleteDeck', () => {
    it('should delete pitch deck with ownership validation', async () => {
      const uuid = 'test-uuid';
      jest.spyOn(service, 'findByUuid').mockResolvedValue(mockPitchDeck);
      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
      jest.spyOn(deckChunkRepository, 'nativeDelete').mockResolvedValue(1);

      await service.deleteDeck(uuid, mockOwner._id.toString());

      expect(service['findByUuid']).toHaveBeenCalledWith(
        uuid,
        mockOwner._id.toString(),
      );
      expect(fs.unlink).toHaveBeenCalledWith(mockPitchDeck.storagePath);
      expect(deckChunkRepository.nativeDelete).toHaveBeenCalledWith({
        deck: mockPitchDeck._id,
      });
    });

    it('should throw NotFoundException when pitch deck not found', async () => {
      const uuid = 'non-existent-uuid';
      jest.spyOn(service, 'findByUuid').mockResolvedValue(null);

      await expect(
        service.deleteDeck(uuid, mockOwner._id.toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastAccessed', () => {
    it('should update last accessed time', async () => {
      const uuid = 'test-uuid';
      jest.spyOn(service, 'findByUuid').mockResolvedValue(mockPitchDeck);

      const originalLastAccessed = mockPitchDeck.lastAccessedAt;
      await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure time difference

      await service.updateLastAccessed(uuid, mockOwner._id.toString());

      expect(mockPitchDeck.lastAccessedAt.getTime()).toBeGreaterThan(
        originalLastAccessed.getTime(),
      );
    });

    it('should do nothing when pitch deck not found', async () => {
      const uuid = 'non-existent-uuid';
      jest.spyOn(service, 'findByUuid').mockResolvedValue(null);

      await service.updateLastAccessed(uuid, mockOwner._id.toString());
    });
  });
});
