import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { UpdateAdminCommand } from './update-admin.command';
import * as bcrypt from 'bcryptjs';

@Injectable()
@CommandHandler(UpdateAdminCommand)
export class UpdateAdminHandler implements ICommandHandler<UpdateAdminCommand> {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
  ) {}

  async execute(command: UpdateAdminCommand) {
    const { password, email, phone, nickname, roleId, isSuper, adminId } = command;

    const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    const account = await this.accountRepository.findOneBy({ accountId: adminId });

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

    return account;
  }
}
