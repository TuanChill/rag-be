import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PitchDeckService } from './pitchdeck.service';
import { PitchDeckController } from './pitchdeck.controller';
import { PitchDeck } from './entities/pitch-deck.entity';
import { DeckChunk } from './entities/deck-chunk.entity';
import { PitchDeckFile } from './entities/pitch-deck-file.entity';
import { UserModule } from '@api/user/user.module';
import { RagModule } from '@api/rag/rag.module';
import { DocumentProcessorService, VisionExtractionService } from './services';

@Module({
  imports: [
    MikroOrmModule.forFeature([PitchDeck, DeckChunk, PitchDeckFile]),
    UserModule,
    RagModule,
  ],
  controllers: [PitchDeckController],
  providers: [
    PitchDeckService,
    DocumentProcessorService,
    VisionExtractionService,
  ],
  exports: [PitchDeckService],
})
export class PitchDeckModule {}
