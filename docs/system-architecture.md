# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  (Web/Mobile Apps, CLI Tools, Third-party Integrations)        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Load Balancer                  │
│                   (CORS, Rate Limiting, TLS)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NestJS Application                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │    Auth      │     User     │  AppConfig   │     RAG      │ │
│  │   Module     │   Module     │   Module     │   Module     │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Core Infrastructure Layer                    │ │
│  │  (Guards, Filters, Middlewares, Base Services)           │ │
│  └───────────────────────────────────────────────────────────┘ │
└────┬────────────────┬────────────────┬─────────────────────────┘
     │                │                │
     ▼                ▼                ▼
┌──────────┐   ┌──────────┐   ┌──────────────┐
│ MongoDB/ │   │  Redis   │   │ Datastax     │
│PostgreSQL│   │  Cache   │   │ Astra Vector │
└──────────┘   └──────────┘   └──────────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │  OpenAI API  │
                              │  (LLM/GPT)   │
                              └──────────────┘
```

## Technology Stack

### Application Layer
- **Runtime**: Node.js v18/v20
- **Framework**: NestJS v11 (Express-based)
- **Language**: TypeScript 5.3.3 (ES2020)
- **Package Manager**: pnpm
- **Validation**: class-validator, class-transformer

### Data Layer
- **Primary Database**: MongoDB (document store)
- **Alternative Database**: PostgreSQL (relational)
- **ORM**: MikroORM v6 with Mongoose
- **Cache**: Redis (ioredis) with in-memory fallback
- **Vector Database**: Datastax Astra DB

### Authentication & Security
- **Strategies**: JWT, Local (bcrypt), SIWE (Ethereum)
- **Framework**: Passport.js
- **Hashing**: bcrypt with configurable rounds
- **Blockchain**: ethers.js, viem

### RAG & AI
- **Orchestration**: LangChain (core, community, openai)
- **LLM Provider**: OpenAI GPT
- **Vector Store**: Datastax Astra DB
- **Embeddings**: OpenAI text-embedding-ada-002

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **IaC**: Terraform (AWS EC2 provisioning)
- **Cloud Provider**: AWS (EC2, Secrets Manager)
- **CI/CD**: GitHub Actions
- **Region**: ap-southeast-1 (Singapore)

## Request Flow Architecture

### 1. Authentication Flow (JWT)

```
Client
  │
  │ POST /auth/login { username, password }
  ▼
LoggerMiddleware (logs request)
  ▼
LocalStrategy
  │
  ├─► UserService.findByUsername(username)
  │   └─► MongoDB/PostgreSQL
  │
  ├─► bcrypt.compare(password, hashedPassword)
  │   └─► ✓ Valid / ✗ Invalid
  │
  └─► JwtService.sign({ userId, username })
      └─► Returns { access_token: "eyJ..." }
```

### 2. Authentication Flow (SIWE - Ethereum Wallet)

```
Client
  │
  │ POST /auth/signIn { message, signature }
  ▼
SiweService
  │
  ├─► parseSiweMessage(message)
  │   └─► Validate chain, address, nonce
  │
  ├─► verifySignature(message, signature)
  │   └─► viem.verifyMessage()
  │
  ├─► UserService.findByWalletAddress(address)
  │   └─► MongoDB/PostgreSQL
  │
  └─► JwtService.sign({ userId, walletAddress })
      └─► Returns { access_token: "eyJ..." }
```

### 3. Protected Resource Access

```
Client
  │
  │ GET /users/me
  │ Authorization: Bearer eyJ...
  ▼
LoggerMiddleware
  ▼
JwtMiddleware
  │
  ├─► Extract token from header
  ├─► Parse "Bearer {token}"
  └─► Attach to request.headers['authorization']
  ▼
JwtAuthGuard
  │
  ├─► JwtStrategy.validate(payload)
  │   └─► UserService.findById(payload.userId)
  │       └─► MongoDB/PostgreSQL
  │
  └─► Set request.user = userEntity
  ▼
