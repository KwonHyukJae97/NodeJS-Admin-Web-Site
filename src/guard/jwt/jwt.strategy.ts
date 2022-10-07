import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from '../../modules/account-bak/account.service';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Account2 } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { AuthService2 } from 'src/modules/account/auth/auth2.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Account2)
    private readonly accountRepository: Repository<Account2>,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
    private readonly authService: AuthService2,
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
      ignoreExpiration: false,
    });
  }

  //Account 엔티티와 연동
  async validate(payload: TokenPayload2) {
    console.log('----payload----', payload);
    console.log('--------idididi-------------', payload.id);
    return await this.accountService.getByAccountId2(payload.id, false);
  }
}
