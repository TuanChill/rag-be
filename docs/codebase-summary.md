# Codebase Summary

## Overview

**Total TypeScript Files**: 82 files
**Architecture**: 3-Layer Clean Architecture (Root, Core, API)
**Design Philosophy**: YAGNI/KISS/DRY
**Module System**: NestJS dependency injection with explicit imports

## Directory Structure

```
src/
├── main.ts                         # Bootstrap entry point
├── app.module.ts                   # Root module orchestration
├── config/
│   └── configuration.ts            # Environment variable loader
├── core/                           # Infrastructure layer (17 files)
│   ├── base/
│   │   ├── base.entity.ts         # Abstract entity with id/timestamps
│   │   ├── base.service.ts        # Generic CRUD operations
│   │   └── base.service.interface.ts  # Read/Write interfaces
│   ├── database/
│   │   ├── database.ts            # MikroORM multi-DB config
│   │   └── seeder/
│   │       ├── seeder.service.ts  # OnModuleInit seeding orchestrator
│   │       ├── scripts/
│   │           └── app-config.seeder.ts  # Diff-based config updates
│   │       └── data/app-config.data.ts  # Seed data
│   ├── decorators/
│   │   └── current-user.decorator.ts  # @CurrentUser() param decorator
│   ├── filter/
│   │   └── http-exception.filter.ts  # Global exception handler
│   ├── guard/
│   │   └── jwt.auth.guard.ts      # JWT route protection
│   ├── middlewares/
│   │   ├── logger.middleware.ts   # HTTP request logging
│   │   └── jwt.middleware.ts      # JWT extraction middleware
│   ├── modules/
│   │   └── redis/
│   │       └── redis.service.ts   # Redis wrapper (ioredis)
│   └── pipe/
│       └── parse-objectid.pipe.ts # MongoDB ObjectId transformer
├── api/                            # Business logic layer (28 files)
│   ├── auth/                      # Authentication module (9 files)
│   │   ├── auth.service.ts        # Login/signIn business logic
│   │   ├── auth.controller.ts     # POST /auth/login, /auth/signIn
│   │   ├── auth.module.ts         # Module definition
│   │   ├── strategies/
│   │   │   ├── jwt.ts             # Bearer token validation
│   │   │   └── local.ts           # Bcrypt hash/validate
│   │   └── services/
│   │       └── siwe.service.ts    # Ethereum wallet auth (viem + siwe)
│   ├── user/                      # User management module (7 files)
│   │   ├── user.service.ts        # extends BaseService<User>
│   │   ├── user.controller.ts     # GET/PATCH/DELETE /users/me
│   │   ├── user.module.ts         # Module definition
│   │   ├── entities/
│   │   │   └── user.entity.ts     # User entity (username, password)
│   │   ├── dto/
│   │   │   └── *.dto.ts           # Data transfer objects
│   │   └── interceptor/
│   │       └── user.interceptor.ts  # Custom serializer
│   ├── app-config/                # Dynamic config module (4 files)
│   │   ├── app-config.service.ts  # extends BaseService<AppConfig>
│   │   ├── app-config.controller.ts  # Config CRUD endpoints
│   │   ├── app-config.module.ts   # Module definition
│   │   └── entities/
│   │       └── app-config.entity.ts  # key/value/isPublic fields
│   ├── rag/                       # RAG module (8 files)
│   │   ├── rag.service.ts         # LangChain + AstraDB + OpenAI integrations
│   │   ├── rag.controller.ts     # REST endpoints for RAG operations
│   │   ├── rag.module.ts          # Module definition with lifecycle hooks
│   │   ├── entities/
│   │   │   └── document.entity.ts # Document metadata entity
│   │   └── dto/
│   │       ├── ingest-document.dto.ts     # Multi-document ingestion
│   │       ├── query-document.dto.ts      # Query with filters
│   │       └── delete-document.dto.ts    # Conditional deletion
│   ├── analysis/                  # AI Analysis Engine (12 files) - NEW
│   │   ├── analysis.module.ts     # Module definition
│   │   ├── entities/
│   │   │   ├── analysis-result.entity.ts   # Main analysis container
│   │   │   ├── analysis-score.entity.ts     # Component scoring with weights
│   │   │   ├── analysis-finding.entity.ts  # Strengths/weaknesses
│   │   │   └── agent-state.entity.ts      # Agent execution tracking
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts      # Request DTO
│   │   │   ├── analysis-response.dto.ts    # Response DTO
│   │   │   └── analysis-status.dto.ts      # Status tracking
│   │   └── types/
│   │       └── analysis.types.ts          # Type definitions
│   └── pitchdeck/                # Pitch deck management (7 files)
│       ├── pitch-deck.service.ts  # Pitch deck CRUD operations
│       ├── pitch-deck.controller.ts  # REST endpoints
│       ├── pitch-deck.module.ts   # Module definition
│       ├── entities/
│       │   └── pitch-deck.entity.ts  # Pitch deck metadata
│       └── dto/
│           └── *.dto.ts          # Data transfer objects
├── utils/                          # Shared utilities (4 files)
│   ├── hardware.util.ts            # Memory usage formatter
│   ├── array.util.ts               # Seeder diff helpers
│   ├── decimal.util.ts             # Decimal.js precision math wrapper
│   └── fixed.util.ts               # Ethers.js FixedNumber wrapper
└── test/                           # Test suite
    ├── app.e2e-spec.ts             # End-to-end tests
    └── *.spec.ts                   # Unit tests
```

