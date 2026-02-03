# Codebase Summary

## Overview

**Total TypeScript Files**: 41
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
│   │       └── scripts/
│   │           └── app-config.seeder.ts  # Diff-based config updates
│   ├── decorators/
│   │   └── current-user.decorator.ts  # @CurrentUser() param decorator
│   ├── docs/
│   │   └── swagger.ts             # Swagger/OpenAPI setup
│   ├── filter/
│   │   └── http-exception.filter.ts  # Global error handler
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
├── api/                            # Business logic layer (16 files)
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
│   └── app-config/                # Dynamic config module (4 files)
│       ├── app-config.service.ts  # extends BaseService<AppConfig>
│       ├── app-config.controller.ts  # Config CRUD endpoints
│       ├── app-config.module.ts   # Module definition
│       └── entities/
│           └── app-config.entity.ts  # key/value/isPublic fields
└── utils/                          # Shared utilities (5 files)
    ├── hardware.util.ts            # Memory usage formatter
    ├── array.util.ts               # Seeder diff helpers
    └── decimal.util.ts             # Decimal.js precision math wrapper
```

## File Count by Layer

| Layer | Files | Purpose |
|-------|-------|---------|
| Root | 3 | Bootstrap, configuration, app module |
| Core | 17 | Infrastructure, guards, filters, base classes |
| API | 16 | Business logic (Auth, User, AppConfig) |
| Utils | 5 | Shared utilities |
| **Total** | **41** | **Application code** |

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

### 3. Middleware Pipeline
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

### 4. Idempotent Seeder Pattern
Database initialization with diff-based updates:
- Enabled via `ENABLE_SEEDER` environment variable
- Compares existing vs. expected state
- Only creates/updates/deletes differences
- OnModuleInit lifecycle hook execution

### 5. Path Alias System
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

## Testing Structure

```
test/
├── app.e2e-spec.ts          # End-to-end tests
├── jest-e2e.json            # E2E Jest config
└── *.spec.ts                # Unit tests (co-located with source)
```

**Testing Commands**:
- `npm run test` - Unit tests
- `npm run test:watch` - Watch mode
- `npm run test:cov` - Coverage report
- `npm run test:e2e` - End-to-end tests

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

## Unresolved Questions

1. Where is the actual RAG implementation code? (Only dependencies present)
2. Are there scheduled jobs/cron tasks? (No evidence in scout report)
3. What is the migration strategy for database schema changes?
4. How are environment-specific configs handled beyond .env?
5. Is there a rate limiting implementation?
