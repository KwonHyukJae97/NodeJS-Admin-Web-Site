import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Account} from "./entities/account.entity";
import {Connection, Repository} from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {

  constructor(
      @InjectRepository(Account) private accountRepository: Repository<Account>,
      private connection: Connection
  ) {}

  async create(createAccountDto: CreateAccountDto) {

    const accountExist = await this.checkAccountExists(createAccountDto.email);
    if (accountExist) {
      throw new UnprocessableEntityException('해당 이메일로는 가입할 수 없습니다.');
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newAccount;

    try {

      const account = createAccountDto.toAccountEntity();
      account.password = await bcrypt.hash(account.password, 10);
      account.reg_date = new Date();

      newAccount = await queryRunner.manager.save(account);

      // TODO : 회원가입 인증 메일 전송

      await queryRunner.commitTransaction();

    } catch (e) {
      await queryRunner.rollbackTransaction();
      newAccount = null;
    } finally {
      await queryRunner.release();
    }

    return newAccount;
  }

  findAll() {
    return this.accountRepository.find();
  }

  findOne(id: number) {
    return this.accountRepository.findOneBy({
      account_id: id
    });
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {

    const account = updateAccountDto.toUpdateAccountEntity();

    return this.accountRepository.update(id, account);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  /**
   * 기존에 이메일 주소를 사용중인지 여부 가져오기
   * @param email
   */
  async checkAccountExists(email: string) {
    const account = await this.accountRepository.findOneBy({email: email});
    return account !== null;
  }

  async getByEmail(email: string) {
    const account = await this.accountRepository.findOneBy({email: email});
    return account;
  }

  async getByAccountId(account_id: number) {
    const account = await this.accountRepository.findOneBy({account_id: account_id});
    if (account) {
      return account;
    }
    throw new HttpException(
        '사용자가 존재하지 않습니다.',
        HttpStatus.NOT_FOUND,
    );
  }
}
