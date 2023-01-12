import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Page } from 'src/common/utils/page';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { Repository } from 'typeorm';
import { Study } from '../entities/study';
import { GetStudyListQuery } from './get-study-list.query';

/**
 * 학습관리 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetStudyListQuery)
export class GetStudyListQueryHandler implements IQueryHandler<GetStudyListQuery> {
  constructor(
    @InjectRepository(Study) private studyRepository: Repository<Study>,
    @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
    @Inject(ConvertException) private convertException: ConvertException, //TODO: 단어정보 가져오기
  ) {}

  async execute(query: GetStudyListQuery) {
    const { param } = query;

    //학습구성관리에서 기본학습진행방식 데이터 조회
    const study = await this.studyRepository
      .createQueryBuilder('study')
      .subQuery()
      .select([
        `study.studyId AS studyId,
      study.studyTypeCode AS studyTypeCode,
      study.studyName AS studyName,
      study.isService AS isService,
      study.regBy AS regBy,
      study.regDate AS regDate`,
      ])
      .from(Study, 'study')
      .groupBy('study.studyId')
      .getQuery();

    //학습구성관리에서 조회한 데이터와 같이 출력
    const studyPlan = await this.studyPlanRepository
      .createQueryBuilder('studyPlan')
      .select([
        `studyPlan.studyPlanId AS studyPlanId,
      studyPlan.studyMode AS studyMode`,
      ])
      .leftJoinAndSelect(study, 'study', 'study.studyId = studyPlan.studyId')
      .orderBy('studyPlan.studyId', 'ASC');

    if (param.searchWord) {
      studyPlan.where('study.studyName like :studyName', {
        studyName: `%${param.searchWord}%`,
      });
    }
    let tempQuery = studyPlan;

    // 전체 조회 값이 false일 경우, 페이징 처리
    if (!param.totalData) {
      tempQuery = tempQuery.limit(param.getLimit()).offset(param.getOffset());
    }

    //최종 데이터 반환
    const list = await tempQuery.getRawMany();

    //최종 데이터의 총 개수 반환
    const total = await tempQuery.getCount();

    //전체 조회 값 여부에 따른 pageNo/pageSize 반환값 설정
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('학습관리', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
