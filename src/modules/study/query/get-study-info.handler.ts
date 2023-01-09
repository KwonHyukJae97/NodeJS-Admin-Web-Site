import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudyInfoQuery } from './get-study-info.query';

/**
 * 학습관리 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetStudyInfoQuery)
export class GetStudyInfoQueryHandler implements IQueryHandler<GetStudyInfoQuery> {
  constructor() {}

  async execute(query: GetStudyInfoQuery) {}
}
