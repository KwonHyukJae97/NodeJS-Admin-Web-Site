import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { UserKakaoDto } from 'src/modules/account/auth/dto/user.kakao.dto';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: '214f882001474304a397de3fa79c9de0',
      callbackURL: 'http://localhost:3000/auth/kakao',
      // clientID: process.env.REST_APT_KEY,
      // callbackURL: process.env.REDIRECT_URI,
    });
  }
  async validate(accessToken, refreshToken, profile, done): Promise<any> {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const provider = profile.provider;
    const payload: UserKakaoDto = {
      name: kakao_account.profile.nickname,
      // snsId: profileJson.id,
      email:
        kakao_account.has_email && !kakao_account.email_needs_agreement
          ? kakao_account.email
          : null,
      birth: kakao_account.email,
      gender: kakao_account.gender,
      snsId: kakao_account.email,
      snsType: '01',
      snsToken: '123',
      accessToken,
    };
    console.log('카카오 스토리지', kakao_account);
    done(null, payload);
  }
}
