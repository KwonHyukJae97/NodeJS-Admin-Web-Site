import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { GetAuthInfoQuery } from './get-auth-info.query';

/**
 * 내정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetAuthInfoQuery)
export class GetAuthInfoQueryHandler implements IQueryHandler<GetAuthInfoQuery> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 내 정보 조회 메소드
   * @param query : 내 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 권한 상세 정보 반환
   */

  async execute(query: GetAuthInfoQuery) {
    const { accountId } = query;
    console.log('handler test', accountId);

    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    if (!account) {
      return this.convertException.notFoundError('권한', 404);
    }
    console.log('handler account test', account);

    return account;
  }
}
