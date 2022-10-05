import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user';
import { Account2 } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { ConfigService } from '@nestjs/config';
import { AccountService } from 'src/modules/account-bak/account.service';
import { ModuleTokenFactory } from '@nestjs/core/injector/module-token-factory';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';

/**
 * 로그인 관련 서비스
 */
@Injectable()
export class AuthService2 {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Account2)
    private accountRepository: Repository<Account2>,

    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly jwtManageService: JwtManageService,
  ) {}

  /**
   * 사용자 로그인 서비스 (RefreshToken 발급 안됨.)
   */
  async signInUser(signInUserDto: SignInUserDto): Promise<{ accessToken: string }> {
    const { id, password } = signInUserDto;
    const user = await this.accountRepository.findOne({ where: { id } });

    console.log('사용자 로그인 서비스 테스트 로그', user);
    /**
     * division 값이 사용자(false: 0) 일 경우에만 로그인 시도 가능
        if (user.division === true) {
          throw new UnauthorizedException('로그인 정보를 확인해주세요.');
        }
     */

    /**
     * bcrypt.compare 함수로 암호화된 비밀번호 비교
     */
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { id };
      const accessToken = await this.jwtService.sign(payload);

      console.log('사용자 로그인 TOKEN 테스트', accessToken);

      return { accessToken };
    } else {
      throw new UnauthorizedException('사용자 로그인 실패');
    }
  }

  /**
   * 관리자 로그인 서비스 (RefreshToken 발급 안됨.)
   */
  async signInAdmin(signinAdminDto: SignInAdminDto): Promise<{ accessToken: string }> {
    const { id, password } = signinAdminDto;
    const admin = await this.accountRepository.findOne({ where: { id } });

    console.log('관리자 로그인 서비스 테스트 로그', admin);

    //division 값이 관리자(true:1) 일 경우에만 로그인 시도 가능
    if (admin.division === false) {
      throw new UnauthorizedException('로그인 정보를 확인해주세요.');
    }

    /**
     * bcrypt.compare 함수로 암호화된 비밀번호 비교
     */
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const payload = { id };
      const accessToken = await this.jwtService.sign(payload);

      console.log('관리자 로그인 TOKEN 테스트', accessToken);

      return { accessToken };
    } else {
      throw new UnauthorizedException('관리자 로그인 실패');
    }
  }
  //아이디 존재 유무
  public async find(id: string): Promise<Account2 | undefined> {
    return this.accountRepository.findOne({ where: { id } });
  }

  //회원가입 유무
  public async validateUser(id: string, plainTextPassword: string): Promise<any> {
    try {
      const account = await this.accountService.getById(id);
      await this.verifyPassword(plainTextPassword, account.password);
      const { password, ...result } = account;
      return result;
    } catch (error) {
      throw new HttpException('잘못된 인증 정보입니다.2', HttpStatus.BAD_REQUEST);
    }
  }
  //비밀번호 체크
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  //AccessToken 발급
  public getCookieWithJwtAccessToken2(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });

    return {
      accessToken: token,
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: Number(this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')) * 1000,
      },
    };
  }
  //RefreshToken 발급
  public getCookieWithJwtRefreshToken2(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });

    return {
      refreshToken: token,
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')) * 1000,
      },
    };
  }

  /**
   * 관리자 로그인 RefreshToken 발급
   */
  async login({ id, password }: SignInAdminDto) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      throw new UnauthorizedException('비밀번호가 틀립니다. 다시 시도해주세요.');
    }

    //division 값 확인 후 관리자만 로그인 가능
    if (account.division === false) {
      throw new UnauthorizedException('로그인 정보를 확인해주세요.');
    }
    const { accessToken, accessOption } = await this.getCookieWithJwtAccessToken2(id);

    const { refreshToken, refreshOption } = await this.getCookieWithJwtRefreshToken2(id);
    await this.accountService.setCurrentRefreshToken2(refreshToken, id);

    const returnAdmin = await this.accountRepository
      .createQueryBuilder('account')
      .select([
        'account.id',
        'account.name',
        'account.email',
        'account.phone',
        'account.nickname',
        'account.birth',
        'account.gender',
        'account.currentHashedRefreshToken',
        'account.regDate',
        'account.division',
      ])
      .where('account.id = :id', { id })
      .getOne();
    return {
      accessToken,
      accessOption,
      refreshToken,
      refreshOption,
      admin: returnAdmin,
    };
  }

  // async login(account: Account2) {
  //   const payload = { id: account.id, accountId: account.accountId };
  //   const token = this.jwtService.sign(payload);
  //   return {
  //     token: token,
  //     domain: 'localhost',
  //     path: '/',
  //     httpOnly: true,
  //     maxAge: Number(this.configService.get('JWT_EXPIRATION_TIME')) * 1000,
  //   };
  // }

  public async getCookieForLogin2(accountId: number, id: string) {
    const payload: TokenPayload2 = {
      accountId: accountId,
      id: id,
    };

    const { accessToken, accessOption } = this.getCookieWithJwtAccessToken2(id);
    const { refreshToken, refreshOption } = this.getCookieWithJwtRefreshToken2(id);

    await this.accountService.setCurrentRefreshToken2(id, refreshToken);

    return { accessToken, accessOption, refreshToken, refreshOption };
  }

  public getCookieForLogOut2() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }

  public async refreshTokenChange2(id: string, refreshToken: string) {
    if (this.jwtManageService.isNeedRefreshTokenChange(refreshToken)) {
      const newRefreshToken = this.getCookieWithJwtRefreshToken2(id);
      await this.accountService.setCurrentRefreshToken2(id, newRefreshToken.refreshToken);

      return newRefreshToken;
    }
  }
}
