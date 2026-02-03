# Code Standards & Structure

## TypeScript Configuration

### Compiler Settings
```typescript
{
  "target": "ES2020",
  "module": "commonjs",
  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true,
  "resolveJsonModule": true,
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

### Path Aliases (tsconfig.json)
```json
{
  "@core/*": ["src/core/*"],
  "@api/*": ["src/api/*"],
  "@utils/*": ["src/utils/*"],
  "@config/*": ["src/config/*"],
  "@libs/*": ["src/libs/*"],
  "@/*": ["src/*"]
}
```

**Usage Example**:
```typescript
// Good
import { BaseService } from '@core/base/base.service';
import { UserEntity } from '@api/user/entities/user.entity';

// Avoid
import { BaseService } from '../../../core/base/base.service';
```

## NestJS Module Structure

### Standard Module Layout
```
feature-name/
├── feature-name.module.ts      # Module definition
├── feature-name.controller.ts  # HTTP endpoints
├── feature-name.service.ts     # Business logic
├── entities/
│   └── feature-name.entity.ts  # Database entity
├── dto/
│   ├── index.ts                # Export barrel
│   ├── create-feature.dto.ts   # Request DTOs
│   └── update-feature.dto.ts
├── types/
│   └── feature.types.ts        # TypeScript interfaces
├── interceptor/
│   └── feature.interceptor.ts  # Response transformation
└── guards/
    └── feature.guard.ts        # Authorization logic
```

### RAG Module Implementation
```
rag/
├── rag.module.ts               # ConfigModule import, lifecycle hooks
├── rag.controller.ts           # REST endpoints with @ApiTags
├── rag.service.ts              # LangChain + AstraDB + OpenAI integration
├── entities/
│   └── document.entity.ts     # Document metadata structure
├── dto/
│   ├── index.ts                # Central export
│   ├── ingest-document.dto.ts  # Multi-document ingestion with validation
│   ├── query-document.dto.ts   # Query with filters, topK, scoreThreshold
│   └── delete-document.dto.ts  # Conditional deletion by IDs/filter
└── types/
    └── rag.types.ts            # Result types, metadata interfaces
```

**Key Implementation Details**:
- Lifecycle hooks: `@OnModuleInit()` and `@OnModuleDestroy()` for AstraDB connection
- Vector operations: 1536-dim embeddings from OpenAI text-embedding-ada-002
- Similarity metric: Cosine distance for document matching
- Batch operations: Support for multiple document ingestion/deletion
- Health monitoring: Real-time system status endpoint

### Module Template
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureEntity } from './entities/feature.entity';

@Module({
  imports: [MikroOrmModule.forFeature([FeatureEntity])],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Export if used by other modules
})
export class FeatureModule {}
```

## Entity Standards

### Base Entity Pattern
All entities extend `BaseEntity` for consistency:

```typescript
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@core/base/base.entity';

@Entity({ tableName: 'feature_name' })
export class FeatureEntity extends BaseEntity {
  @Property()
  name: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ hidden: true }) // Exclude from serialization
  sensitiveData?: string;

  constructor(partial?: Partial<FeatureEntity>) {
    super();
    Object.assign(this, partial);
  }
}
```

### Entity Conventions
- **Table Names**: snake_case (e.g., `user_profiles`, `app_configs`)
- **Property Names**: camelCase (matches TypeScript convention)
- **Sensitive Fields**: Mark with `{ hidden: true }` (passwords, tokens)
- **Optional Fields**: Use `?` and `{ nullable: true }`
- **Constructor**: Accept `Partial<T>` for flexibility

## Service Standards

### Base Service Extension
Services inherit CRUD operations from `BaseService<T>`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { BaseService } from '@core/base/base.service';
import { FeatureEntity } from './entities/feature.entity';

@Injectable()
export class FeatureService extends BaseService<FeatureEntity> {
  constructor(
    @InjectRepository(FeatureEntity)
    private readonly featureRepository: EntityRepository<FeatureEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(featureRepository, entityManager);
  }

  // Inherited methods:
  // - findById(id)
  // - findAll(options)
  // - find(filter, options)
  // - count(filter)
  // - create(data)
  // - bulkCreate(dataArray)
  // - update(id, data)
  // - delete(id)
  // - upsert(filter, data)

