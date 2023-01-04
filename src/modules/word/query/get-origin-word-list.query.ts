import { IQuery } from '@nestjs/cqrs';
import { GetOriginWordRequestDto } from '../dto/get-origin-word-request.dto';

/**
 * 본단어/일반단어 리스트 조회용 쿼리
 */
export class GetOriginWordListQuery implements IQuery {
  constructor(readonly param: GetOriginWordRequestDto) {}
}
