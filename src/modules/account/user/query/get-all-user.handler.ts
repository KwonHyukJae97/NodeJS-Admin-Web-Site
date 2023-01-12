import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { User } from '../entities/user';
import { GetAllUserQuery } from './get-all-user.query';
import { AccountFile } from '../../../file/entities/account-file.entity';

/**
 * 앱 사용자 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllUserQuery)
export class GetAllUserQueryHandler implements IQueryHandler<GetAllUserQuery> {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
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
    // console.log('유저리스트!!', user);
    // return user;

    let userInfo;

    // 조회한 각 사용자 정보마다 반복문 돌려가면서 필요에 맞는 정보 반환
    const userInfoList = await Promise.all(
      user.map(async (user) => {
        // '탈퇴'한 회원이면 'user' 정보만 반환
        if (user.accountId === null) {
          userInfo = {
            user: user,
          };

          // 현재 회원이면, 저장된 파일이 있는지 확인
        } else {
          const accountFile = await this.fileRepository.findOneBy({
            accountId: user.accountId,
          });

          // 파일이 있으면 'user'와 'file = accountFile' 정보 반환
          if (accountFile) {
            userInfo = {
              user: user,
              file: accountFile,
            };

            // 파일이 없으면 'user'와 'file = null' 정보 반환
          } else {
            userInfo = {
              user: user,
              file: null,
            };
          }
        }
        return userInfo;
      }),
    );

    return userInfoList;
  }
}
