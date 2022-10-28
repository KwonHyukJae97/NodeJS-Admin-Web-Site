import { IQuery } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리
 */
export class GetQnaListQuery implements IQuery {
  constructor(readonly account: Account) {}
}
