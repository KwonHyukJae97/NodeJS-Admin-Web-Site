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
    const { accountId, loginDate } = query;

    const temporary = await this.accountRepository
      .createQueryBuilder('account')
      .select(['account.accountId', 'account.loginDate'])
      .where('account.accountId =: accountId', { accountId })
      .where('account.loginDate =: loginDate', { loginDate })
      .getOne();
    console.log('로그인 데이트 체크 테스트', temporary);
    return temporary;
  }
}
