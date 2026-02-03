import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PitchDeckService } from './pitchdeck.service';
import { PitchDeckController } from './pitchdeck.controller';
import { PitchDeck } from './entities/pitch-deck.entity';
import { DeckChunk } from './entities/deck-chunk.entity';
import { JwtMiddleware } from '@core/middlewares/jwt.middleware';

@Module({
  imports: [MikroOrmModule.forFeature([PitchDeck, DeckChunk])],
  controllers: [PitchDeckController],
  providers: [PitchDeckService],
  exports: [PitchDeckService],
})
export class PitchDeckModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(PitchDeckController);
  }
}