  // Custom business logic
  async findByName(name: string): Promise<FeatureEntity | null> {
    return this.featureRepository.findOne({ name });
  }
}
```

### Service Best Practices
- **Always use BaseService**: Avoid reimplementing CRUD
- **Transactions**: Wrap multi-entity updates in `entityManager.transactional()`
- **Error Handling**: Throw exceptions, don't return error objects
- **Dependency Injection**: Use constructor injection, not property injection
- **Type Safety**: Return typed entities, not `any`

## Controller Standards

### REST Endpoint Pattern
```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guard/jwt.auth.guard';
import { CurrentUser } from '@core/decorators/current-user.decorator';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@ApiTags('feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'List all features' })
  async findAll() {
    return this.featureService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new feature' })
  async create(@Body() dto: CreateFeatureDto, @CurrentUser() user) {
    return this.featureService.create({ ...dto, userId: user.id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdateFeatureDto) {
    return this.featureService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async delete(@Param('id') id: string) {
    return this.featureService.delete(id);
  }
}
```

### Controller Conventions
- **Route Prefix**: Plural noun (e.g., `/users`, `/configs`)
- **HTTP Methods**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Auth Guards**: Apply `@UseGuards(JwtAuthGuard)` to protected routes
- **Swagger Tags**: Use `@ApiTags()` for grouping
- **Operations**: Describe endpoints with `@ApiOperation()`
- **User Context**: Inject with `@CurrentUser()` decorator

## DTO Standards

### Request DTO Pattern
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({ description: 'Feature name', example: 'My Feature' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Feature description' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;
}
```

### DTO Conventions
- **Validation**: Use `class-validator` decorators
- **Swagger**: Annotate with `@ApiProperty()` and `@ApiPropertyOptional()`
- **Naming**: `Create*Dto`, `Update*Dto`, `*ResponseDto`
- **Transformation**: Use `class-transformer` for type coercion
- **Partial Updates**: Extend `PartialType(CreateDto)` for update DTOs
- **Security**: Always use `@MaxLength()` to prevent payload attacks

### Advanced Validation Patterns (RAG Module)

**Nested Object Validation**:
```typescript
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class DocumentMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
}

class DocumentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100000, { message: 'Document content exceeds 100KB limit' })
  pageContent: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentMetadataDto)
  metadata?: DocumentMetadataDto;
}

export class IngestDocumentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];
}
```

**Conditional Validation**:
```typescript
import { ValidateIf } from 'class-validator';

export class DeleteDocumentDto {
  @ValidateIf((o) => !o.filter)
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  ids?: string[];

  @ValidateIf((o) => !o.ids)
  @ValidateNested()
  @Type(() => DeleteFilterDto)
  filter?: DeleteFilterDto;
}
```

**Numeric Range Validation**:
```typescript
import { IsInt, Min, Max } from 'class-validator';

export class QueryDocumentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  topK?: number = 5;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  scoreThreshold?: number = 0.7;
}
```

**Vector Operations Validation**:
```typescript
import { IsArray, IsNotEmpty, MaxLength } from 'class-validator';

export class IngestDocumentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents: DocumentDto[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  collection?: string = 'documents';
}

class DocumentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100000, { message: 'Document content exceeds 100KB limit' })
  pageContent: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentMetadataDto)
  metadata?: DocumentMetadataDto;
}

class DocumentMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  version?: number;
}
```

### Security Best Practices
1. **MaxLength Protection**: Always set `@MaxLength()` to prevent DoS
   - Text fields: 500-1000 chars
   - Long content: 100KB max
   - IDs: 100 chars
2. **Explicit Type Conversion**: Use `@Type(() => ClassName)` for nested objects
3. **Custom Error Messages**: Provide clear validation messages
4. **Default Values**: Use TypeScript defaults for optional fields

## Authentication Patterns

### JWT Guard Usage
```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getCurrentUser(@CurrentUser() user: UserEntity) {
  return user;
}
```

### Custom Decorator Pattern
```typescript
// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Error Handling Standards

### Exception Throwing
```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Good: Throw exceptions
async findById(id: string) {
  const entity = await this.repository.findOne({ id });
  if (!entity) {
    throw new NotFoundException(`Feature with ID ${id} not found`);
  }
  return entity;
}

// Bad: Return error objects
async findById(id: string) {
  const entity = await this.repository.findOne({ id });
  if (!entity) {
    return { error: 'Not found' }; // DON'T DO THIS
  }
  return entity;
}
```

### Global Exception Filter
Applied automatically in `main.ts`:
```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

**Response Format**:
```json
{
  "statusCode": 404,
  "message": "Feature with ID 123 not found",
  "timestamp": "2026-02-03T09:58:24.000Z",
  "path": "/api/feature/123"
}
```

## Middleware & Interceptors

### Middleware Pattern (Logger Example)
```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });

    next();
  }
}
```

### Interceptor Pattern (Serialization Example)
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        // Transform response (e.g., remove sensitive fields)
        if (data?.password) {
          const { password, ...rest } = data;
          return rest;
        }
        return data;
      }),
    );
  }
}
```

## Database Seeding Pattern

### Idempotent Seeder
```typescript
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '@api/app-config/app-config.service';
import { diffArrays } from '@utils/array.util';

