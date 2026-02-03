import { validate, Validator } from 'class-validator';
import { UploadDeckDto } from './upload-deck.dto';

describe('UploadDeckDto', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  it('should validate successfully with valid data', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.description = 'Test description';
    dto.tags = ['test', 'pitchdeck'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when title is empty', async () => {
    const dto = new UploadDeckDto();
    dto.title = '';
    dto.description = 'Test description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail when title is too long', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'a'.repeat(201);
    dto.description = 'Test description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail when title is not a string', async () => {
    const dto = new UploadDeckDto();
    (dto as any).title = 123;
    (dto as any).description = 'Test description';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should allow empty description', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.description = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when description is too long', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.description = 'a'.repeat(1001);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate tags array correctly', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.tags = ['test', 'tag', 'pitch'];

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when tags contain non-string values', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.tags = ['test', 123, 'tag'] as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when tags contain strings that are too long', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.tags = ['valid', 'a'.repeat(51)];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when tags is not an array', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.tags = 'not an array' as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with optional fields missing', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with null optional fields', async () => {
    const dto = new UploadDeckDto();
    dto.title = 'Test Pitch Deck';
    dto.description = null;
    dto.tags = null;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
