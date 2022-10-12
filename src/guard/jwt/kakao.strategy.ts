import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { UserKakaoDto } from 'src/modules/account/auth/dto/user.kakao.dto';
import * as config from 'config';

const kakaoConfig = config.get('kakao');

export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: kakaoConfig.clientID,
      callbackURL: kakaoConfig.callbackURL,
      //   callbackURL: 'http://localhost:3000/auth/kakao/redirect',
    });
  }

  async validate(snsToken, refreshToken, profile, done) {
    const profileJson = profile._json;
    const kakao_account = profileJson.kakao_account;
    const payload: UserKakaoDto = {
      name: kakao_account.profile.nickname,
      snsId: profileJson.id,
      email:
        kakao_account.has_email && !kakao_account.email_needs_agreement
          ? kakao_account.email
          : null,
      snsToken,
    };
    done(null, payload);
  }
}
