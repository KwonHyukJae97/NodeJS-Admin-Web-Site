import { IQuery } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 답변 전체 리스트 조회용 쿼리
 */
export class GetCommentListQuery implements IQuery {
  constructor(
    readonly role: string,
    readonly account: Account,
    readonly writer: string,
    readonly commenter: number,
    readonly regDate: string,
  ) {}
}
