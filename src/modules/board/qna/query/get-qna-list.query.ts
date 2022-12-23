import { IQuery } from '@nestjs/cqrs';
import { GetQnaRequestDto } from '../dto/get-qna-request.dto';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리
 */
export class GetQnaListQuery implements IQuery {
  constructor(readonly param: GetQnaRequestDto) {}
}
