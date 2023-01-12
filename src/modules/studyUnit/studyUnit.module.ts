import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from '../studyPlan/entities/studyPlan';
import { StudyUnit } from './entities/studyUnit';

@Module({
  imports: [TypeOrmModule.forFeature([StudyUnit, StudyPlan]), CqrsModule],
})
export class StudyUnitModule {}
