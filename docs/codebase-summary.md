# Codebase Summary

## Overview

**Total TypeScript Files**: 120+ files
**Architecture**: 3-Layer Clean Architecture (Root, Core, API)
**Design Philosophy**: YAGNI/KISS/DRY
**Module System**: NestJS dependency injection with explicit imports
**Latest Phase**: Phase 9 - UI Output Format Complete

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
│   │           ├── app-config.seeder.ts  # Diff-based config updates
│   │           └── user.seeder.ts        # User data seeder
│   │       └── data/app-config.data.ts  # Seed data
│   │       └── data/user.data.ts        # User seed data
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
├── agents/                         # AI Agent Framework (NEW - Phase 9)
│   └── analysis/
│       ├── interfaces/
│       │   └── category-analysis.interface.ts  # UI output format interfaces
│       ├── dto/
│       │   └── category-output.dto.ts          # Category analysis DTOs
│       ├── overall-assessment.agent.ts         # Overall quality assessment
│       ├── market-opportunity.agent.ts         # Market potential analysis
│       ├── business-model.agent.ts             # Business model evaluation
│       ├── team-execution.agent.ts            # Team capability analysis
│       ├── financial-projections.agent.ts     # Financial validation
│       ├── competitive-landscape.agent.ts     # Competitive positioning
│       ├── prompts/
│       │   ├── overall-assessment.prompt.ts   # Overall assessment prompts
│       │   ├── market-opportunity.prompt.ts   # Market analysis prompts
│       │   ├── business-model.prompt.ts       # Business model prompts
│       │   ├── team-execution.prompt.ts      # Team analysis prompts
│       │   ├── financial-projections.prompt.ts # Financial prompts
│       │   └── competitive-landscape.prompt.ts # Competitive prompts
│       ├── analysis.module.ts                 # Agent module definition
│       └── analysis.module.ts                 # Agent module definition
├── api/                            # Business logic layer (50+ files)
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
│   ├── analysis/                  # AI Analysis Engine (35+ files) - Phase 9 Complete
│   │   ├── analysis.module.ts     # Module definition
│   │   ├── entities/
│   │   │   ├── analysis-result.entity.ts   # Main analysis container
│   │   │   ├── analysis-score.entity.ts     # Component scoring with weights
│   │   │   ├── analysis-finding.entity.ts  # Strengths/weaknesses
│   │   │   └── agent-state.entity.ts      # Agent execution tracking
│   │   ├── services/
│   │   │   ├── orchestrator.service.ts   # Analysis workflow coordination
│   │   │   └── calculator.service.ts     # Score calculation
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts      # Request DTO
│   │   │   ├── analysis-response.dto.ts    # Response DTO (Phase 9 UI Format)
│   │   │   ├── analysis-status.dto.ts      # Status tracking
│   │   │   └── category-output.dto.ts      # UI-compatible category DTOs
│   │   ├── types/
│   │   │   └── analysis.types.ts          # Type definitions
│   │   └── agents/              # Category Analysis Agents (Phase 9)
│   │       ├── overall-assessment.agent.ts  # Overall quality assessment
│   │       ├── market-opportunity.agent.ts  # Market potential analysis
│   │       ├── business-model.agent.ts      # Business model evaluation
│   │       ├── team-execution.agent.ts     # Team capability analysis
│   │       ├── financial-projections.agent.ts # Financial validation
│   │       └── competitive-landscape.agent.ts # Competitive positioning
│   ├── analysis/                  # AI Analysis Engine (35+ files) - Phase 9 Complete
│   │   ├── analysis.module.ts     # Module definition
│   │   ├── entities/
│   │   │   ├── analysis-result.entity.ts   # Main analysis container
│   │   │   ├── analysis-score.entity.ts     # Component scoring with weights
│   │   │   ├── analysis-finding.entity.ts  # Strengths/weaknesses
│   │   │   └── agent-state.entity.ts      # Agent execution tracking
│   │   ├── services/
│   │   │   ├── orchestrator.service.ts   # Analysis workflow coordination
│   │   │   └── calculator.service.ts     # Score calculation
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts      # Request DTO
│   │   │   ├── analysis-response.dto.ts    # Response DTO (Phase 9 UI Format)
│   │   │   ├── analysis-status.dto.ts      # Status tracking
│   │   │   └── category-output.dto.ts      # UI-compatible category DTOs
│   │   ├── types/
│   │   │   └── analysis.types.ts          # Type definitions
│   │   ├── agents/              # Category Analysis Agents (Phase 9)
│   │       ├── overall-assessment.agent.ts  # Overall quality assessment
│   │       ├── market-opportunity.agent.ts  # Market potential analysis
│   │       ├── business-model.agent.ts      # Business model evaluation
│   │       ├── team-execution.agent.ts     # Team capability analysis
│   │       ├── financial-projections.agent.ts # Financial validation
│   │       └── competitive-landscape.agent.ts # Competitive positioning
│   ├── analysis/                  # AI Analysis Engine (35+ files) - Phase 9 Complete
│   │   ├── analysis.module.ts     # Module definition
│   │   ├── entities/
│   │   │   ├── analysis-result.entity.ts   # Main analysis container
│   │   │   ├── analysis-score.entity.ts     # Component scoring with weights
│   │   │   ├── analysis-finding.entity.ts  # Strengths/weaknesses
│   │   │   └── agent-state.entity.ts      # Agent execution tracking
│   │   ├── services/
│   │   │   ├── orchestrator.service.ts   # Analysis workflow coordination
│   │   │   └── calculator.service.ts     # Score calculation
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts      # Request DTO
│   │   │   ├── analysis-response.dto.ts    # Response DTO (Phase 9 UI Format)
│   │   │   ├── analysis-status.dto.ts      # Status tracking
│   │   │   └── category-output.dto.ts      # UI-compatible category DTOs
│   │   ├── types/
│   │   │   └── analysis.types.ts          # Type definitions
│   │   └── agents/              # Category Analysis Agents (Phase 9)
│   │       ├── overall-assessment.agent.ts  # Overall quality assessment
│   │       ├── market-opportunity.agent.ts  # Market potential analysis
│   │       ├── business-model.agent.ts      # Business model evaluation
│   │       ├── team-execution.agent.ts     # Team capability analysis
│   │       ├── financial-projections.agent.ts # Financial validation
│   │       └── competitive-landscape.agent.ts # Competitive positioning
│   ├── analysis/                  # AI Analysis Engine (35+ files) - Phase 9 Complete
│   │   ├── analysis.module.ts     # Module definition
│   │   ├── entities/
│   │   │   ├── analysis-result.entity.ts   # Main analysis container
│   │   │   ├── analysis-score.entity.ts     # Component scoring with weights
│   │   │   ├── analysis-finding.entity.ts  # Strengths/weaknesses
│   │   │   └── agent-state.entity.ts      # Agent execution tracking
│   │   ├── services/
│   │   │   ├── orchestrator.service.ts   # Analysis workflow coordination
│   │   │   └── calculator.service.ts     # Score calculation
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts      # Request DTO
│   │   │   ├── analysis-response.dto.ts    # Response DTO (Phase 9 UI Format)
│   │   │   ├── analysis-status.dto.ts      # Status tracking
│   │   │   └── category-output.dto.ts      # UI-compatible category DTOs
│   │   ├── types/
│   │   │   └── analysis.types.ts          # Type definitions
│   │   └── agents/              # Category Analysis Agents (Phase 9)
│   │       ├── overall-assessment.agent.ts  # Overall quality assessment
│   │       ├── market-opportunity.agent.ts  # Market potential analysis
│   │       ├── business-model.agent.ts      # Business model evaluation
│   │       ├── team-execution.agent.ts     # Team capability analysis
│   │       ├── financial-projections.agent.ts # Financial validation
│   │       └── competitive-landscape.agent.ts # Competitive positioning
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
| API | 60+ | Business logic (Auth, User, AppConfig, RAG, Analysis, PitchDeck) |
| Agents | 20+ | AI analysis agents and framework |
| Utils | 4 | Shared utilities |
| Test | 8+ | Unit and e2e tests |
| **Total** | **~120+** | **Application code + tests** |

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
├── AnalysisModule (Phase 9 Complete)
│   ├── Category Analysis Agents (6 agents)
│   ├── Entities (AnalysisResult, AnalysisScore, AnalysisFinding, AgentState)
│   ├── Services (Orchestrator, Calculator)
│   ├── UI-compatible DTOs
│   └── MikroOrmModule.forFeature([...])
├── PitchDeckModule
│   └── PitchDeckService → BaseService<PitchDeck>
└── SeederModule
    └── DatabaseSeeder → AppConfigSeeder + UserSeeder
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

