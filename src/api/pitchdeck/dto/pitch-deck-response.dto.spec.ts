import { PitchDeckResponseDto } from './pitch-deck-response.dto';
import { PitchDeck, DeckStatus } from '../entities/pitch-deck.entity';
import { User } from '../../user/entities/user.entity';
import { ObjectId } from '@mikro-orm/mongodb';

describe('PitchDeckResponseDto', () => {
  let mockPitchDeck: PitchDeck;
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      _id: new ObjectId(),
      username: 'testuser',
      password: 'testpass',
    } as User;

    mockPitchDeck = {
      id: 'test-id',
      uuid: 'test-uuid-123',
      title: 'Test Pitch Deck Title',
      description: 'Test pitch deck description',
      originalFileName: 'pitch-deck.pdf',
      mimeType: 'application/pdf',
      fileSize: 2048,
      storagePath: '/uploads/pitchdecks/test-uuid-123.pdf',
      status: 'ready' as DeckStatus,
      chunkCount: 5,
      astraCollection: 'pitch_decks_collection',
      errorMessage: null,
      tags: ['test', 'pitch', 'deck'],
      lastAccessedAt: new Date(),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      owner: mockUser,
      chunks: [],
    } as any;
  });

  it('should convert entity to DTO correctly', () => {
    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result).toEqual({
      id: mockPitchDeck.id,
      uuid: mockPitchDeck.uuid,
      title: mockPitchDeck.title,
      description: mockPitchDeck.description,
      originalFileName: mockPitchDeck.originalFileName,
      mimeType: mockPitchDeck.mimeType,
      fileSize: mockPitchDeck.fileSize,
      status: mockPitchDeck.status,
      chunkCount: mockPitchDeck.chunkCount,
      errorMessage: mockPitchDeck.errorMessage,
      tags: mockPitchDeck.tags,
      createdAt: mockPitchDeck.createdAt,
      updatedAt: mockPitchDeck.updatedAt,
      lastAccessedAt: mockPitchDeck.lastAccessedAt,
    });
  });

  it('should handle entity without description', () => {
    delete mockPitchDeck.description;
    mockPitchDeck.description = undefined;

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.description).toBeUndefined();
  });

  it('should handle entity with errorMessage', () => {
    mockPitchDeck.errorMessage = 'Processing failed';

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.errorMessage).toBe('Processing failed');
  });

  it('should handle entity without errorMessage', () => {
    mockPitchDeck.errorMessage = undefined;

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.errorMessage).toBeUndefined();
  });

  it('should handle entity without tags', () => {
    mockPitchDeck.tags = undefined;

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.tags).toBeUndefined();
  });

  it('should handle entity with empty tags array', () => {
    mockPitchDeck.tags = [];

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.tags).toEqual([]);
  });

  it('should preserve all required fields', () => {
    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.id).toBeDefined();
    expect(result.uuid).toBeDefined();
    expect(result.title).toBeDefined();
    expect(result.originalFileName).toBeDefined();
    expect(result.mimeType).toBeDefined();
    expect(result.fileSize).toBeDefined();
    expect(result.status).toBeDefined();
    expect(result.chunkCount).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
    expect(result.lastAccessedAt).toBeDefined();
  });

  it('should handle all possible deck statuses', () => {
    const statuses: DeckStatus[] = [
      'uploading',
      'processing',
      'ready',
      'error',
    ];

    statuses.forEach((status) => {
      mockPitchDeck.status = status;
      const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);
      expect(result.status).toBe(status);
    });
  });

  it('should maintain date objects correctly', () => {
    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.lastAccessedAt).toBeInstanceOf(Date);

    expect(result.createdAt.getTime()).toBe(mockPitchDeck.createdAt.getTime());
    expect(result.updatedAt.getTime()).toBe(mockPitchDeck.updatedAt.getTime());
    expect(result.lastAccessedAt.getTime()).toBe(
      mockPitchDeck.lastAccessedAt.getTime(),
    );
  });

  it('should handle large numbers correctly', () => {
    mockPitchDeck.fileSize = 1024 * 1024 * 1024; // 1GB
    mockPitchDeck.chunkCount = 1000;

    const result = PitchDeckResponseDto.fromEntity(mockPitchDeck);

    expect(result.fileSize).toBe(1024 * 1024 * 1024);
    expect(result.chunkCount).toBe(1000);
  });
});
