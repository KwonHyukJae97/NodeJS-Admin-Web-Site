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
    // const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    // const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    // const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });

    if (email) {
      try {
        // const isEmailExist = this.accountRepository.findOneBy( {email} )
        const isEmailExist = await this.accountRepository.findOne({ where: { email } });
        if (isEmailExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 이메일이므로 수정',
            400,
          );
        } else {
          const updateEmail = this.accountRepository.update(
            { accountId },
            {
              email: email,
            },
          );
          console.log(updateEmail);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (phone) {
      try {
        const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
        if (isPhoneExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 연락처이므로 수정',
            400,
          );
        } else {
          const updatePhone = this.accountRepository.update(
            {
              accountId,
            },
            {
              phone: phone,
            },
          );
          console.log(updatePhone);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (nickname) {
      try {
        const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });
        if (isNicknameExist) {
          return this.convertException.badRequestAccountError(
            '이미 존재하는 닉네임이므로 수정',
            400,
          );
        } else {
          const updateNickname = this.accountRepository.update(
            {
              accountId,
            },
            {
              nickname: nickname,
            },
          );
          console.log(updateNickname);
        }
      } catch (err) {
        console.log(err);
      }
    }

    // const eemail = await this.accountRepository
    //   .createQueryBuilder('account')
    //   .select(['account.email', 'account.phone', 'account.nickname'])
    //   .where('NOT account.accountId = :accountId', { accountId })
    //   .getMany();
    // console.log('eeeeeemmmmaaaaiiill', eemail);

    // console.log('어카운트 이메이이잉일', account.email);
    // console.log('어카운트 이메이이잉222222일', email);

    // const isEmailExist = await this.accountRepository.findOne({ where: { email } });
    // // const isPhoneExist = await this.accountRepository.findOne({ where: { phone } });
    // // const isNicknameExist = await this.accountRepository.findOne({ where: { nickname } });

    // if (email == account.email) {
    //   return this.convertException.badRequestAccountError('지금 이메일이랑 똑같음', 400);
    // } {
    //   try {
    //     account.email = email;
    //     account.phone = phone;
    //     account.nickname = nickname;
    //     // await this.accountRepository.save(account);
    //     await this.accountRepository.update(
    //       { accountId },
    //       { email: email, phone: phone, nickname: nickname },
    //     );
    //   } catch (err) {
    //     console.log(err);
    //     //저장 실패 에러 메시지 반환
    //     return this.convertException.CommonError(500);
    //   }
    // }

    return account;
  }
}
