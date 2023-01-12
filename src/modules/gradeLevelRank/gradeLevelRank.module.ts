import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelStandard } from '../levelStandard/entities/levelStandard';
import { Percent } from '../percent/entities/percent';
import { GradeLevelRank } from './entities/gradeLevelRank';

@Module({
  imports: [TypeOrmModule.forFeature([GradeLevelRank, LevelStandard, Percent]), CqrsModule],
})
export class GradeLevelRankModule {}
