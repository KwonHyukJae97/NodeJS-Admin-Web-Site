import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from '../studyPlan/entities/studyPlan';
import { StudyUnit } from '../studyUnit/entities/studyUnit';
import { StudyPlanWord } from './entities/studyPlanWord';

//Word 임포트받기
@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanWord, StudyPlan, StudyUnit]), CqrsModule],
})
export class StudyPlanWordModule {}
