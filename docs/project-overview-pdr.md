# Project Overview & Product Development Requirements

## Project Identity

**Name**: RAG Backend API
**Framework**: NestJS v11
**Language**: TypeScript 5.3.3
**Architecture**: Clean Architecture with Repository Pattern
**Primary Use Case**: Retrieval-Augmented Generation (RAG) backend service with blockchain authentication

## Product Vision

Enterprise-grade backend service combining traditional web2 authentication with web3 capabilities, providing RAG functionality through LangChain integration with Datastax Astra vector database.

## Core Capabilities

### 1. Authentication & Authorization
- **Traditional Auth**: JWT-based authentication with bcrypt password hashing
- **Web3 Auth**: Sign-In with Ethereum (SIWE) for wallet-based authentication
- **Session Management**: Redis-backed session storage with configurable TTL
- **Route Protection**: JWT auth guards with current user injection

### 2. Data Layer Flexibility
- **Multi-Database**: Runtime-switchable between MongoDB and PostgreSQL
- **ORM**: MikroORM v6 with entity management
- **Caching**: Redis primary with in-memory fallback
- **Transactions**: Built-in transactional write operations

### 3. RAG Infrastructure
- **Vector Database**: Datastax Astra DB with 1536-dim embeddings
- **LangChain**: Complete orchestration pipeline
- **Document Processing**: Ingest, query, delete with filtering
- **Vector Operations**: Cosine similarity search with scoring
- **Lifecycle Management**: OnModuleInit/Destroy hooks
- **Health Monitoring**: Real-time system status endpoints

### 4. Developer Experience
- **API Documentation**: Auto-generated Swagger/OpenAPI
- **Hot Reload**: Watch mode for development
- **Testing**: Jest with unit/integration/e2e support
- **Linting**: ESLint + Prettier configured

## Technical Requirements

### Functional Requirements

#### FR1: User Management
- Create, read, update, delete user accounts
- Password hashing with configurable salt rounds
- Username-based identification
- Profile updates via authenticated endpoints

#### FR2: Authentication Flow
- Local strategy: username/password login
- JWT strategy: Bearer token validation
- SIWE strategy: Ethereum wallet signature verification
- Token expiration and refresh handling

#### FR3: Application Configuration
- Dynamic key-value configuration storage
- Public/private configuration visibility flags
- Seeder-based initialization with diff updates
- Runtime configuration retrieval

#### FR4: RAG Operations
- Vector-based document retrieval with similarity search
- LangChain orchestration for LLM interactions
- Astra DB vector similarity search (cosine metric, 1536 dimensions)
- Context augmentation for responses
- Document ingestion, query, and deletion operations
- Metadata filtering and score thresholding
- Health check and monitoring endpoints

### Non-Functional Requirements

#### NFR1: Performance
- **Response Time**: API endpoints <200ms (excluding LLM calls)
- **Caching**: Redis TTL-based caching for frequent queries
- **Database Connection**: Pooled connections with EntityManager caching
- **Memory Usage**: Hardware monitoring and logging

#### NFR2: Scalability
- **Horizontal Scaling**: Stateless design with Redis session store
- **Database Sharding**: MongoDB/PostgreSQL support for future sharding
- **Container-Ready**: Docker + Docker Compose deployment
- **Cloud-Native**: AWS EC2 deployment with Terraform

#### NFR3: Security
- **Password Hashing**: bcrypt with configurable rounds
- **JWT Signing**: Secret-based token signing
- **CORS**: Configurable cross-origin policies
- **Environment Isolation**: Secrets via AWS Secrets Manager
- **Input Validation**: NestJS validation pipes

#### NFR4: Maintainability
- **Code Reusability**: BaseService/BaseEntity patterns
- **Type Safety**: Full TypeScript with strict mode
- **Path Aliases**: Clean imports (@core, @api, @utils)
- **Testing Coverage**: Unit, integration, and e2e tests
- **Documentation**: Swagger auto-generation

#### NFR5: Observability
- **Request Logging**: HTTP middleware with method/path/status
- **Memory Monitoring**: Hardware utility logging at startup
- **Error Handling**: Global exception filter with structured responses
- **Environment Awareness**: NODE_ENV-based behavior

## System Constraints

### Technical Constraints
- **Node Runtime**: v18 or v20 required
- **Database**: MongoDB (primary) or PostgreSQL only
- **Cache**: Redis required for production (in-memory fallback for dev)
- **Build Tool**: pnpm package manager

