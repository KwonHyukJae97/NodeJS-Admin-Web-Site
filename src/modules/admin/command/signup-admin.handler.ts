import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../account/entities/account';
import { Admin } from '../entities/admin';
import { SignUpAdminCommand } from './signup-admin.command';

@Injectable()
@CommandHandler(SignUpAdminCommand)
export class SignUpAdminHandler implements ICommandHandler<SignUpAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async execute(command: SignUpAdminCommand) {
    const {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    } = command;

    // const account = this.accountRepository.create({
    //   id,
    //   password,
    //   name,
    //   email,
    //   phone,
    //   nickname,
    //   birth,
    //   gender,
    //   companyId,
    //   roleId,
    //   isSuper,
    // });

    // try {
    //   await this.accountRepository.save(account);
    // } catch (error) {
    //   if (error.code === 'ER_DUP_ENTRY') {
    //     throw new ConflictException('중복된거다~');
    //   } else {
    //     throw new InternalServerErrorException();
    //   }
    //   console.log('가입에러:', error);
    // }

    // const admin = this.adminRepository.create({
    //   accountId: account,
    //   companyId,
    //   isSuper,
    //   roleId,
    // });

    // await this.adminRepository.save(admin);

    return '회원가입 완료 (사용자)';
  }
}
