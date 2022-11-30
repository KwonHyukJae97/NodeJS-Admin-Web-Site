import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/modules/account/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log('----cookies----', request.cookies);
          return request?.cookies?.authentication;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      //만료된 토큰의 사용여부 옵션
      ignoreExpiration: false,
    });
  }

  //Account 엔티티와 연동 here
  async validate(payload: TokenPayload) {
    console.log('jwt test');
    //snsType 의 값이 null이면 일반 로그인 사용자, null이 아니면 소셜로그인 사용자
    if (payload.snsType == null) {
      //snsType 도 같이 비교
      return await this.authService.getByAccountId(payload.id, payload.snsType, false);
    } else {
      //snsID도 같이 비교
      console.log('snsID?', payload.snsId);
      console.log('snsType?', payload.snsType);
      return await this.authService.getBySnsType(payload.snsType, payload.snsId, false);
    }
  }
}
