import { Module, Global } from '@nestjs/common';
import { RagModule } from '@api/rag/rag.module';
import { RagQueryTool } from './tools/rag-query.tool';
import { OpenAICallTool } from './tools/openai-call.tool';
import { StateManagerUtil } from './utils/state-manager.util';

/**
 * Agents Module - Global module for agent framework
 * Phase 3: Agent Framework
 *
 * Provides:
 * - RagQueryTool - for querying pitch deck content
 * - OpenAICallTool - for LLM calls
 * - StateManagerUtil - for agent state management
 *
 * This module is @Global() so it can be used anywhere in the application
 * without re-importing in each module.
 *
 * Later phases will use these tools:
 * - Phase 4 (Scoring Agents) - extend BaseAgent, use tools
 * - Phase 5 (Analysis Agents) - extend BaseAgent, use tools
 * - Phase 6 (Orchestration Service) - coordinate agent execution
 */
@Global()
@Module({
  imports: [RagModule],
  providers: [RagQueryTool, OpenAICallTool, StateManagerUtil],
  exports: [RagQueryTool, OpenAICallTool, StateManagerUtil],
})
export class AgentsModule {}
