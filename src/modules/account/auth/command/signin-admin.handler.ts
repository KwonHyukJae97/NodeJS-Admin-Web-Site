import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account2 } from '../../entities/account';
import { SignInAdminCommand } from './signin-admin.command';
import * as bcrypt from 'bcrypt';
import { AccountService } from 'src/modules/account-bak/account.service';
import { AuthService } from '../auth.service';

@Injectable()
@CommandHandler(SignInAdminCommand)
export class SignInAdminHandler implements ICommandHandler<SignInAdminCommand> {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(Account2)
    private accountRepository: Repository<Account2>,
    private readonly accountService: AccountService,
    private readonly authSerive: AuthService,
  ) {}

  async execute(command: SignInAdminCommand) {
    const { id, password } = command;

    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException('존재하지 않는 관리자입니다.');
    }

    const match = await bcrypt.compare(password, account.password);

    if (!match) {
      throw new UnauthorizedException('비밀번호가 틀립니다. 다시 시도해주세요.');
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
      throw new HttpException('잘못된 인333증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }
  //비밀번호 체크
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 정보3312입니다.', HttpStatus.BAD_REQUEST);
    }
  }
}
