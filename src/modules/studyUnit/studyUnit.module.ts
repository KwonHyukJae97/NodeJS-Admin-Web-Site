import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from '../studyPlan/entities/studyPlan.entity';
import { StudyUnit } from './entities/studyUnit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyUnit, StudyPlan]), CqrsModule],
})
export class StudyUnitModule {}
