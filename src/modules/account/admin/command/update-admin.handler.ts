import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { UpdateAdminCommand } from './update-admin.command';
import * as bcrypt from 'bcryptjs';
import { FileType } from '../../../file/entities/file-type.enum';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { AccountFileDb } from '../../account-file-db';
import { UpdateFilesCommand } from '../../../file/command/update-files.command';
import { CreateFilesCommand } from '../../../file/command/create-files.command';

/**
 * 관리자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler implements ICommandHandler<UpdateAdminCommand> {
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
   * 관리자 정보 수정 메소드
   * @param command : 관리자 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: UpdateAdminCommand) {
    const { password, email, phone, nickname, roleId, isSuper, adminId, files } = command;

    const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    const accountId = admin.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    //트랜잭션 생성 후 연결 및 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    //역할번호 수정
    try {
      admin.roleId = roleId;
      admin.isSuper = isSuper;
      // admin.isSuper = isSuper;
      await queryRunner.manager.getRepository(Admin).save(admin);

      account.password = hashedPassword;
      account.email = email;
      account.phone = phone;
      account.nickname = nickname;

      await queryRunner.manager.getRepository(Account).save(account);

      const accountFile = await this.fileRepository.findOneBy({ accountId: accountId });

      if (files.length !== 0) {
        // 저장되어 있는 프로필 이미지가 있다면 '수정' 이벤트 호출
        if (accountFile) {
          const command = new UpdateFilesCommand(
            accountId,
            FileType.ACCOUNT,
            null,
            files,
            this.accountFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
          // 저장되어 있는 프로필 이미지가 없다면 '등록' 이벤트 호출
        } else {
          const command = new CreateFilesCommand(
            accountId,
            FileType.ACCOUNT,
            null,
            files,
            this.accountFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
        }
      }

      await queryRunner.commitTransaction();
      return account;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('정보 수정에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