### 4. Category Analysis Agents (Phase 9)
Six specialized AI agents for comprehensive pitch deck analysis:
- **Overall Assessment**: Investment readiness and quality
- **Market Opportunity**: Market size and growth potential
- **Business Model**: Revenue streams and viability
- **Team Execution**: Capability and experience assessment
- **Financial Projections**: Validation and risk assessment
- **Competitive Landscape**: Positioning and differentiation

**Agent Workflow**:
1. RAG query for relevant content
2. Category-specific prompt generation
3. LLM analysis with structured output
4. Response parsing and validation
5. UI-compatible format output

### 5. Event & Queue System (Phase 1.5)
Event-driven architecture with BullMQ for async processing:
- **Events**: EventEmitter2 for pitch deck lifecycle events
- **Queue**: BullMQ with Redis for analysis job processing
- **Progress Tracking**: Real-time job status updates
- **Retry Logic**: Exponential backoff for failed jobs

### 6. Agent Framework Architecture
Base agent system with specialized implementations:
- **BaseAgent**: Common functionality, error handling, tool integration
- **Category Agents**: Specialized analysis for each category
- **Tool Integration**: RAG and OpenAI tools for analysis
- **Structured Output**: Type-safe interfaces for UI compatibility

### 7. Middleware Pipeline
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

