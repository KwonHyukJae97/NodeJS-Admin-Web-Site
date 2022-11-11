import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { SignInAdminCommand } from './signin-admin.command';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { ConvertException } from 'src/common/utils/convert-exception';

/**
 * 관리자 로그인 핸들러
 */
@Injectable()
@CommandHandler(SignInAdminCommand)
export class SignInAdminHandler implements ICommandHandler<SignInAdminCommand> {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly authSerive: AuthService,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: SignInAdminCommand) {
    const { id, password } = command;

    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return this.convertException.badRequestAccountError('관리자 로그인에 ', 400);
    }

    const match = await bcrypt.compare(password, account.password);

    if (!match) {
      return this.convertException.badRequestAccountError('비밀번호에 ', 400);
    }

    if (account.division === false) {
      throw new UnauthorizedException('관리자 로그인 정보를 확인해주세요.');
    }

    const returnAdmin = await this.accountRepository
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

    return { account: returnAdmin };
  }

  //회원가입 유무
  public async validateUser(id: string, plainTextPassword: string): Promise<any> {
    try {
      const account = await this.authSerive.getById(id);
      await this.verifyPassword(plainTextPassword, account.password);
      const { password, ...result } = account;
      return result;
    } catch (error) {
      return this.convertException.badRequestAccountError('관리자 로그인에 ', 400);
    }
  }
  //비밀번호 체크
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      return this.convertException.badRequestAccountError('로그인', 400);
    }
  }
}
