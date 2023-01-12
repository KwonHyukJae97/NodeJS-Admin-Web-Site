import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';
import { GetAllAdminQuery } from './get-all-admin.query';
import { ConvertException } from 'src/common/utils/convert-exception';
import { AccountFile } from '../../../file/entities/account-file.entity';

/**
 * 관리자 전체 조회용 쿼리 핸들러
 */
@QueryHandler(GetAllAdminQuery)
export class GetAllAdminQueryHandler implements IQueryHandler<GetAllAdminQuery> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
  ) {}

  /**
   * 관리자 리스트 조회 메소드
   * @param query : 관리자 리스트 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 관리자 리스트 반환
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetAllAdminQuery) {
    const admin = await this.adminRepository.find({});
    if (!admin) {
      return this.convertException.notFoundError('관리자', 404);
    }
    // 관리자 전체 리스트 반환
    // console.log('adminList', admin);
    // return admin;

    let adminInfo;

    // 조회한 각 사용자 정보마다 반복문 돌려가면서 필요에 맞는 정보 반환
    const adminInfoList = await Promise.all(
      admin.map(async (admin) => {
        // '탈퇴'한 회원이면 'user' 정보만 반환
        if (admin.accountId === null) {
          adminInfo = {
            admin: admin,
          };

          // 현재 회원이면, 저장된 파일이 있는지 확인
        } else {
          const accountFile = await this.fileRepository.findOneBy({
            accountId: admin.accountId,
          });

          // 파일이 있으면 'user'와 'file = accountFile' 정보 반환
          if (accountFile) {
            adminInfo = {
              admin: admin,
              file: accountFile,
            };

            // 파일이 없으면 'user'와 'file = null' 정보 반환
          } else {
            adminInfo = {
              admin: admin,
              file: null,
            };
          }
        }
        return adminInfo;
      }),
    );

    return adminInfoList;
  }
}
