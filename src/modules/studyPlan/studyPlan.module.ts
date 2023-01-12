import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Study } from '../study/entities/study.entity';
import { StudyPlan } from './entities/studyPlan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan, Study]), CqrsModule],
})
export class StudyPlanModule {}
