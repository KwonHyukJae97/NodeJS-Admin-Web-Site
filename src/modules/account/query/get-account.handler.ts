import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Account } from '../entities/account';
import { GetAccountQuery } from './get-account.query';

/**
 * Account 에서 로그인 기간이 1년이상 지난 사용자 추출 핸들러
 */
@QueryHandler(GetAccountQuery)
export class GetAccountHandler implements IQueryHandler<GetAccountQuery> {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  /**
   * loginDate의 기간이 1년이 지난 사용자를 추출.
   * @param query
   * @returns temporary
   */
  async execute(query: GetAccountQuery) {
    const { accountId } = query;

    //최근 로그인 일자와 현재 시간과 비교하여 365일 초과시 처리
    // diff 값이 null로 반환됨.
    const diff = await this.accountRepository
      .createQueryBuilder('account')
      .select(['DATEDIFF(now(), account.loginDate) AS DATEDIFF'])
      .where('account.accountId = :accountId', { accountId })
      .getOne();

    console.log('diff 체크', diff);

    return { diff };
  }
}
