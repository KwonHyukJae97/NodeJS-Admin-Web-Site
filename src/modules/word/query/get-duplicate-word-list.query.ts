import { IQuery } from '@nestjs/cqrs';
import { GetDuplicateWordRequestDto } from '../dto/get-duplicate-word-request.dto';

/**
 * 중복 단어 리스트 조회용 쿼리
 */
export class GetDuplicateWordListQuery implements IQuery {
  constructor(readonly param: GetDuplicateWordRequestDto) {}
}
