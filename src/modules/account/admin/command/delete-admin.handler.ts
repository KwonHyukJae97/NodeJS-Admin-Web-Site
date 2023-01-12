import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { Admin } from '../entities/admin.entity';
import { DeleteAdminCommand } from './delete-admin.command';
import { ConvertException } from 'src/common/utils/convert-exception';
import { AccountFileDb } from '../../account-file-db';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { DeleteFilesCommand } from '../../../file/command/delete-files.command';

/**
 * 관리자 정보 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteAdminCommand)
export class DeleteAdminHandler implements ICommandHandler<DeleteAdminCommand> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
    @Inject('accountFile') private accountFileDb: AccountFileDb,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 관리자 삭제 메소드
   * @param command  : 관리자 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteAdminCommand) {
    const { adminId, delDate } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    const accountId = admin.accountId;

    const account = await this.accountRepository.findOneBy({ accountId: accountId, delDate });

    if (!account) {
      return this.convertException.notFoundError('관리자', 404);
    }

    // new Date()에서 반환하는 UTC시간을 KST시간으로 변경
    const getDate = new Date();
    getDate.setHours(getDate.getHours() + 9);
    const setDate = getDate;

    //탈퇴회원의 이용내역 조회를 위해 delete하지 않고 삭제일시를 별도로 저장하여 데이터 보존
    account.delDate = setDate;
    await this.accountRepository.save(account);

    const accountFile = await this.fileRepository.findOneBy({ accountId: accountId });

    // 저장되어 있는 프로필 이미지가 있다면 '삭제' 이벤트 호출
    if (accountFile) {
      const command = new DeleteFilesCommand(accountId, this.accountFileDb, queryRunner);
      await this.commandBus.execute(command);
    }

    //탈퇴회원의 개인정보 유출가능한 데이터는 *표로 표시 (기준:휴면계정 데이터)
    //예외처리
    try {
      await this.accountRepository
        .createQueryBuilder()
        .update(account)
        .set({
          password: '*****',
          id: '*****',
          name: '*****',
          phone: '*****',
          nickname: '*****',
          email: '*****',
          birth: '*****',
          snsId: '*****',
          snsType: '**',
          gender: '*',
          ci: '*****',
        })
        .where('account.account_id = :accountId', { accountId: accountId })
        .execute();
    } catch (err) {
      return this.convertException.CommonError(500);
    }

    return '관리자 삭제 완료';
  }
}