UserController.getCurrentUser(@CurrentUser() user)
  │
  └─► UserInterceptor (remove sensitive fields)
      └─► Returns sanitized user object
```

### 4. RAG Service Layer (Phase 3 Implementation)

#### Service Architecture Pattern
```
RagModule
  │
  ├─► RagService implements OnModuleInit/Destroy
  │   ├─► Connection Management (AstraDB/Embeddings)
  │   ├─► Lifecycle Management (initialize/cleanup)
  │   ├─► Error Handling (try/catch with specific exceptions)
  │   └─► Health Check (lightweight validation)
  │
  └─► RagController
        ├─► Document Ingest (ingestDocuments)
        ├─► Similarity Search (queryDocuments)
        ├─► Document Deletion (deleteDocuments)
        └─► Health Endpoint (healthCheck)
```

#### RAG Service Implementation Patterns

**1. Initialization Pattern**:
```typescript
@Injectable()
export class RagService implements OnModuleDestroy {
  private vectorStore: AstraDBVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    // Initialize vector store and embeddings
    // Validate required configuration
    // Set initialization flag
  }
}
```

**2. Document Ingestion**:
```typescript
async ingestDocuments(documents: IngestDocument[]): Promise<IngestResult> {
  this.ensureInitialized();

  // Convert to LangChain Document format
  // Add metadata with timestamp
  // Return ingestion results with IDs
}
```

**3. Vector Store Integration**:
- **Connection**: Uses `AstraDBVectorStore.fromExistingIndex()`
- **Configuration**: Environment-based settings:
  - `astradb.token` - AstraDB authentication
  - `astradb.endpoint` - Database endpoint
  - `astradb.collection` - Vector collection name
  - `openai.apiKey` - OpenAI API key
  - `openai.embeddingModel` - Embedding model (default: text-embedding-ada-002)
- **Vector Dimensions**: 1536 (OpenAI embeddings)
- **Similarity Metric**: Cosine distance

**4. Health Check Strategy (Lightweight)**:
```typescript
async healthCheck(): Promise<RagHealthStatus> {
  // Check initialization status
  // Avoid expensive operations (e.g., similaritySearch)
  // Sanitize error messages for production
  // Return collection status and timestamp
}
```

**5. Resource Cleanup**:
```typescript
async onModuleDestroy(): Promise<void> {
  // Clear vector store reference
  // Clear embeddings reference
  // Reset initialization flag
}
```

#### Query Flow (Updated)
```
Client
  │
  │ POST /rag/query { query: "What is...?", topK: 5, filter: {...} }
  ▼
QueryDocumentDto (Validation)
  │
  ├─► @IsNotEmpty() @MaxLength(1000) query: string
  ├─► @Min(1) @Max(100) topK: number (default: 5)
  ├─► @IsOptional() scoreThreshold: number (0-1)
  └─► @ValidateNested() filter?: DocumentFilterDto
  ▼
RagController
  ▼
RagService (initialized with lifecycle management)
  │
  ├─► ensureInitialized() - Validate service ready
  ├─► OpenAI Embeddings (1536-dim vector)
  ├─► AstraDB similaritySearchWithScore()
  │   └─► Returns documents with relevance scores
  │
  └─► Returns QueryResult[] with sanitized output
```

## Database Architecture

### Multi-Database Support

**MongoDB Schema** (Document-based):
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "password": "$2b$10$...", // bcrypt hash
  "createdAt": ISODate("2026-02-03T09:58:24Z"),
  "updatedAt": ISODate("2026-02-03T09:58:24Z")
}
```

**PostgreSQL Schema** (Relational):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- bcrypt hash
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Switching Mechanism**:
```typescript
// config/database.ts
export class DatabaseConfig {
  static createMikroOrmOptions(): Options {
    const dbType = process.env.DB_TYPE || 'mongodb';

    if (dbType === 'mongodb') {
      return {
        driver: MongoDriver,
        clientUrl: process.env.MONGO_URI,
        // ...
      };
    }

    return {
      driver: PostgreSqlDriver,
      host: process.env.POSTGRES_HOST,
      // ...
    };
  }
}
```

