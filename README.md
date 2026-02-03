# RAG Backend API

Enterprise-grade NestJS backend service combining traditional web2 authentication with web3 capabilities, providing Retrieval-Augmented Generation (RAG) functionality through LangChain integration with Datastax Astra vector database.

## Features

- 🔐 **Multi-Auth**: JWT, bcrypt password hashing, SIWE (Sign-In with Ethereum)
- 🗄️ **Flexible Database**: Runtime-switchable MongoDB/PostgreSQL via MikroORM
- ⚡ **Redis Caching**: High-performance caching with in-memory fallback
- 🤖 **RAG Pipeline**: LangChain + OpenAI + Datastax Astra vector database
- 📚 **Auto-Generated API Docs**: Swagger/OpenAPI documentation
- 🐳 **Docker Ready**: Containerized deployment with docker-compose
- 🏗️ **Infrastructure as Code**: Terraform AWS EC2 provisioning
- ✅ **Testing**: Jest with unit, integration, and e2e tests

## Quick Start

### Prerequisites

- Node.js v18 or v20
- pnpm package manager
- MongoDB or PostgreSQL
- Redis (optional for development)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp env.example .env

# Configure your .env file
# Edit .env with your database credentials and secrets
```

### Running the Application

```bash
# Development mode with hot reload
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

Access the API:
- **Application**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── config/                    # Environment configuration
├── core/                      # Infrastructure layer
│   ├── base/                  # Base entity & service (CRUD)
│   ├── database/              # MikroORM + seeder
│   ├── decorators/            # Custom decorators (@CurrentUser)
│   ├── docs/                  # Swagger setup
│   ├── filter/                # Global exception filter
│   ├── guard/                 # JWT auth guard
│   ├── middlewares/           # Logger, JWT middleware
│   ├── modules/redis/         # Redis service wrapper
│   └── pipe/                  # Custom pipes (ObjectId)
├── api/                       # Business logic layer
│   ├── auth/                  # Authentication (JWT, Local, SIWE)
│   ├── user/                  # User management
│   └── app-config/            # Dynamic configuration
└── utils/                     # Shared utilities
```

## Environment Configuration

Key environment variables (see `env.example` for full list):

```bash
# Application
APP_PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
SALT_ROUND=10

# Database (choose one)
DB_TYPE=mongodb              # or 'postgresql'
MONGO_URI=mongodb://localhost:27017/rag-db

# PostgreSQL (if using)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=rag_db

# Cache
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# RAG Configuration
ASTRA_DB_ENDPOINT=https://<db-id>-<region>.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:xxxxx
ASTRA_DB_COLLECTION=documents
OPENAI_API_KEY=sk-xxxxx
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Seeding
ENABLE_SEEDER=true
```

## Development

### Available Scripts

```bash
# Development
pnpm run start:dev           # Watch mode with hot reload
pnpm run start:debug         # Debug mode

# Building
pnpm run build               # Compile TypeScript

# Code Quality
pnpm run format              # Format with Prettier
pnpm run lint                # Lint with ESLint
pnpm run lint --fix          # Auto-fix linting issues

