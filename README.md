# RAG Backend API

Enterprise-grade NestJS backend with RAG capabilities, combining traditional web2 authentication with web3 features. Built with LangChain, Datastax Astra vector DB, and OpenAI integration.

## Features

- 🔐 **Multi-Auth**: JWT, bcrypt, SIWE (Ethereum wallet)
- 🗄️ **Flexible DB**: MongoDB/PostgreSQL via MikroORM
- ⚡ **Redis Caching**: High-performance with fallback
- 🤖 **RAG Pipeline**: LangChain + AstraDB + OpenAI
- 📚 **API Docs**: Auto-generated Swagger/OpenAPI
- 🐳 **Docker Ready**: Containerized deployment
- ✅ **Testing**: Jest + e2e test suite

## Quick Start

### Prerequisites
- Node.js v18/v20
- pnpm package manager
- MongoDB or PostgreSQL

### Installation
```bash
# Install dependencies
pnpm install

# Copy environment config
cp env.example .env

# Configure .env with your database and secrets
```

### Running
```bash
# Development
pnpm start:dev

# Production
pnpm build && pnpm start:prod
```

**Access Points**:
- App: http://localhost:3000
- API Docs: http://localhost:3000/api

## Architecture

```
src/
├── core/           # Infrastructure (BaseService, guards, filters)
├── api/            # Business logic (Auth, User, AppConfig, RAG)
├── config/         # Environment configuration
└── utils/          # Shared utilities
```

**Key Components**:
- **BaseService Pattern**: Automatic CRUD operations
- **Multi-Database**: MongoDB/PostgreSQL runtime switching
- **RAG Module**: LangChain + AstraDB vector operations
- **Authentication**: JWT, SIWE (Ethereum), bcrypt

## Environment Configuration

Key variables (see `env.example`):

```bash
# App
APP_PORT=3000
JWT_SECRET=your-secret

# Database
DB_TYPE=mongodb              # or 'postgresql'
MONGO_URI=mongodb://localhost:27017/rag-db

# Cache (optional)
REDIS_URL=redis://localhost:6379

# RAG
ASTRA_DB_ENDPOINT=https://...
ASTRA_DB_TOKEN=AstraCS:...
OPENAI_API_KEY=sk-...
```

## Development

### Scripts
```bash
pnpm start:dev      # Development with hot reload
pnpm build          # Compile TypeScript
pnpm test           # Run tests
pnpm lint           # Check code quality
pnpm format         # Format code
```

### Standards
- **BaseService Pattern**: Automatic CRUD operations
- **Path Aliases**: `@core/*`, `@api/*`, `@utils/*`
- **TypeScript**: Strict mode, no implicit any
- **YAGNI/KISS/DRY**: Minimal, focused code

See [docs/code-standards.md](docs/code-standards.md)

## API Documentation

**Interactive docs**: http://localhost:3000/api

### Key Endpoints
- `POST /auth/login` - Username/password
- `POST /auth/signIn` - Ethereum wallet
- `GET /users/me` - Current user profile
- `POST /rag/ingest` - Documents to vector DB
- `POST /rag/query` - Vector similarity search
- `DELETE /rag/delete` - Remove documents

## RAG Operations

**Document Ingestion**:
```bash
POST /rag/ingest
{
  "documents": [
    {
      "pageContent": "Document text...",
      "metadata": {"source": "manual", "title": "Doc 1"}
    }
  ]
}
```

**Vector Search**:
```bash
POST /rag/query
{
  "query": "What is...",
  "topK": 5,
  "scoreThreshold": 0.7
}
```

## Documentation

Comprehensive docs in `docs/`:
- [Project Overview](docs/project-overview-pdr.md)
- [Codebase Summary](docs/codebase-summary.md)
- [Code Standards](docs/code-standards.md)
- [System Architecture](docs/system-architecture.md)

## Contributing

1. Follow standards in [docs/code-standards.md](docs/code-standards.md)
2. Run tests before commit:
   ```bash
   pnpm test && pnpm lint
   ```
3. Update docs for new features

## License

[MIT](LICENSE)