import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { UpdateAdminCommand } from './update-admin.command';
import * as bcrypt from 'bcryptjs';
import { FileUpdateEvent } from '../../../file/event/file-update-event';
import { FileType } from '../../../file/entities/file-type.enum';
import { FileCreateEvent } from '../../../file/event/file-create-event';
import { AccountFile } from '../../../file/entities/account-file';
import { AccountFileDb } from '../../account-file-db';

/**
 * 관리자 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler implements ICommandHandler<UpdateAdminCommand> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(AccountFile) private fileRepository: Repository<AccountFile>,
    @Inject('accountFile') private accountFileDb: AccountFileDb,
    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateAdminCommand) {
    const { password, email, phone, nickname, roleId, isSuper, adminId, file } = command;

    const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    const accountId = admin.accountId.accountId;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    admin.roleId = roleId;
    admin.isSuper = isSuper;
    await this.adminRepository.save(admin);

    // 비밀번호 암호화 저장 (bcrypt)
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    account.password = hashedPassword;
    account.email = email;
    account.phone = phone;
    account.nickname = nickname;
    await this.accountRepository.save(account);

    const accountFile = await this.fileRepository.findOneBy({ accountId: accountId });

    if (file) {
      // 저장되어 있는 프로필 이미지가 있다면 '수정' 이벤트 호출
      if (accountFile) {
        this.eventBus.publish(
          new FileUpdateEvent(accountId, FileType.ACCOUNT, file, this.accountFileDb),
        );
        // 저장되어 있는 프로필 이미지가 없다면 '등록' 이벤트 호출
      } else {
        this.eventBus.publish(
          new FileCreateEvent(accountId, FileType.ACCOUNT, file, this.accountFileDb),
        );
      }
    }

    //수정된 내용 반환
    return account;
  }
}
