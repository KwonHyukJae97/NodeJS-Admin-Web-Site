import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { GetUserInfoQuery } from './get-user-info.query';
import { Account } from '../../account/entities/account.entity';

/**
 * 앱 사용자 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  async execute(query: GetUserInfoQuery) {
    const { accountId } = query;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .where('account.account_id = :accountId', { accountId: accountId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    //앱사용자 상세 정보
    return user;
  }
}
