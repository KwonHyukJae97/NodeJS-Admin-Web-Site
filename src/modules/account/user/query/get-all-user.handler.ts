import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetAllUserQuery } from './get-all-user.query';

/**
 * 앱 사용자 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllUserQuery)
export class GetAllUserQueryHandler implements IQueryHandler<GetAllUserQuery> {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 앱 사용자 리스트 조회 메소드
   * @param query : 앱 사용자 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 앱 사용자 리스트 반환
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetAllUserQuery) {
    const user = await this.usersRepository.find({});
    if (!user) {
      return this.convertException.notFoundError('사용자', 404);
    }
    // 앱 사용자 전체 리스트 반환
    console.log('유저리스트!!', user);
    return user;
  }
}
