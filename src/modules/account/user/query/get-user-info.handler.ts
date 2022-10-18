import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetUserInfoQuery } from './get-user-info.query';
/**
 * 앱 사용자 상세 정보 조회용 쿼리 핸들러
 */

@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(query: GetUserInfoQuery) {
    const { userId } = query;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.account', 'account')
      .where('user.user_id = :userId', { userId: userId })
      .getOne();

    if (!user) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '사용자', 404);
    }
    //앱사용자 상세 정보 반환
    return user;
  }
}
