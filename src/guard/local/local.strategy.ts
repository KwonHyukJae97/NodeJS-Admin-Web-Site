import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'src/modules/auth/auth.service';
import { Strategy } from 'passport-local';
import { Account } from 'src/modules/account-bak/entities/account.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Account> {
    return this.authService.validateUser(email, password);
  }
}
