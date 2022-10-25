import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user';
import { Account } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { ConfigService } from '@nestjs/config';
import { AccountService } from 'src/modules/account-bak/account.service';
import { ModuleTokenFactory } from '@nestjs/core/injector/module-token-factory';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import { FindIdDto } from './dto/findid.dto';
import { UserKakaoDto } from './dto/user.kakao.dto';
import axios from 'axios';
import { UserLoginResDto } from './dto/login-res.dto';

/**
 * 로그인 관련 서비스
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(Account)
    private accountRepository: Repository<Account>,

    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly jwtManageService: JwtManageService,
  ) {}

  //아이디 존재 유무
  public async find(id: string): Promise<Account | undefined> {
    return this.accountRepository.findOne({ where: { id } });
  }

  async getById(id: string) {
    const account = await this.accountRepository.findOneBy({
      id: id,
    });

    return account;
  }

  //회원가입 유무
  public async validateUser(id: string, plainTextPassword: string): Promise<any> {
    try {
      const account = await this.getById(id);
      await this.verifyPassword(plainTextPassword, account.password);
      const { password, ...result } = account;
      return result;
    } catch (error) {
      throw new HttpException('잘못된 인2121증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }
  //비밀번호 체크
  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 정보12입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  async getByAccountId(id: string, showCurrentHashedRefreshToken: boolean) {
    const account = await this.accountRepository.findOne({ where: { id } });
    console.log('accountService- Id--------', id);
    console.log('accountService- account--------', account);
    if (account) {
      delete account.password;
      if (!showCurrentHashedRefreshToken) {
        delete account.currentHashedRefreshToken;
      }

      return account;
    }
  }

  //snsType 을  포함한 getBySnsType 생성
  async getBySnsType(snsType: string, showCurrentHashedRefreshToken: boolean) {
    const account = await this.accountRepository.findOne({ where: { snsType } });
    console.log('accountService- Id--------', snsType);
    if (account) {
      delete account.password;
      if (!showCurrentHashedRefreshToken) {
        delete account.currentHashedRefreshToken;
      }

      return account;
    }
  }

  async getAccountRefreshTokenMatches(
    refreshToken: string,
    id: string,
  ): Promise<{ result: boolean }> {
    const account = await this.accountRepository.findOne({ where: { id } });

    if (!account) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const isRefreshTokenMatching = await compare(refreshToken, account.currentHashedRefreshToken);

    if (isRefreshTokenMatching) {
      return { result: true };
    } else {
      throw new UnauthorizedException('여기에서 접근에러입니다.');
    }
  }

  async setCurrentRefreshToken(refreshToken: string, id: string) {
    if (refreshToken) {
      refreshToken = await bcrypt.hash(refreshToken, 10);
    }
    await this.accountRepository.update({ id }, { currentHashedRefreshToken: refreshToken });
  }

  //AccessToken 발급
  public getCookieWithJwtAccessToken(id: string, snsType: string) {
    const payload = { id, snsType };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });

    // 토큰과 토큰옵션을 리턴
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

  public kakaoGetCookieWithJwtAccessToken(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });

    // 토큰과 토큰옵션을 리턴
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
  public getCookieWithJwtRefreshToken(id: string, snsType: string) {
    const payload = { id, snsType };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });

    //Refresh 토큰과 옵션을 리턴
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

  public kakaoGetCookieWithJwtRefreshToken(email: string) {
    const payload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });

    //Refresh 토큰과 옵션을 리턴
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
  async loginAdmin({ id, password }: SignInAdminDto) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException('존재하지 않는 관리자입니다.');
    }
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      throw new UnauthorizedException('비밀번호가 틀립니다. 다시 시도해주세요.');
    }

    //division 값 확인 후 관리자만 로그인 가능
    if (account.division === false) {
      throw new UnauthorizedException('로그인 정보를 확인해주세요.');
    }
    const { accessToken, accessOption } = await this.getCookieWithJwtAccessToken(id, null);

    const { refreshToken, refreshOption } = await this.getCookieWithJwtRefreshToken(id, null);
    await this.setCurrentRefreshToken(refreshToken, id);

    // const lastLoginDate = new Date(account.loginDate).getTime() / 1000;

    // console.log('최근 로그인 일시', lastLoginDate);
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
    return {
      accessToken,
      accessOption,
      refreshToken,
      refreshOption,
      account: returnAdmin,
    };
  }

  /**
   * 사용자 로그인 RefreshToken 발급
   */
  async loginUser({ id, password }: SignInUserDto) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      throw new UnauthorizedException('비밀번호가 틀립니다. 다시 시도해주세요.');
    }

    //division 값 확인 후 사용자만 로그인 가능
    if (account.division === true) {
      throw new UnauthorizedException('로그인 정보를 확인해주세요.');
    }
    const { accessToken, accessOption } = await this.getCookieWithJwtAccessToken(id, null);

    const { refreshToken, refreshOption } = await this.getCookieWithJwtRefreshToken(id, null);
    await this.setCurrentRefreshToken(refreshToken, id);

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
    return {
      accessToken,
      accessOption,
      refreshToken,
      refreshOption,
      account: returnUser,
    };
  }

  public getCookiesForLogOut2() {
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

  public async refreshTokenChange(id: string, payload: TokenPayload, refreshToken: string) {
    if (this.jwtManageService.isNeedRefreshTokenChange(refreshToken)) {
      const newRefreshToken = this.jwtManageService.getCookieWithJwtRefreshToken(payload);
      await this.setCurrentRefreshToken(id, newRefreshToken.refreshToken);

      return newRefreshToken;
    }
  }

  // 이름과 연락처로 해당 아이디 조회
  async findId({ name, phone }: FindIdDto) {
    console.log('아이디 찾기 테스트', name);
    console.log('아이디 찾기 테스트', phone);

    const id = await this.accountRepository.findOne({ where: { name, phone } });
    if (!id) {
      throw new UnauthorizedException('입력한 정보에 대한 일치하는 아이디가 없습니다.');
    }
    const returnId = await this.accountRepository
      .createQueryBuilder('account')
      .select('account.id')
      .where('account.name = :name', { name })
      .where('account.phone = :phone', { phone })
      .getOne();

    return returnId;
  }

  /**
   *
   * @param accountId
   * @returns accountId 값으로 해당 사용자의 리프래쉬 토큰을 null처리
   */
  async removeRefreshToken(accountId: number) {
    return this.accountRepository.update({ accountId }, { currentHashedRefreshToken: null });
  }

  //kakako 로그인 서비스v1
  async kakaoLogin(userKakaoDto: UserKakaoDto): Promise<any> {
    const { name, email, birth, gender } = userKakaoDto;
    let user = await this.accountRepository.findOne({ where: { email } });
    if (!user) {
      user = this.accountRepository.create({
        name,
        email,
        birth,
        gender,
      });
      try {
        await this.accountRepository.save(user);
      } catch (error) {
        if (error.code === '23505') {
          throw new ConflictException('Existing User');
        } else {
          throw new InternalServerErrorException();
        }
      }
    }
    const payload = { id: user.id, accessToken: userKakaoDto.accessToken };
    const accessToken = await this.jwtService.sign(payload);

    return { accessToken, msg: '카카오 로그인 성공' };
  }

  //카카오 사용자 정보 및 토큰 발급
  async kakaoUserInfo(code: string) {
    const qs = require('qs');
    const body = {
      grant_type: 'authorization_code',
      client_id: '214f882001474304a397de3fa79c9de0',
      redirect_uri: 'http://localhost:3000/auth/kakao',
      code: code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    try {
      // 1- 인가코드와 그외 필요한 요청 값을 담아 카카오 서버 /oauth/token으로 토큰 요청
      const response = await axios({
        method: 'POST',
        url: 'https://kauth.kakao.com/oauth/token',
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });

      const kakaoAccessToken: string = response.data.access_token;

      if (response.status === 200) {
        const headerUserInfo = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: 'Bearer ' + kakaoAccessToken,
        };

        // 2- 카카오로부터 받은 토큰 값 헤더에 담아 카카오 서버 /v2/user/me로 사용자 정보 요청
        const responseUserInfo = await axios({
          method: 'GET',
          url: 'https://kapi.kakao.com/v2/user/me',
          timeout: 30000,
          headers: headerUserInfo,
        });

        // 3- 카카오로부터 받은 사용자 정보들 중에서 필요한 값만 담아 응답값 반환
        if (responseUserInfo.status === 200) {
          const kakaoUserInfo = {
            email: responseUserInfo.data.kakao_account.email,
            name: responseUserInfo.data.kakao_account.profile.nickname,
            birth: responseUserInfo.data.kakao_account.birthday,
            gender: responseUserInfo.data.kakao_account.gender,
            kakaoAccessToken: kakaoAccessToken,
            kakaoAccount: responseUserInfo.data.kakao_account,
          };

          const { name, email, birth, gender } = kakaoUserInfo;
          const { accessToken, accessOption } = await this.kakaoGetCookieWithJwtAccessToken(email);

          const { refreshToken, refreshOption } = await this.kakaoGetCookieWithJwtRefreshToken(
            email,
          );
          await this.setCurrentRefreshToken(refreshToken, email);
          let user = await this.accountRepository.findOneBy({ email });

          // 카카오 로그인시 해당 이메일을 account 테이블에서 비교후 없을시 회원가입과 동시에 로그인 있으면 즉시 로그인
          if (!user) {
            user = this.accountRepository.create({
              email,
              name,
              birth: '19971113',
              gender: '0',
              nickname: 'test12',
              phone: '01010102939',
              currentHashedRefreshToken: refreshToken,
              snsType: '01',
            });

            try {
              await this.accountRepository.save(user);
            } catch (e) {
              console.log('error', e);
            }
          }
          //유저 정보와 토큰 정보를 리턴
          return {
            user,
            accessToken,
            accessOption,
            refreshToken,
            refreshOption,
          };
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException();
      }
    } catch (e) {
      // console.log(e)
      throw new UnauthorizedException();
    }
  }

  async kakaoSignIn(userKakaoDto: UserKakaoDto): Promise<UserLoginResDto> {
    const { name, email, birth, gender } = userKakaoDto;

    let user = await this.accountRepository.findOneBy({ email });

    if (!user) {
      user = this.accountRepository.create({
        email,
        name,
        birth,
        gender,
      });

      try {
        await this.accountRepository.save(user);
      } catch (e) {
        console.log('error', e);
      }
    }
    const payload = { email };
    const accessToken = await this.jwtService.sign(payload);

    const loginDto = {
      loginSuccess: true,
      accessToken: accessToken,
    };
    return loginDto;
  }

  //axios 로 kakaoUserInfo.email 넘겨주고 서비스단 처리 하기 디비값과 비교하여 존재하는지 조회 있으면 로그인 처리
  async kakaoUserInfos(userKakaoDto: UserKakaoDto) {
    // const { name, email, birth, snsId, snsType, gender } = userKakaoDto;

    const snsId = userKakaoDto.snsId;

    console.log('카카오 정보', userKakaoDto.snsId);

    const user = await this.accountRepository.findOne({ where: { snsId } });

    if (user) {
      console.log('사용자 가입 기록 있음', snsId);
      console.log('사용자 가입 기록 있음22', user);

      const payload = { snsId };
      const accessToken = await this.jwtService.sign(payload);
      const loginDto = {
        loginSuccess: true,
        accessToken: accessToken,
      };
      console.log('!!!!!!loginDto@@@@@', loginDto);
      return loginDto;
    } else {
      console.log('사용자 가입 기록 없음', snsId);
      const sencondDataDto = {
        loginSuccess: false,
      };
      console.log('2차 가입 정보 필요', sencondDataDto);
      return sencondDataDto;
    }
    //디비랑 이메일 비교까지 완료

    // console.log('kakao email', email);
    // if (!user) {
    //   return false;
    // } else {
    //   return true;
  }
}

/**
 * 휴면 계정처리를 위한 최근 로그인 일시(loginDate)를 체크하는 함수
 * 24시간에 한번씩 체크하여 최근 로그인 시간이 365일을 넘어가는 사용자의 계정을
 * 휴면계정 테이블 (Sleeper)로 넘긴다.
 * 넘길 때 Account 테이블의 true였던 is_active 컬럼을 false로 업데이트 후 넘긴다.
 * Account 테이블에 남겨야 하는 데이터 항목은(?, ?, ? ...)
 *
 */

// public async refreshTokenChange2(id: string, refreshToken: string) {
//   if (this.jwtManageService.isNeedRefreshTokenChange(refreshToken)) {
//     const newRefreshToken = this.getCookieWithJwtRefreshToken2(id);
//     await this.accountService.setCurrentRefreshToken2(id, newRefreshToken.refreshToken);

//     return newRefreshToken;
//   }
// }
