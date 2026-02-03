import { Test, TestingModule } from '@nestjs/testing';
import { PitchDeckController } from './pitchdeck.controller';
import { PitchDeckService } from './pitchdeck.service';

// Mock the service to avoid module import issues
jest.mock('./pitchdeck.service', () => ({
  PitchDeckService: class {
    constructor() {}
  },
}));
import { Request } from 'express';
import { PitchDeckResponseDto } from './dto/pitch-deck-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from '@mikro-orm/mongodb';

describe('PitchDeckController', () => {
  let controller: PitchDeckController;
  let service: PitchDeckService;

  const mockPitchDeckService = {
    uploadDeck: jest.fn(),
    findByOwner: jest.fn(),
    findByUuid: jest.fn(),
    updateLastAccessed: jest.fn(),
    deleteDeck: jest.fn(),
  };

  const mockRequest = {
    user: { sub: new ObjectId().toString() },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PitchDeckController],
      providers: [
        {
          provide: PitchDeckService,
          useValue: mockPitchDeckService,
        },
      ],
    }).compile();

    controller = module.get<PitchDeckController>(PitchDeckController);
    service = module.get<PitchDeckService>(PitchDeckService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDeck', () => {
    it('should upload pitch deck successfully', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const dto = {
        title: 'Test Pitch Deck',
        description: 'Test description',
        tags: ['test'],
      };

      const mockPitchDeck = {
        id: 'test-id',
        uuid: 'test-uuid',
        title: 'Test Pitch Deck',
        originalFileName: 'test.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024,
        status: 'uploading',
        chunkCount: 0,
      } as any;

      mockPitchDeckService.uploadDeck.mockResolvedValue(mockPitchDeck);
      jest
        .spyOn(require('file-type'), 'fileTypeFromBuffer')
        .mockResolvedValue({ mime: 'application/pdf' });

      const result = await controller.uploadDeck(mockFile, dto, mockRequest);

      expect(result).toEqual(PitchDeckResponseDto.fromEntity(mockPitchDeck));
      expect(mockPitchDeckService.uploadDeck).toHaveBeenCalledWith(
        mockFile,
        dto,
        mockRequest.user.sub,
      );
    });

    it('should throw BadRequestException when no file provided', async () => {
      const dto = {
        title: 'Test Pitch Deck',
        description: 'Test description',
      };

      await expect(
        controller.uploadDeck(null, dto, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadDeck(null, dto, mockRequest),
      ).rejects.toThrow('No file provided');
    });

    it('should throw BadRequestException for invalid MIME type', async () => {
      const mockFile = {
        originalname: 'test.exe',
        buffer: Buffer.from('test content'),
        mimetype: 'application/x-executable',
      } as Express.Multer.File;

      const dto = {
        title: 'Test Pitch Deck',
        description: 'Test description',
      };

      await expect(
        controller.uploadDeck(mockFile, dto, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadDeck(mockFile, dto, mockRequest),
      ).rejects.toThrow('Invalid file type');
    });

    it('should throw BadRequestException when file content does not match MIME type', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('not a pdf'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const dto = {
        title: 'Test Pitch Deck',
        description: 'Test description',
      };

      jest.spyOn(require('file-type'), 'fileTypeFromBuffer').mockResolvedValue({
        mime: 'text/plain',
      });

      await expect(
        controller.uploadDeck(mockFile, dto, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.uploadDeck(mockFile, dto, mockRequest),
      ).rejects.toThrow('File content does not match expected format');
    });
  });

  describe('listDecks', () => {
    it('should list all decks for user', async () => {
      const mockDecks = [
        {
          id: '1',
          uuid: 'uuid-1',
          title: 'Deck 1',
          status: 'ready',
          chunkCount: 5,
        },
        {
          id: '2',
          uuid: 'uuid-2',
          title: 'Deck 2',
          status: 'processing',
          chunkCount: 0,
        },
      ] as any;

      mockPitchDeckService.findByOwner.mockResolvedValue(mockDecks);

      const result = await controller.listDecks(mockRequest);

      expect(result).toEqual([
        PitchDeckResponseDto.fromEntity(mockDecks[0]),
        PitchDeckResponseDto.fromEntity(mockDecks[1]),
      ]);
      expect(mockPitchDeckService.findByOwner).toHaveBeenCalledWith(
        mockRequest.user.sub,
        {},
      );
    });

    it('should list decks with status filter', async () => {
      const mockDecks = [
        {
          id: '1',
          uuid: 'uuid-1',
          title: 'Deck 1',
          status: 'ready',
          chunkCount: 5,
        },
      ] as any;

      mockPitchDeckService.findByOwner.mockResolvedValue(mockDecks);

      const result = await controller.listDecks(mockRequest, 'ready', 10, 0);

      expect(result).toEqual([PitchDeckResponseDto.fromEntity(mockDecks[0])]);
      expect(mockPitchDeckService.findByOwner).toHaveBeenCalledWith(
        mockRequest.user.sub,
        {
          status: 'ready',
          limit: 10,
          offset: undefined, // MikroORM treats undefined as no offset
        },
      );
    });
  });

  describe('getDeck', () => {
    it('should get deck by UUID', async () => {
      const mockDeck = {
        id: '1',
        uuid: 'uuid-1',
        title: 'Test Deck',
        status: 'ready',
        chunkCount: 5,
      } as any;

      mockPitchDeckService.findByUuid.mockResolvedValue(mockDeck);

      const result = await controller.getDeck('uuid-1', mockRequest);

      expect(result).toEqual(PitchDeckResponseDto.fromEntity(mockDeck));
      expect(mockPitchDeckService.findByUuid).toHaveBeenCalledWith(
        'uuid-1',
        mockRequest.user.sub,
      );
      expect(mockPitchDeckService.updateLastAccessed).toHaveBeenCalledWith(
        'uuid-1',
        mockRequest.user.sub,
      );
    });

    it('should throw BadRequestException when deck not found', async () => {
      mockPitchDeckService.findByUuid.mockResolvedValue(null);

      await expect(
        controller.getDeck('non-existent-uuid', mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.getDeck('non-existent-uuid', mockRequest),
      ).rejects.toThrow('Pitch deck not found');
    });
  });

  describe('deleteDeck', () => {
    it('should delete deck successfully', async () => {
      mockPitchDeckService.deleteDeck.mockResolvedValue(undefined);

      const result = await controller.deleteDeck('uuid-1', mockRequest);

      expect(result).toEqual({ success: true });
      expect(mockPitchDeckService.deleteDeck).toHaveBeenCalledWith(
        'uuid-1',
        mockRequest.user.sub,
      );
    });
  });
});