### Caching Strategy

**Redis Cache Architecture**:
```
Request
  │
  ▼
CacheInterceptor (if configured)
  │
  ├─► Check Redis for key
  │   ├─► Cache HIT → Return cached data
  │   └─► Cache MISS
  │       ├─► Execute controller method
  │       ├─► Store result in Redis (TTL: REDIS_TTL)
  │       └─► Return fresh data
  │
  └─► Response
```

**Fallback to In-Memory**:
- Development: Uses in-memory cache if `REDIS_URL` not set
- Production: Requires Redis for horizontal scaling

## Deployment Architecture

### Docker Containerization

**Dockerfile Structure**:
```dockerfile
FROM node:18                    # Base image
WORKDIR /app                    # Working directory
COPY package*.json ./           # Copy dependencies
RUN npm ci                      # Install production deps
COPY . .                        # Copy source code
RUN npm run build               # Compile TypeScript
CMD ["node", "dist/main.js"]    # Start application
```

**docker-compose.yml Services**:
```yaml
services:
  nestjs:
    build: .
    ports: ["3000:3000"]
    depends_on: [mongo]
    env_file: .env

  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo-data:/data/db"]
```

### AWS Infrastructure (Terraform)

**EC2 Instance**:
- **Type**: t3.micro (2 vCPU, 1GB RAM)
- **OS**: Ubuntu 24.04 LTS
- **Region**: ap-southeast-1
- **Storage**: 20GB gp3 EBS
- **Security Group**: SSH (22), HTTP (80), HTTPS (443), App (3000)

**User Data Bootstrap**:
```bash
#!/bin/bash
apt update && apt install -y docker.io docker-compose
git clone <repo-url> /app
cd /app
docker-compose up -d --build
```

**IAM Role Permissions**:
- `secretsmanager:GetSecretValue` - Fetch environment secrets
- `ec2:DescribeInstances` - Self-introspection

### CI/CD Pipeline

**GitHub Actions Workflow (build.yml)**:
```yaml
name: CI
on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run test
      - run: pnpm run build
```

**Deployment Workflow (deploy.yml)**:
```yaml
name: Deploy
on: workflow_dispatch  # Manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: SSH to EC2
        run: |
          ssh ec2-user@${{ secrets.EC2_HOST }} << 'EOF'
            cd /app
            git pull origin main
            docker-compose down
            docker-compose up -d --build
          EOF
```

## Security Architecture

### Authentication Layers

1. **Password-Based (Local Strategy)**:
   - bcrypt hashing (configurable rounds via `SALT_ROUND`)
   - Rainbow table protection
   - Timing-attack resistant comparison

2. **JWT Token Security**:
   - HMAC-SHA256 signing with `JWT_SECRET`
   - Configurable expiration (`JWT_EXPIRATION`)
   - Stateless validation (no database lookup)

3. **Blockchain Authentication (SIWE)**:
   - EIP-4361 compliant message signing
   - Nonce-based replay protection
   - Chain ID validation
   - Signature verification via viem/ethers

### Data Protection

**Sensitive Field Exclusion**:
```typescript
@Entity()
export class User extends BaseEntity {
  @Property({ hidden: true })  // Excluded from API responses
  password: string;
}
```

**CORS Configuration**:
```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
});
```

**Environment Variable Isolation**:
- Development: `.env` file (git-ignored)
- Production: AWS Secrets Manager
- CI/CD: GitHub Secrets
- RAG Configuration:
  - `ASTRA_DB_ENDPOINT` - Datastax Astra database endpoint
  - `ASTRA_DB_APPLICATION_TOKEN` - Authentication token for Astra
  - `ASTRA_DB_COLLECTION` - Collection name for vector documents (default: 'documents')
  - `OPENAI_API_KEY` - OpenAI API key for embeddings
  - `OPENAI_EMBEDDING_MODEL` - Embedding model name (default: 'text-embedding-ada-002')