# Testing
pnpm run test                # Run unit tests
pnpm run test:watch          # Watch mode
pnpm run test:cov            # Coverage report
pnpm run test:e2e            # End-to-end tests
```

### Code Standards

This project follows **YAGNI/KISS/DRY** principles:

- **BaseService Pattern**: All services extend `BaseService<T>` for automatic CRUD operations
- **Path Aliases**: Use `@core/*`, `@api/*`, `@utils/*` for clean imports
- **TypeScript Strict Mode**: Full type safety with no implicit any
- **NestJS Best Practices**: Dependency injection, module organization, decorators

See [docs/code-standards.md](docs/code-standards.md) for detailed guidelines.

## API Documentation

Once the application is running, access interactive API documentation at:

**http://localhost:3000/api**

### Authentication Endpoints

```bash
# Local authentication (username/password)
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}

# SIWE authentication (Ethereum wallet)
POST /auth/signIn
Content-Type: application/json

{
  "message": "localhost wants you to sign in...",
  "signature": "0x..."
}
```

### Protected Endpoints

```bash
# Get current user (requires JWT token)
GET /users/me
Authorization: Bearer <your_jwt_token>
```

## Database Seeding

Enable automatic database initialization:

```bash
# In .env
ENABLE_SEEDER=true
```

The seeder uses **diff-based updates** to idempotently initialize configuration data without duplicates.

## Infrastructure Deployment

### Terraform (AWS EC2)

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan infrastructure changes
terraform plan -var-file="uat.tfvars"

# Apply infrastructure
terraform apply -var-file="uat.tfvars"
```

**Provisions**:
- EC2 t3.micro instance (Singapore region)
- Security groups (SSH, HTTP, HTTPS, App)
- IAM role with Secrets Manager access
- Auto-installed Docker runtime

### CI/CD Pipeline

GitHub Actions workflows:

- **build.yml**: Runs on push/PR to `dev` or `main` (lint, test, build)
- **deploy.yml**: Manual deployment to EC2 via SSH

## Testing

```bash
# Unit tests (co-located with source files)
pnpm run test

# Watch mode for TDD
pnpm run test:watch

# Coverage report (outputs to coverage/)
pnpm run test:cov

# End-to-end tests
pnpm run test:e2e
```

## Architecture

### Multi-Database Support

Switch between MongoDB and PostgreSQL at runtime:

```bash
# MongoDB (default)
DB_TYPE=mongodb
MONGO_URI=mongodb://localhost:27017/rag-db

# PostgreSQL
DB_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=rag_db
```

All services use MikroORM abstractions—no code changes required.

### Authentication Strategies

1. **JWT Strategy**: Bearer token validation for API access
2. **Local Strategy**: Username/password with bcrypt hashing
3. **SIWE Strategy**: Ethereum wallet signature verification (EIP-4361)

### Caching Strategy

- **Production**: Redis with configurable TTL
- **Development**: In-memory cache fallback
- **Invalidation**: TTL-based expiration

## Documentation

Comprehensive documentation available in the `docs/` directory:

- [Project Overview & PDR](docs/project-overview-pdr.md) - Vision, requirements, success metrics
- [Codebase Summary](docs/codebase-summary.md) - File organization, module dependencies
- [Code Standards](docs/code-standards.md) - Coding conventions, best practices
- [System Architecture](docs/system-architecture.md) - Infrastructure, deployment, security

## Troubleshooting

### Common Issues

**Port already in use**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**MongoDB connection failed**:
```bash
# Start MongoDB locally
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 mongo:7
```

**Redis connection failed**:
```bash
# Start Redis locally
brew services start redis

# Or use Docker
docker run -d -p 6379:6379 redis:7
```

## Performance Considerations

- **EntityManager Caching**: BaseService caches MikroORM EntityManager to reduce overhead
- **Redis TTL**: Configure `REDIS_TTL` based on data volatility
- **Connection Pooling**: Default MongoDB pool size is 10 connections
- **Lazy Loading**: MikroORM relations are lazy-loaded to prevent N+1 queries

## Security Best Practices

- ✅ Passwords hashed with bcrypt (configurable salt rounds)
- ✅ JWT tokens signed with secret (HMAC-SHA256)
- ✅ Sensitive fields excluded from API responses (`@Property({ hidden: true })`)
- ✅ CORS configured for allowed origins
- ✅ Environment secrets stored in AWS Secrets Manager (production)
- ✅ Input validation via class-validator decorators

## Contributing

1. Follow the code standards in [docs/code-standards.md](docs/code-standards.md)
2. Run linter and tests before committing:
   ```bash
   pnpm run lint
   pnpm run test
   pnpm run build
   ```
3. Use conventional commit messages
4. Update documentation for new features

## License

[MIT](LICENSE)

## Author

- [Thai Nguyen](https://github.com/nxthai23)

## Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/nxthai23/nestjs-base/issues)
- NestJS Docs: https://docs.nestjs.com
