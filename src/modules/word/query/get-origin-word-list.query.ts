import { IQuery } from '@nestjs/cqrs';

/**
 * 본단어/일반단어 리스트 조회용 쿼리
 */
export class GetOriginWordListQuery implements IQuery {
  constructor(readonly param: string) {}
}