## File Count by Layer

| Layer | Files | Purpose |
|-------|-------|---------|
| Root | 3 | Bootstrap, configuration, app module |
| Core | 17 | Infrastructure, guards, filters, base classes |
| API | 40+ | Business logic (Auth, User, AppConfig, RAG, Analysis, PitchDeck) |
| Utils | 4 | Shared utilities |
| Test | 8+ | Unit and e2e tests |
| **Total** | **~82** | **Application code + tests** |

## Module Dependency Graph

```
AppModule (root)
├── ConfigModule (global)
├── MikroOrmModule (DatabaseConfig)
├── CacheModule (Redis/memory)
├── UserModule
│   └── UserService → BaseService<User>
├── AuthModule
│   ├── UserModule (imports)
│   ├── JwtModule
│   ├── PassportModule
│   ├── LocalStrategy
│   ├── JwtStrategy
│   └── SiweService
├── AppConfigModule
│   └── AppConfigService → BaseService<AppConfig>
├── RAGModule
│   ├── RAGService (AstraDB + LangChain + OpenAI)
│   ├── OnModuleInit/Destroy lifecycle hooks
│   └── Configuration (AstraDB, OpenAI API)
├── AnalysisModule (NEW)
│   ├── Entities (AnalysisResult, AnalysisScore, AnalysisFinding, AgentState)
│   ├── MikroOrmModule.forFeature([...])
│   └── Ready for Phase 3 service layer
├── PitchDeckModule
│   └── PitchDeckService → BaseService<PitchDeck>
└── SeederModule
    └── DatabaseSeeder → AppConfigSeeder
```

## Key Architectural Patterns

### 1. Base Service Pattern (DRY CRUD)
All domain services extend `BaseService<T>` for automatic CRUD operations:
- **Read Operations**: findById, findAll, find, count
- **Write Operations**: create, bulkCreate, update, delete, upsert
- **Performance**: Cached EntityManager, transactional writes

**Example Usage**:
```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) userRepository: EntityRepository<User>,
    entityManager: EntityManager,
  ) {
    super(userRepository, entityManager);
  }
  // Inherit all CRUD methods + add custom business logic
}
```

### 2. Multi-Database Abstraction
Runtime database switching via `DB_TYPE` environment variable:
- **MongoDB**: MongoDriver with connection pooling
- **PostgreSQL**: PostgreSqlDriver with connection pooling
- **Seamless Switching**: No code changes required

### 3. RAG Module Integration
The RAG module implements LangChain with AstraDB vector database:
- **Vector Store**: Datastax Astra DB with 1536 dimensions (OpenAI embeddings)
- **Document Operations**: Ingest, query, delete with filtering
- **Lifecycle**: OnModuleInit for DB connection, OnModuleDestroy for cleanup
- **Similarity**: Cosine similarity for document matching

### 4. Event & Queue System (Phase 1.5)
Event-driven architecture with BullMQ for async processing:
- **Events**: EventEmitter2 for pitch deck lifecycle events
- **Queue**: BullMQ with Redis for analysis job processing
- **Progress Tracking**: Real-time job status updates
- **Retry Logic**: Exponential backoff for failed jobs

