import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * OpenAI Call Tool
 * Wraps LangChain ChatOpenAI for LLM calls
 * Used by agents for AI analysis and content generation
 */
@Injectable()
export class OpenAICallTool {
  private readonly logger = new Logger(OpenAICallTool.name);
  private readonly llm: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    const modelName = this.configService.get<string>(
      'openai.chatModel',
      'gpt-4o-mini',
    );
    const temperature = this.configService.get<number>(
      'analysis.temperature',
      0.7,
    );

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }

    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey || '',
      modelName,
      temperature,
    });
  }

  /**
   * Call OpenAI with messages
   * @param messages - Array of messages (system, user, assistant)
   * @returns LLM response content
   */
  async call(messages: Array<SystemMessage | HumanMessage>): Promise<string> {
    try {
      this.logger.debug(`OpenAI call with ${messages.length} messages`);
      const response = await this.llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      this.logger.error('OpenAI call failed', error);
      throw error;
    }
  }

  /**
   * Create a LangChain DynamicTool for AI analysis
   * @param systemPrompt - System prompt for the LLM
   * @returns LangChain tool instance
   */
  createTool(systemPrompt: string): DynamicTool {
    return new DynamicTool({
      name: 'ai_analysis',
      description: systemPrompt,
      func: async (input: string) => {
        try {
          const response = await this.call([
            new SystemMessage(systemPrompt),
            new HumanMessage(input),
          ]);
          return JSON.stringify({ success: true, response });
        } catch (error) {
          return JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
    });
  }

  /**
   * Get the underlying LLM instance
   * Useful for direct LangChain operations
   */
  getLLM(): ChatOpenAI {
    return this.llm;
  }
}
