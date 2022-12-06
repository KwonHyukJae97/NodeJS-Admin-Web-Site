import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';

@Injectable()
export class JwtManageService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public getJwtAccessToken(payload: TokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });

    return token;
  }

  public getCookieWithJwtAccessToken(payload: TokenPayload) {
    const token = this.getJwtAccessToken(payload);

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

  public getJwtRefreshToken(payload: TokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
    });
    return token;
  }

  public getCookieWithJwtRefreshToken(payload: TokenPayload) {
    const token = this.getJwtRefreshToken(payload);

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
   * JWT 토큰 관련 초기화 옵션
   */
  public getJwtCookieCleanOptions() {
    return {
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: 0,
    };
  }

  /**
   * jwt refresh token 갱신 필요한지 여부 가져오기
   * @param refreshToken
   */
  public isNeedRefreshTokenChange(refreshToken: string) {
    // 만약, refresh token 갱신이 필요하면 갱신 처리
    console.log('expexpexpe', refreshToken);
    const jwtRefreshToken = this.jwtService.decode(refreshToken);
    const exp = jwtRefreshToken['exp'];

    const currentTime = moment();
    const expTime = moment(exp * 1000);
    console.log('이엑스피타임', expTime);

    const diffSeconds = Math.floor(moment.duration(expTime.diff(currentTime)).asSeconds());

    if (diffSeconds < this.configService.get('JWT_REFRESH_TOKEN_CHANGE_TIME')) {
      return true;
    }

    return false;
  }
}
