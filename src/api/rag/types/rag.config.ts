export interface AstraDbConfig {
  token: string;
  endpoint: string;
  collection: string;
}

export interface OpenAIConfig {
  apiKey: string;
  embeddingModel: string;
}

export interface RagConfig {
  astradb: AstraDbConfig;
  openai: OpenAIConfig;
}
