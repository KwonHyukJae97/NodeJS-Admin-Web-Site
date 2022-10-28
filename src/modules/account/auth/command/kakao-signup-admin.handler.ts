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
    const { name, phone, nickname, birth, gender, snsId, snsType, snsToken, division } = command;
    console.log('kakao command', command);

    const accountKakaoAdmin = this.accountRepository.create({
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsType,
      snsToken,
      division,
    });

    try {
      await this.accountRepository.save(accountKakaoAdmin);
    } catch (err) {
      console.log(err);
      return this.convertException.badRequestError('Kakao 2차정보 저장에', 400);
    }

    const adminKakao = this.adminRepository.create({
      accountId: accountKakaoAdmin,
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

    return '카카오 2차 정보 저장 완료 (관리자)';
  }
}
