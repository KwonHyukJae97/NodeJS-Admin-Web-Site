import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { KakaoSignUpAdminCommand } from './kakao-signup-admin.command';

/**
 * 카카오 (관리자) 2차정보 가입 핸들러
 */
@Injectable()
@CommandHandler(KakaoSignUpAdminCommand)
export class KakaoSignUpAdminHandler implements ICommandHandler<KakaoSignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    @Inject(ConvertException)
    private convertException: ConvertException,
  ) {}

  //카카오 2차 정보 저장 메소드
  async execute(command: KakaoSignUpAdminCommand) {
    let { name, phone, nickname, birth, gender, snsId, snsToken } = command;
    console.log('kakao command', command.snsToken);

    //카카오에서 넘어오는 성별 값을 account 형식에 맞게 변경하여 저장
    if (gender == 'male') {
      gender = '1';
    } else {
      gender = '0';
    }

    const accountKakaoAdmin = this.accountRepository.create({
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsType: '01',
      snsToken,
      division: true,
    });

    try {
      await this.accountRepository.save(accountKakaoAdmin);
    } catch (err) {
      console.log(err);
      return this.convertException.badRequestError('Kakao 2차정보 저장에', 400);
    }

    const adminKakao = this.adminRepository.create({
      accountId: accountKakaoAdmin.accountId,
      companyId: 0,
      roleId: 0,
      isSuper: true,
    });

    try {
      await this.adminRepository.save(adminKakao);
    } catch (err) {
      console.log(err);
      return this.convertException.CommonError(500);
    }

    // 카카오 정보를 리턴
    return accountKakaoAdmin;
  }
}
