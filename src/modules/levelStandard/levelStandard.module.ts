import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study } from '../study/entities/study.entity';
import { WordLevel } from '../wordLevel/entities/wordLevel.entity';
import { LevelStandard } from './entities/levelStandard.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LevelStandard, Study, WordLevel]), CqrsModule],
})
export class LevelStandardModule {}
