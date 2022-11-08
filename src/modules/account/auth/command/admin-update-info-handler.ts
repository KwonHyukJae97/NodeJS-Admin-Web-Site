import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { AdminUpdateInfoCommand } from './admin-update-info.command';

/**
 * 관리자 내정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(AdminUpdateInfoCommand)
export class AdminUpdateInfoHandler implements ICommandHandler<AdminUpdateInfoCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}

  /**
   * 관리자 정보 수정 메소드
   * @param command : 관리자 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 수정된 정보 반환
   */
  async execute(command: AdminUpdateInfoCommand) {
    const { accountId, email, phone, nickname } = command;
    const account = await this.accountRepository.findOneBy({ accountId: accountId });

    try {
      account.email = email;
      account.phone = phone;
      account.nickname = nickname;
      await this.accountRepository.save(account);
    } catch (err) {
      console.log(err);
      //저장 실패 에러 메시지 반환
      return this.convertException.CommonError(500);
    }

    return account;
  }
}
