import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Connection, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { compare, hash } from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private connection: Connection,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const accountExist = await this.getByEmail(createAccountDto.email);
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

      newAccount = await queryRunner.manager.save(account);
      delete newAccount.password;

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

  async findAll() {
    const accountList = await this.accountRepository.find();
    accountList.map((account) => {
      delete account.password;
      delete account.currentHashedRefreshToken;
    });

    return accountList;
  }

  async findOne(id: number) {
    const account = await this.accountRepository.findOneBy({
      accountId: id,
    });
    delete account.password;
    delete account.currentHashedRefreshToken;

    return account;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    const account = updateAccountDto.toUpdateAccountEntity();

    return this.accountRepository.update(id, account);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  async getByEmail(email: string) {
    const account = await this.accountRepository.findOneBy({
      email: email,
    });
    delete account.currentHashedRefreshToken;

    return account;
  }

  async getByAccountId(accountId: number, showCurrentHashedRefreshToken: boolean) {
    const account = await this.accountRepository.findOneBy({
      accountId: accountId,
    });
    if (account) {
      delete account.password;
      if (!showCurrentHashedRefreshToken) {
        delete account.currentHashedRefreshToken;
      }

      return account;
    }
    throw new HttpException('사용자가 존재하지 않습니다.', HttpStatus.NOT_FOUND);
  }

  /**
   * jwt refresh token 갱신 처리
   * @param accountId
   * @param refreshToken
   */
  async setCurrentRefreshToken(accountId: number, refreshToken: string) {
    const currentHashedRefreshToken = await hash(refreshToken, 10);
    await this.accountRepository.update(accountId, {
      currentHashedRefreshToken,
    });
  }

  /**
   * 수신 받은 jwt refresh 토큰과 DB에 저장된 refresh 토큰 정보가 일치하는지 여부 가져오기
   * @param accountId
   * @param refreshToken
   */
  async getAccountRefreshTokenMatches(accountId: number, refreshToken: string) {
    const account = await this.getByAccountId(accountId, true);

    const isRefreshTokenMatching = await compare(refreshToken, account.currentHashedRefreshToken);

    if (isRefreshTokenMatching) {
      return account;
    } else {
      throw new UnauthorizedException();
    }
  }

  /**
   * DB에서 해당 사용자의 jwt_refresh 토큰 정보 삭제 처리
   * @param accountId
   */
  async removeRefreshToken(accountId: number) {
    return this.accountRepository.update(accountId, {
      currentHashedRefreshToken: null,
    });
  }
}
