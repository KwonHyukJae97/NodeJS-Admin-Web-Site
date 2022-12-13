import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import * as bcrypt from 'bcrypt';
import { SignInUserCommand } from './signin-user.command';
import { AuthService } from '../auth.service';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 사용자 로그인 핸들러
 */
@Injectable()
@CommandHandler(SignInUserCommand)
export class SignInUserHandler implements ICommandHandler<SignInUserCommand> {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly authService: AuthService,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: SignInUserCommand) {
    const { id, password } = command;

    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return this.convertException.badRequestAccountError('사용자 로그인에 ', 400);
    }

    const match = await bcrypt.compare(password, account.password);

    if (!match) {
      return this.convertException.badRequestAccountError('입력한 비밀번호 ', 400);
    }

    if (account.division === true) {
      return this.convertException.badInput('사용자 로그인 정보가 아닙니다. ', 400);
    }

    const returnUser = await this.accountRepository
      .createQueryBuilder('account')
      .select([
        'account.accountId',
        'account.id',
        'account.password',
        'account.name',
        'account.email',
        'account.phone',
        'account.nickname',
        'account.birth',
        'account.gender',
        'account.currentHashedRefreshToken',
        'account.ci',
        'account.snsId',
        'account.snsType',
        'account.snsToken',
        'account.regDate',
        'account.updateDate',
        'account.delDate',
        'account.loginDate',
        'account.division',
      ])
      .where('account.id = :id', { id })
      .getOne();

    return { account: returnUser };
  }

  //회원가입 유무
  public async validateUser(id: string, plainTextPassword: string): Promise<any> {
    try {
      const account = await this.authService.getById(id);
      await this.verifyPassword(plainTextPassword, account.password);
      const { password, ...result } = account;
      return result;
    } catch (error) {
      throw new HttpException('잘못된 인증 유저정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }
  //비밀번호 체크
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 유저정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }
}
