import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'src/modules/auth/auth.service';
import { Strategy } from 'passport-local';
import { Account } from 'src/modules/account-bak/entities/account.entity';
import { Account2 } from 'src/modules/account/entities/account';
import { AuthService2 } from 'src/modules/account/auth/auth2.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService, private authService2: AuthService2) {
    super({
      usernameField: 'id',
      passwordField: 'password',
    });
  }

  async validate(id: string, password: string): Promise<Account2> {
    return this.authService2.validateUser(id, password);
  }
}