### 5. Analysis Module (Phase 2)
AI-powered analysis engine with entity-based architecture:
- **Entities**: AnalysisResult, AnalysisScore, AnalysisFinding, AgentState
- **Weighted Scoring**: Transparent algorithm with configurable weights
- **Agent Tracking**: Complete execution history and debugging
- **Status Management**: Workflow states for analyses and agents

### 6. Middleware Pipeline
```
Incoming Request
  ↓
LoggerMiddleware (HTTP logging)
  ↓
JwtMiddleware (token extraction)
  ↓
JwtAuthGuard (route protection)
  ↓
Controller Handler
  ↓
HttpExceptionFilter (error handling)
  ↓
Response
```

### 7. Idempotent Seeder Pattern
Database initialization with diff-based updates:
- Enabled via `ENABLE_SEEDER` environment variable
- Compares existing vs. expected state
- Only creates/updates/deletes differences
- OnModuleInit lifecycle hook execution

### 8. Path Alias System
TypeScript path mappings for clean imports:

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@core/*` | `src/core/*` | Infrastructure imports |
| `@api/*` | `src/api/*` | Business logic imports |
| `@utils/*` | `src/utils/*` | Utility imports |
| `@config/*` | `src/config/*` | Configuration imports |
| `@libs/*` | `src/libs/*` | Library wrappers |
| `@/*` | `src/*` | Root-level imports |

## Code Organization Principles

### YAGNI (You Aren't Gonna Need It)
- No premature abstractions
- Features implemented only when required
- Minimal boilerplate in business logic

### KISS (Keep It Simple, Stupid)
- Clear file naming conventions
- Single responsibility per file
- Shallow directory nesting (max 3 levels)

### DRY (Don't Repeat Yourself)
- BaseService eliminates CRUD duplication
- Shared utilities in utils/ directory
- Decorators for cross-cutting concerns

## External Dependencies by Category

### Core Framework
- `@nestjs/*` (11.0.0): common, core, platform-express, config, jwt, cache-manager, passport

### Database & ORM
- `@mikro-orm/*` (6.5.6): core, mongodb, postgresql, nestjs
- `mongoose`: MongoDB schema validation

### Authentication
- `passport`, `passport-jwt`, `passport-local`: Strategy pattern
- `bcrypt`: Password hashing
- `siwe`: Sign-In with Ethereum

### Blockchain
- `ethers`: Ethereum library
- `viem`: Type-safe Ethereum interactions

### RAG & AI
- `@langchain/community`, `@langchain/core`, `@langchain/openai`: LLM orchestration
- `@datastax/astra-db-ts`: Vector database
- `openai`: OpenAI API client

### Event & Queue
- `eventemitter2`: Enhanced event emission
- `bullmq`: Redis-based queue processing

### Caching
- `ioredis`: Redis client
- `cache-manager`: NestJS caching abstraction

### Utilities
- `decimal.js`: Precision math
- `class-validator`, `class-transformer`: DTO validation

## File Naming Conventions

| File Type | Convention | Example |
|-----------|-----------|---------|
| Entity | `*.entity.ts` | `user.entity.ts` |
| Service | `*.service.ts` | `auth.service.ts` |
| Controller | `*.controller.ts` | `user.controller.ts` |
| Module | `*.module.ts` | `app-config.module.ts` |
| DTO | `*.dto.ts` | `create-user.dto.ts` |
| Guard | `*.guard.ts` | `jwt.auth.guard.ts` |
| Filter | `*.filter.ts` | `http-exception.filter.ts` |
| Middleware | `*.middleware.ts` | `logger.middleware.ts` |
| Pipe | `*.pipe.ts` | `parse-objectid.pipe.ts` |
| Interceptor | `*.interceptor.ts` | `user.interceptor.ts` |
| Decorator | `*.decorator.ts` | `current-user.decorator.ts` |
| Strategy | `*.ts` (in strategies/) | `jwt.ts` |
| Seeder | `*.seeder.ts` | `app-config.seeder.ts` |
| Utility | `*.util.ts` | `hardware.util.ts` |
| Type | `*.types.ts` | `analysis.types.ts` |

## RAG Module Details

### Configuration
- **Vector Database**: Datastax Astra DB
- **Embeddings**: OpenAI text-embedding-ada-002 (1536 dimensions)
- **Collection**: Configurable via `ASTRA_DB_COLLECTION` env var
- **Similarity**: Cosine similarity for document matching

### Service Methods
```typescript
class RAGService {
  // OnModuleInit: Establish AstraDB connection
  // OnModuleDestroy: Cleanup connections

  async ingestDocument(dto: IngestDocumentDto): Promise<IngestResult[]>
  async queryDocument(dto: QueryDocumentDto): Promise<QueryResult[]>
  async deleteDocument(dto: DeleteDocumentDto): Promise<DeleteResult[]>
  async healthCheck(): Promise<HealthStatus>
}
```

### DTOs
- **IngestDocumentDto**: Multi-document ingestion with metadata
- **QueryDocumentDto**: Query with topK, score threshold, and filters
- **DeleteDocumentDto**: Conditional deletion by IDs or filter

## Analysis Module Details (NEW)

### Entities
- **AnalysisResult**: Main analysis container with workflow status
- **AnalysisScore**: Component scores with weighted algorithm
- **AnalysisFinding**: Strengths, weaknesses, opportunities, threats
- **AgentState**: Agent execution tracking and debugging

### Scoring Algorithm
```typescript
weights = {
  sector: 0.30,    // Market fit assessment
  stage: 0.25,     // Company maturity
  thesis: 0.25,    // Business evaluation
  history: 0.20    // Performance track record
}

overallScore = Σ(categoryScore × weight)
```

### API Contract (Ready for Phase 4)
- **Create Analysis**: `POST /analysis` with CreateAnalysisDto
- **Get Results**: `GET /analysis/:uuid` with AnalysisResponseDto
- **Status Polling**: `GET /analysis/:uuid/status` with AnalysisStatusDto

## Testing Structure

```
test/
├── app.e2e-spec.ts          # End-to-end tests
├── jest-e2e.json            # E2E Jest config
└── *.spec.ts                # Unit tests (co-located with source)
```

**Testing Commands**:
- `pnpm run test` - Unit tests
- `pnpm run test:watch` - Watch mode
- `pnpm run test:cov` - Coverage report
- `pnpm run test:e2e` - End-to-end tests

## Build & Deployment Artifacts

### Source → Build
```
src/ (TypeScript)
  ↓ [nest build]
dist/ (JavaScript ES2020)
  ↓ [docker build]
Docker Image
  ↓ [docker-compose up]
Running Container
```

### Configuration Files
- `tsconfig.json` - TypeScript compiler config
- `tsconfig.build.json` - Build-specific overrides
- `nest-cli.json` - NestJS CLI settings
- `.eslintrc.js` - Linting rules
- `.prettierrc` - Code formatting
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Locked dependencies

## Recent Updates

### Phase 2 Implementation Complete ✅
- Analysis module with complete entity suite
- Weighted scoring algorithm implementation
- Agent state tracking for debugging
- Full DTO coverage for requests/responses
- Module integration in app.module.ts

### Phase 1.5 Implementation Complete ✅
- Event system with EventEmitter2
- Queue system with BullMQ for async processing
- Type-safe event emission and job tracking
- Redis-based queue with retry logic

### Phase 1 Foundation Complete ✅
- Multi-database support (MongoDB/PostgreSQL)
- Redis caching layer
- JWT authentication
- SIWE blockchain authentication
- Base CRUD patterns
- Swagger documentation
- Docker containerization

## Unresolved Questions

1. Is scheduled processing needed for large document batches?
2. How to handle document versioning in RAG system?
3. What is the strategy for data migration when switching between vector databases?
4. Should we implement document preprocessing (chunking, cleaning)?
5. How to handle rate limiting on OpenAI API calls?
6. What are the backup/restore strategies for vector data?
7. Which job queue system to use (Bull vs. default Redis)?
8. How will agents communicate with each other?
9. What's the retry strategy for failed agents?
10. How to handle partial analysis failures?
11. Should WebSocket be implemented for real-time updates?
12. Can multiple pitch decks be analyzed simultaneously?
13. What are the constraints for concurrent analyses?
14. How old analyses and agent states should be purged?