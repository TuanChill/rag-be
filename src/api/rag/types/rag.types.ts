export interface DocumentMetadata {
  source?: string;
  title?: string;
  createdAt?: Date;
  [key: string]: unknown;
}

export interface IngestDocument {
  pageContent: string;
  metadata?: DocumentMetadata;
}

export interface IngestResult {
  success: boolean;
  documentIds: string[];
  count: number;
}

export interface QueryResult {
  pageContent: string;
  metadata: DocumentMetadata;
  score?: number;
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
}

export interface RagHealthStatus {
  status: 'healthy' | 'unhealthy';
  collection: string;
  timestamp: Date;
  error?: string;
}
