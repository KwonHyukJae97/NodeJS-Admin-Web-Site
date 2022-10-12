import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountService } from 'src/modules/account-bak/account.service';
import { JwtManageService } from '../../guard/jwt/jwt-manage.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtManageService: JwtManageService,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {}

  public async validateUser(email: string, plainTextPassword: string) {
    try {
      const account = await this.accountService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, account.password);
      delete account.password;
      delete account.currentHashedRefreshToken;

      //TODO : 프론트단 임시 데이터 정의
      account.role = 'admin';
      account.ability = [
        {
          action: 'manage',
          subject: 'all',
        },
      ];
      return account;
    } catch (e) {
      throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 로그인 시 jwt 키 정보 연동되는 쿠키 정보 가져오기
   * refresh 토큰 정보 생성 시 DB에 데이터 업데이트 처리
   * @param accountId
   * @param email
   */
  public async getCookieForLogin(accountId: number, email: string) {
    const payload: TokenPayload = {
      accountId: accountId,
      email: email,
    };

    const { accessToken, accessOption } =
      this.jwtManageService.getCookieWithJwtAccessToken(payload);
    const { refreshToken, refreshOption } =
      this.jwtManageService.getCookieWithJwtRefreshToken(payload);

    await this.accountService.setCurrentRefreshToken(accountId, refreshToken);

    return { accessToken, accessOption, refreshToken, refreshOption };
  }

  /**
   * 로그아웃 시 jwt 키 쿠키 초기화 정보 가져오기
   */
  public getCookieForLogOut() {
    return {
      accessOption: this.jwtManageService.getJwtCookieCleanOptions(),
      refreshOption: this.jwtManageService.getJwtCookieCleanOptions(),
    };
  }

  /**
   * DB에서 해당 사용자의 jwt_refresh 토큰 정보 삭제 처리
   * @param accountId
   */
  async removeRefreshToken(accountId: number) {
    return this.accountService.removeRefreshToken(accountId);
  }

  /**
   * jwt refresh token 갱신이 필요한지 확인하여 갱신 처리 후
   * 신규 발급받은 token 정보 가져오기
   * @param accountId
   * @param payload
   * @param refreshToken
   */
  public async refreshTokenChange(accountId: number, payload: TokenPayload, refreshToken: string) {
    if (this.jwtManageService.isNeedRefreshTokenChange(refreshToken)) {
      const newRefreshToken = this.jwtManageService.getCookieWithJwtRefreshToken(payload);
      await this.accountService.setCurrentRefreshToken(accountId, newRefreshToken.refreshToken);

      return newRefreshToken;
    }
  }
}
