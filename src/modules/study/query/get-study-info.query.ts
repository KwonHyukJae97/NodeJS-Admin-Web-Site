import { IQuery } from '@nestjs/cqrs';

/**
 * 학습관리 상세 조회 쿼리 정의
 */
export class GetStudyInfoQuery implements IQuery {
  constructor(readonly studyId: number) {}
}
