import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelStandard } from '../levelStandard/entities/levelStandard.entity';
import { Percent } from '../percent/entities/percent.entity';
import { GradeLevelRank } from './entities/gradeLevelRank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeLevelRank, LevelStandard, Percent]), CqrsModule],
})
export class GradeLevelRankModule {}
