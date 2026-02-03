import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  imports: [ConfigModule],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule implements OnModuleInit {
  private readonly logger = new Logger(RagModule.name);

  constructor(private readonly ragService: RagService) {}

  async onModuleInit() {
    this.logger.log('Initializing RAG module...');
    await this.ragService.initialize();
    this.logger.log('RAG module initialized successfully');
  }
}
