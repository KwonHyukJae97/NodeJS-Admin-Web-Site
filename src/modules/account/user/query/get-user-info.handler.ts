import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetUserInfoQuery } from './get-user-info.query';
import { AccountFile } from '../../../file/entities/account-file';

/**
 * 앱 사용자 상세 정보 조회용 쿼리 핸들러
 */
@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 앱 사용자 상세 정보 조회 메소드
   * @param query : 앱 사용자 정보 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 앱 사용자 정보 반환
   */
  async execute(query: GetUserInfoQuery) {
    const { userId } = query;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .where('user.user_id = :userId', { userId: userId })
      .getOne();

    if (!user) {
      return this.convertException.notFoundError('사용자', 404);
    }

    const accountFile = await this.fileRepository.findOneBy({
      accountId: user.account.accountId,
    });

    // 저장된 파일이 있다면, 파일 정보와 함께 반환
    if (accountFile) {
      const userInfo = {
        user: user,
        file: accountFile,
      };
      return userInfo;
    }
    return user;
  }
}
