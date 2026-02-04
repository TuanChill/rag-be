import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '@api/user/entities/user.entity';
import { PitchDeck } from '@api/pitchdeck/entities/pitch-deck.entity';
import { Recommendation } from './entities/recommendation.entity';
import { UserInteraction } from './entities/user-interaction.entity';
import { RecommendationRepository } from './repositories/recommendation.repository';
import { UserInteractionRepository } from './repositories/user-interaction.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Recommendation,
      UserInteraction,
      User,
      PitchDeck,
    ]),
  ],
  providers: [RecommendationRepository, UserInteractionRepository],
  exports: [
    RecommendationRepository,
    UserInteractionRepository,
    Recommendation,
    UserInteraction,
  ],
})
export class RecommendationModule {}
