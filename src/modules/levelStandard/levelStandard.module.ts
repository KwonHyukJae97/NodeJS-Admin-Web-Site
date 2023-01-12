import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study } from '../study/entities/study';
import { WordLevel } from '../wordLevel/entities/wordLevel';
import { LevelStandard } from './entities/levelStandard';

@Module({
  imports: [TypeOrmModule.forFeature([LevelStandard, Study, WordLevel]), CqrsModule],
})
export class LevelStandardModule {}