### 8. Idempotent Seeder Pattern
Database initialization with diff-based updates:
- Enabled via `ENABLE_SEEDER` environment variable
- Compares existing vs. expected state
- Only creates/updates/deletes differences
- OnModuleInit lifecycle hook execution

### 9. Path Alias System
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
- Agent framework reduces duplication

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
| Agent | `*.agent.ts` | `overall-assessment.agent.ts` |
| Prompt | `*.prompt.ts` | `overall-assessment.prompt.ts` |

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

## Analysis Module Details (Phase 9 Complete)

### Core Components
1. **Six Category Agents**:
   - Overall Assessment
   - Market Opportunity
   - Business Model
   - Team Execution
   - Financial Projections
   - Competitive Landscape

2. **UI-Compatible Output**:
   - Category-based structure
   - Impact-based finding classification
   - Structured recommendations
   - Evidence preservation

3. **Enhanced Entities**:
   - AnalysisResult: Main analysis container
   - AnalysisScore: Component scores with weighted algorithm
   - AnalysisFinding: Structured findings with impact/severity
   - AgentState: Agent execution tracking

### Scoring Algorithm
```typescript
weights = {
  overall_assessment: 0.20,    // Quality assessment
  market_opportunity: 0.20,     // Market potential
  business_model: 0.20,        // Viability assessment
  team_execution: 0.20,         // Capability evaluation
  financial_projections: 0.10,   // Financial validation
  competitive_landscape: 0.10   // Positioning analysis
}

overallScore = Σ(categoryScore × weight)
```

### API Contract (Phase 9 Complete)
- **Create Analysis**: `POST /analysis` with CreateAnalysisDto
- **Get Results**: `GET /analysis/:uuid` with AnalysisResponseDto
- **Get UI Results**: `GET /analysis/:uuid/ui` with AnalysisResponseUiDto
- **Status Polling**: `GET /analysis/:uuid/status` with AnalysisStatusDto
- **Category Analysis**: Six specialized agents with structured output

### Phase 9 UI Output Format
- **Category-based Structure**: Six analysis categories with scores (0-100)
- **Finding Classification**: Impact (positive/negative/neutral) and severity (critical/major/minor)
- **Structured Recommendations**: Actionable suggestions for each category
- **Evidence Preservation**: Quote references and slide number mapping
- **UI Compatibility**: Optimized for frontend rendering and user experience

## Agent Framework (Phase 9)

### Base Agent System
```typescript
@Injectable()
export abstract class BaseAgent {
  constructor(protected config: AgentConfig) {}

  abstract performAnalysis(input: AgentInput): Promise<AgentOutput>;

  protected addIntermediateStep(step: string, input: any, output: any): void {}
  protected parseOutput(raw: string): CategoryAnalysisOutput {}
}
```

### Category Agent Implementation
Each category agent extends BaseAgent and implements:
1. **RAG Query**: Retrieve relevant deck content
2. **Prompt Generation**: Create category-specific prompts
3. **LLM Analysis**: Process through OpenAI
4. **Output Parsing**: Validate and format response
5. **Metadata**: Track execution and debugging info

### Output Structure
```typescript
interface CategoryAnalysisOutput {
  category: AnalysisCategory;
  score: number; // 0-100
  summary: string; // 2-3 sentences
  findings: CategoryFinding[];
  metadata: {
    executionTime: number;
    agent: string;
    findingCount: number;
  };
}
```

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

### Phase 9 Implementation Complete ✅
- UI-compatible output format implementation
- Six category analysis agents with specialized prompts
- Enhanced response DTOs for frontend consumption
- Category-based findings with impact/severity classification
- Structured recommendations and evidence preservation
- Backward compatibility maintained with legacy endpoints

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
15. Should we implement real-time analysis updates?
16. What's the strategy for LLM prompt optimization?
17. How to handle category weight customization per user?
18. Should we add industry-specific analysis models?

## Documentation References

- [API Documentation](./api-docs-category-analysis.md) - Complete API reference
- [Analysis Agents](./analysis-agents.md) - Agent framework documentation
- [Phase 9 Summary](./phase-9-completion-summary.md) - Implementation details
- [Project Overview](./project-overview-pdr.md) - Product requirements