**Vector Database Details**:
  - Embedding dimensions: 1536 (OpenAI text-embedding-ada-002)
  - Similarity metric: Cosine distance
  - Index type: HNSW (Hierarchical Navigable Small World)
  - Batch operations: Supported for ingestion/deletion

## Scalability Considerations

### Horizontal Scaling

**Stateless Design**:
- JWT tokens (no session storage needed)
- Redis for shared cache (multi-instance)
- Database connection pooling

**Load Balancing Ready**:
```
          ┌──► NestJS Instance 1 ─┐
          │                       │
Client ──► LB                     ├──► MongoDB
          │                       │
          └──► NestJS Instance 2 ─┘
               (Shared Redis)
```

### Performance Optimizations

1. **EntityManager Caching**:
   - BaseService caches MikroORM EntityManager
   - Reduces connection overhead

2. **Redis Caching**:
   - TTL-based cache invalidation
   - Configured via `REDIS_TTL` environment variable

3. **Connection Pooling**:
   - MongoDB: Default pool size 10
   - PostgreSQL: Configurable pool via MikroORM

4. **Lazy Loading**:
   - MikroORM lazy loading for relations
   - Prevents N+1 query problems

## Monitoring & Observability

### Logging Architecture

**Request Logging** (LoggerMiddleware):
```
[HTTP] GET /users/me 200 - 45ms
[HTTP] POST /auth/login 401 - 120ms
```

**Memory Monitoring** (main.ts):
```
[Memory] 256.5 MB / 512 MB (50%)
```

**Error Tracking** (HttpExceptionFilter):
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2026-02-03T09:58:24.000Z",
  "path": "/api/rag/query",
  "stack": "Error: Connection timeout..."
}
```

## Vector Store Integration Architecture

### Astra DB Vector Store Configuration

**Initialization Parameters**:
```typescript
this.vectorStore = await AstraDBVectorStore.fromExistingIndex(
  this.embeddings,
  {
    token: astraToken,
    endpoint: astraEndpoint,
    collection: collectionName,
    collectionOptions: {
      vector: {
        dimension: 1536,          // OpenAI embedding dimensions
        metric: 'cosine',         // Similarity metric
      },
    },
  },
);
```

**Vector Operations**:
1. **Document Ingestion**:
   - Convert to LangChain Document format
   - Add metadata with timestamps
   - Batch processing for efficiency

2. **Similarity Search**:
   - `similaritySearchWithScore(query, topK, filter)`
   - Returns documents with relevance scores
   - Supports metadata filtering

3. **Document Deletion**:
   - Delete by specific IDs
   - Delete by metadata filters
   - Batch deletion support

**Performance Considerations**:
- Connection pooling through MikroORM
- Lazy loading for large document sets
- Caching for repeated queries
- Index optimization for vector search

### LangChain Integration

**Document Processing Pipeline**:
```typescript
const langchainDocs = documents.map(
  (doc) =>
    new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        createdAt: new Date().toISOString(), // Auto-timestamp
      },
    }),
);
```

**Embedding Configuration**:
```typescript
this.embeddings = new OpenAIEmbeddings({
  openAIApiKey: openaiApiKey,
  modelName: embeddingModel || 'text-embedding-ada-002',
});
```

## Security Enhancements (Phase 3)

### Error Handling Improvements

**1. Error Sanitization**:
```typescript
// Production: Generic error messages
return {
  status: 'unhealthy',
  error: 'Service unavailable', // No internal details
};

// Development: Detailed error messages
return {
  status: 'unhealthy',
  error: error instanceof Error ? error.message : 'Unknown error',
};
```

**2. Exception Handling**:
```typescript
try {
  // RAG operation
} catch (error) {
  this.logger.error('Operation failed', error);
  if (error instanceof BadRequestException) {
    throw error; // Re-throw known exceptions
  }
  throw new InternalServerErrorException('Operation failed');
}
```

**3. Input Validation**:
```typescript
// DTO validation with class-validator
@IsNotEmpty()
@MaxLength(1000)
query: string;

