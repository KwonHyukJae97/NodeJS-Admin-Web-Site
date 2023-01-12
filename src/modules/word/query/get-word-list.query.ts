import { IQuery } from '@nestjs/cqrs';
import { GetWordRequestDto } from '../dto/get-word-request.dto';

/**
 * 단어 전체 & 검색어에 해당하는 리스트 조회용 쿼리
 */
export class GetWordListQuery implements IQuery {
  constructor(readonly param: GetWordRequestDto) {}
}
