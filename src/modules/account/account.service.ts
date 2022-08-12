import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Account} from "./entities/account.entity";
import {Repository} from "typeorm";

@Injectable()
export class AccountService {

  constructor(
      @InjectRepository(Account) private repository: Repository<Account>
  ) {}

  create(createAccountDto: CreateAccountDto) {

    const account = createAccountDto.toAccountEntity();
    account.reg_date = new Date();

    return this.repository.save(account);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOneBy({
      account_id: id
    });
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {

    const account = updateAccountDto.toUpdateAccountEntity();

    return this.repository.update(id, account);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