@Min(1)
@Max(100)
topK: number;
```

### Logging Strategy

**1. Structured Logging**:
```typescript
this.logger.log(`Ingesting documents`);
this.logger.log(`Found ${queryResults.length} matching documents`);
this.logger.error('Failed to ingest documents', error);
```

**2. Log Sanitization**:
- No sensitive data in logs
- Generic error messages in production
- Detailed debugging in development

**3. Performance Monitoring**:
- Request/response timing
- Memory usage tracking
- Error rate metrics

## API Documentation

### RAG Module Endpoints

The RAG module provides four RESTful endpoints for document ingestion, querying, and management:

#### 1. POST /rag/ingest - Ingest Documents
**Purpose**: Upload documents to the vector store for retrieval-augmented generation.

**Request Body**:
```typescript
{
  documents: DocumentDto[]
}
```

**Authentication**: Optional (JWT not required for ingestion)

**Response** (201 Created):
```typescript
{
  success: boolean;
  documentIds: string[];
  count: number;
}
```

**Swagger Documentation**: Comprehensive endpoint documentation with request/response examples.

#### 2. POST /rag/query - Query Documents
**Purpose**: Search for similar documents using semantic similarity.

**Request Body**:
```typescript
{
  query: string;
  topK?: number;        // Default: 5
  filter?: DocumentFilterDto;
  scoreThreshold?: number; // Optional similarity score filter (0-1)
}
```

**Authentication**: Optional (JWT not required for querying)

**Response** (200 OK):
```typescript
QueryResult[]
```

**Swagger Documentation**: Detailed parameter validation and response schema documentation.

#### 3. DELETE /rag/documents - Delete Documents
**Purpose**: Remove documents by IDs or apply filter-based deletion.

**Request Body**:
```typescript
{
  ids?: string[];      // Specific document IDs to delete
  filter?: DocumentFilterDto; // Filter criteria for deletion
}
```

**Authentication**: Optional (JWT not required for deletion)

**Response** (200 OK):
```typescript
{
  success: boolean;
  deletedCount: number;
}
```

**Swagger Documentation**: Clear examples of both ID-based and filter-based deletion patterns.

#### 4. GET /rag/health - Health Check
**Purpose**: Verify RAG service availability and vector store connection.

**Authentication**: None required

**Response** (200 OK):
```typescript
{
  status: 'healthy' | 'unhealthy';
  collection: string;
  timestamp: string;
}
```

**Swagger Documentation**: Standard health check response with status indicators.

### Authentication Strategy
**Design Decision**: All RAG endpoints are intentionally public (no JWT required) for maximum flexibility in RAG implementations. Authentication can be implemented at the API gateway level if needed.

### Swagger Integration
- **@ApiTags('rag')**: Groups all RAG endpoints under 'rag' tag
- **@ApiOperation**: Provides clear endpoint descriptions
- **@ApiResponse**: Documented response codes and example payloads
- **Global Exception Handling**: HttpExceptionFilter ensures consistent error responses

### Error Handling Patterns
- Validation errors throw 400 Bad Request
- Vector store errors throw 500 Internal Server Error
- Invalid operations throw 422 Unprocessable Entity
- All errors include structured error messages in response body

## Unresolved Architecture Questions

1. **Multi-Tenancy**: How to isolate data per organization?
2. **Rate Limiting**: What are the request quotas per endpoint?
3. **CDN Strategy**: Should static assets use CloudFront?
4. **Database Sharding**: At what scale do we shard MongoDB?
5. **Disaster Recovery**: What is the backup/restore strategy?
6. **Monitoring Tools**: APM choice (DataDog, New Relic, Prometheus)?
7. **Service Mesh**: Do we need Istio/Linkerd for microservices?
8. **API Versioning**: How to handle breaking API changes?
9. **WebSockets**: Is real-time communication needed for RAG?
10. **Message Queue**: Do we need RabbitMQ/SQS for async jobs?
