import { IQuery } from '@nestjs/cqrs';
import { GetStudyRequestDto } from '../dto/get-study-request.dto';

/**
 * 학습관리 전체 리스트 조회 쿼리 정의
 */
export class GetStudyListQuery implements IQuery {
  constructor(readonly param: GetStudyRequestDto) {}
}
