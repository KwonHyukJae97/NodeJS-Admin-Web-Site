import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Account } from '../../entities/account';
import { AdminUpdatePasswordCommand } from './admin-update-password.command';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

/**
 * 관리자 비밀번호 변경 핸들러
 */
@Injectable()
@CommandHandler(AdminUpdatePasswordCommand)
export class AdminUpdatePasswordHandler implements ICommandHandler<AdminUpdatePasswordCommand> {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: AdminUpdatePasswordCommand) {
    const { accountId, password, confirmPassword } = command;

    //비밀번호와 비밀번호 확인 값 비교
    console.log(password);
    console.log(confirmPassword);
    if (password == confirmPassword) {
      //비밀번호 암호화 작업
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      try {
        const updatePassword = this.accountRepository.update(
          { accountId },
          { password: hashedPassword },
        );
        console.log('비밀번호 변경 결과', updatePassword);
      } catch (err) {
        console.log(err);
        return this.convertException.badRequestError('비밀번호 변경', 400);
      }
    } else {
      return this.convertException.badInput('패스워드 수정 정보에 ', 400);
    }

    return '비밀번호 변경 완료';
  }
}