### Deployment Constraints
- **Environment**: AWS EC2 (t3.micro minimum)
- **Region**: ap-southeast-1 (Singapore) for UAT
- **Container Runtime**: Docker required
- **Infrastructure**: Terraform for UAT provisioning

### External Dependencies
- **OpenAI API**: For LLM integration and embeddings (text-embedding-ada-002)
- **Datastax Astra**: For vector database (collection-based document storage)
- **AWS Secrets Manager**: For production secrets
- **GitHub**: Source control and CI/CD

## Success Metrics

### Development Metrics
- **Build Time**: <2 minutes for full rebuild
- **Test Coverage**: >80% for core services
- **Lint Errors**: Zero on main branch
- **Type Safety**: No `any` types in core modules

### Operational Metrics
- **Uptime**: 99.9% availability
- **API Latency**: p95 <500ms (excluding LLM)
- **Error Rate**: <0.1% for 5xx errors
- **Memory Footprint**: <512MB base usage

### Business Metrics
- **Onboarding Time**: New developer productive in <4 hours
- **Deployment Time**: <10 minutes from commit to live
- **Bug Resolution**: P0/P1 bugs fixed within 24 hours
- **Documentation Coverage**: All public APIs documented

## Implementation Phases

### Phase 1: Foundation (Complete)
- ✅ NestJS boilerplate with TypeScript
- ✅ Multi-database support (MongoDB/PostgreSQL)
- ✅ Redis caching layer
- ✅ JWT authentication
- ✅ SIWE blockchain authentication
- ✅ Base CRUD patterns
- ✅ Swagger documentation
- ✅ Docker containerization

### Phase 2: RAG Integration (Complete ✅)
- ✅ LangChain pipeline setup
- ✅ Datastax Astra vector store
- ✅ Document ingestion endpoints
- ✅ Query/retrieval endpoints
- ✅ Context window management
- ✅ Vector similarity search
- ✅ Lifecycle hooks for database management
- ✅ Comprehensive DTOs with validation

### Phase 4: Controller and API Implementation (Completed ✅)
- ✅ REST API endpoints (ingest, query, delete, health)
- ✅ DTO validation and request/response schemas
- ✅ Swagger/OpenAPI documentation
- ✅ Global exception handling
- ✅ Comprehensive error handling
- ✅ Structured logging

### Phase 5: Module Integration (Completed ✅)
- ✅ RagModule registration in app.module.ts
- ✅ Module lifecycle hooks (onModuleInit)
- ✅ Complete RAG service integration
- ✅ Production-ready configuration
- ✅ Error handling and logging
- ✅ Health monitoring endpoints

### Phase 3: Production Hardening (Future)
- 📋 Rate limiting and throttling
- 📋 Advanced monitoring and alerting
- 📋 Automated backups
- 📋 Load testing and optimization

### Phase 6: Advanced Features (Future)
- 📋 Multi-tenancy support
- 📋 Webhook integrations
- 📋 Advanced RBAC
- 📋 Audit logging
- 📋 Analytics and reporting

## Risk Assessment

### High Risk
- **LLM Cost Overruns**: OpenAI API costs scale with usage
  - *Mitigation*: Implement request quotas and caching strategies

- **Vector DB Performance**: Astra DB latency impacts user experience
  - *Mitigation*: Aggressive caching, connection pooling

### Medium Risk
- **Database Migration**: MongoDB/PostgreSQL switching complexity
  - *Mitigation*: Abstraction via MikroORM, thorough testing

- **Authentication Security**: JWT/SIWE vulnerabilities
  - *Mitigation*: Regular dependency updates, security audits

### Low Risk
- **Deployment Complexity**: Docker/Terraform learning curve
  - *Mitigation*: Comprehensive documentation, runbooks

## Open Questions

1. **RAG Performance**: What is acceptable latency for LLM-augmented responses?
2. **Scaling Strategy**: At what user count do we need horizontal scaling?
3. **Cost Model**: What is the budget for OpenAI API and Astra DB?
4. **Multi-Tenancy**: Do we need tenant isolation at database level?
5. **Backup Strategy**: What is the RPO/RTO for data recovery?
6. **Monitoring**: Which APM tool (DataDog, New Relic, open-source)?
7. **Feature Flags**: Do we need runtime feature toggling?

## References

- NestJS Documentation: https://docs.nestjs.com
- MikroORM Guide: https://mikro-orm.io
- LangChain Docs: https://js.langchain.com
- SIWE Specification: https://eips.ethereum.org/EIPS/eip-4361
