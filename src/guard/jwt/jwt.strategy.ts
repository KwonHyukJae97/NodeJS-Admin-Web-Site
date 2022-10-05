import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from '../../modules/account-bak/account.service';
import { ConfigService } from '@nestjs/config';

import { InjectRepository } from '@nestjs/typeorm';
import { Account2 } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Account2)
    private readonly accountRepository: Repository<Account2>,
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.authorization;
        },
      ]),
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayload) {
    return await this.accountService.getByAccountId(payload.accountId, false);
  }

  //Account 엔티티와 연동
  async validate2(payload: TokenPayload2) {
    return await this.accountService.getByAccountId2(payload.accountId, false);
  }

  async validate3({ req, id }) {
    const refreshToken = req.cookies?.refresh;
    console.log('리플래시', refreshToken);
    await this.accountService.getAccountRefreshTokenMatches2(refreshToken, id);
    const account: Account2 = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new UnauthorizedException();
    }
    return account;
  }
}
