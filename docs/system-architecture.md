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

### 4. RAG Query Flow

```
Client
  │
  │ POST /rag/query { question: "What is...?" }
  ▼
RagService
  │
  ├─► OpenAI Embeddings API
  │   └─► text-embedding-ada-002(question)
  │       └─► Returns vector [0.123, 0.456, ...]
  │
  ├─► Datastax Astra DB Vector Search
  │   └─► findSimilarVectors(vector, k=5)
  │       └─► Returns top 5 matching documents
  │
  ├─► LangChain Context Assembly
  │   └─► Combine retrieved docs + question
  │
  ├─► OpenAI GPT API
  │   └─► chat.completions.create({
  │         model: "gpt-4",
  │         messages: [context + question]
  │       })
  │
  └─► Returns augmented response
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
  - `ASTRA_DB_COLLECTION` - Collection name (default: 'documents')
  - `OPENAI_API_KEY` - OpenAI API key for embeddings
  - `OPENAI_EMBEDDING_MODEL` - Model name (default: 'text-embedding-ada-002')

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
