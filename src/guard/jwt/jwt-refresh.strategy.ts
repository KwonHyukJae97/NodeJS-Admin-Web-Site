import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/modules/account/auth/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log(
            '만료된 엑세스 토큰을 갱신하기 위한 리프레쉬 토큰 검즘',
            request.cookies.Refresh,
          );
          return request?.cookies?.Refresh;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req, payload: TokenPayload) {
    console.log('tokenPaylod ID: ', payload.id);
    if (payload.id == null) {
      const refreshToken = req.cookies?.Refresh;
      return this.authService.getSnsIdRefreshTokenMatches(refreshToken, payload.snsId);
    } else {
      const refreshToken = req.cookies?.Refresh;
      return this.authService.getAccountRefreshTokenMatches(refreshToken, payload.id);
    }
  }
}
