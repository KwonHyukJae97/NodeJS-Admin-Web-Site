import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank.entity';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard.entity';
import { Percent } from 'src/modules/percent/entities/percent.entity';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan.entity';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit.entity';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study.entity';
import { GetStudyInfoQuery } from './get-study-info.query';

/**
 * 학습관리 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetStudyInfoQuery)
export class GetStudyInfoQueryHandler implements IQueryHandler<GetStudyInfoQuery> {
  constructor(
    @InjectRepository(Study) private studyRespository: Repository<Study>,
    @InjectRepository(Percent) private percentRepository: Repository<Percent>,
    @InjectRepository(LevelStandard) private levelStandardRepository: Repository<LevelStandard>,
    @InjectRepository(GradeLevelRank) private gradeLevelRankRepository: Repository<GradeLevelRank>,
    @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(StudyUnit) private studyUnitRepository: Repository<StudyUnit>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  async execute(query: GetStudyInfoQuery) {
    const { studyId } = query;

    //학습관리 아이디
    const study = await this.studyRespository.findOneBy({ studyId });
    //학습구성 아이디
    const studyPlan = await this.studyPlanRepository.findOneBy({ studyId: study.studyId });
    //학습단원 아이디
    const studyUnit = await this.studyUnitRepository.findOneBy({
      studyPlanId: studyPlan.studyPlanId,
    });
    //레벨수준 아이디
    const levelStandard = await this.levelStandardRepository.findOneBy({ studyId: study.studyId });
    //학년별 레벨별 아이디
    const gradeLevelRank = await this.gradeLevelRankRepository.findOneBy({
      levelStandardId: levelStandard.levelStandardId,
    });

    if (!study) {
      return this.convertException.notFoundError('학습관리', 404);
    }

    return { study, studyPlan, studyUnit, levelStandard, gradeLevelRank };
  }
}
