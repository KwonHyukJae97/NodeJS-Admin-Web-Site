import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from '../studyPlan/entities/studyPlan.entity';
import { StudyUnit } from '../studyUnit/entities/studyUnit.entity';
import { StudyPlanWord } from './entities/studyPlanWord.entity';

//Word 임포트받기
@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanWord, StudyPlan, StudyUnit]), CqrsModule],
})
export class StudyPlanWordModule {}
