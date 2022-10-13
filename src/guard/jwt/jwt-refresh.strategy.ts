import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccountService } from '../../modules/account-bak/account.service';
import { AuthService } from 'src/modules/account/auth/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.refresh;
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // async validate(req, payload: TokenPayload2) {
  //   const refreshToken = req.cookies?.refresh;

  //   await this.accountService.getAccountRefreshTokenMatches(payload.accountId, refreshToken);

  //   const account = await this.accountService.getByAccountId(payload.accountId, false);

  //   return account;
  // }

  // //Account 엔티티와 연동
  async validate(req, id: string) {
    const refreshToken = req.cookies?.refresh;
    return this.authService.getAccountRefreshTokenMatches(refreshToken, id);
  }
}