@Injectable()
export class AppConfigSeeder {
  constructor(private readonly appConfigService: AppConfigService) {}

  async seed() {
    const expectedConfigs = [
      { key: 'FEATURE_FLAG_1', value: 'true', isPublic: true },
      { key: 'API_VERSION', value: 'v1', isPublic: true },
    ];

    const existingConfigs = await this.appConfigService.findAll();
    const { toCreate, toUpdate, toDelete } = diffArrays(
      existingConfigs,
      expectedConfigs,
      'key',
    );

    await this.appConfigService.bulkCreate(toCreate);
    for (const update of toUpdate) {
      await this.appConfigService.update(update.id, update);
    }
    for (const del of toDelete) {
      await this.appConfigService.delete(del.id);
    }
  }
}
```

## Environment Configuration

### Configuration Module Pattern
```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  database: {
    type: process.env.DB_TYPE || 'mongodb',
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  astradb: {
    token: process.env.ASTRA_DB_APPLICATION_TOKEN,
    endpoint: process.env.ASTRA_DB_ENDPOINT,
    collection: process.env.ASTRA_DB_COLLECTION || 'documents',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
  },
});
```

### Usage in Services
```typescript
import { ConfigService } from '@nestjs/config';

constructor(private configService: ConfigService) {
  const jwtSecret = this.configService.get<string>('jwt.secret');
  const astraEndpoint = this.configService.get<string>('astradb.endpoint');
  const openaiKey = this.configService.get<string>('openai.apiKey');
}
```

## Code Quality Tools

### ESLint Rules
```bash
npm run lint        # Check for errors
npm run lint --fix  # Auto-fix issues
```

### Prettier Formatting
```bash
npm run format      # Format all .ts files
```

### Pre-commit Checklist
1. ✅ Run `npm run lint` (zero errors)
2. ✅ Run `npm run format` (consistent style)
3. ✅ Run `npm run test` (all tests pass)
4. ✅ Run `npm run build` (TypeScript compiles)

## Naming Conventions Summary

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `user-profile.service.ts` |
| Classes | PascalCase | `UserProfileService` |
| Interfaces | PascalCase + `I` prefix (optional) | `IUserProfile` |
| Variables | camelCase | `currentUser` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Private methods | camelCase + `_` prefix | `_validateInput()` |
| Database tables | snake_case | `user_profiles` |
| Env variables | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Routes | kebab-case | `/api/user-profiles` |

## Import Order Convention
```typescript
// 1. External libraries
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

// 2. Path aliases (@core, @api, etc.)
import { BaseService } from '@core/base/base.service';
import { UserEntity } from '@api/user/entities/user.entity';

// 3. Relative imports
import { CreateUserDto } from './dto/create-user.dto';
```

## Unresolved Questions

1. Should we enforce absolute imports only (via ESLint rule)?
2. What is the convention for GraphQL resolvers (if added)?
3. Should private methods use `_` prefix or rely on TypeScript `private` keyword?
4. Do we need a linter rule to enforce BaseService usage?
5. What is the branching strategy for feature development?
