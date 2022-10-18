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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetAllUserQuery) {
    const user = await this.usersRepository.find({});
    if (!user) {
      //정보 찾을 수 없을 경우 에러메시지 반환
      return this.convertException.throwError('notFound', '사용자', 404);
    }
    // 앱 사용자 전체 리스트 반환
    console.log('유저리스트!!', user);
    return user;
  }
}
