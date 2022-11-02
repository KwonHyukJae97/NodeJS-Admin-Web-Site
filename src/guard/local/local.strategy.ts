import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Account } from 'src/modules/account/entities/account';
import { AuthService } from 'src/modules/account/auth/auth.service';

//로그인시 아이디와 패스워드 유효성검사를 하는 Strategy
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    //생성자에서 usernameField는 원하는대로 지정가능
    super({
      usernameField: 'id',
      passwordField: 'password',
    });
  }

  // id 와 password를 받아서 유효성 검사 함수
  async validate(id: string, password: string): Promise<Account> {
    console.log('local test');
    return this.authService.validate(id, password);
  }
}
