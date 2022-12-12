import { Test, TestingModule } from '@nestjs/testing';
import { TranslatorModule } from 'nestjs-translator';
import { AuthService } from './auth.service';
import { SignController } from './auth.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Connection } from 'typeorm';
import { Account } from '../entities/account';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtManageService } from '../../../guard/jwt/jwt-manage.service';
import { EmailService } from '../../email/email.service';
import { ConvertException } from '../../../common/utils/convert-exception';
import { createMock } from '@golevelup/ts-jest';
import { response, Response } from 'express';

const mockRepository = () => ({
  update: jest.fn(),
  findOne: jest.fn(),
});

const mockService = () => {
  socialGetCookieWithJwtAccessToken: jest.fn();
  socialGetCookieWithJwtRefreshToken: jest.fn();
  setSocialCurrentRefreshToken: jest.fn();
  setSocialToken: jest.fn();
  kakaoUserInfos: jest.fn();
  getCookiesForLogOut: jest.fn();
  removeRefreshToken: jest.fn();
};

const mockRequestObj = (method: string, body: any) => {
  return createMock<Request>({
    method: method,
    body: body,
  });
};

const mockResponseObj = () => {
  return createMock<Response>({
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  });
};

type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('Auth Controller', () => {
  let authController: SignController;
  let authService: MockService<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
          isGlobal: true,
        }),
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            signOptions: {
              expiresIn: `${config.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
            },
          }),
        }),
      ],
      controllers: [SignController],
      providers: [
        AuthService,
        JwtService,
        ConfigService,
        JwtManageService,
        EmailService,
        ConvertException,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: Connection,
          useClass: class MockConnection {},
        },
        {
          provide: AuthService,
          useValue: mockService(),
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'JWT_REFRESH_TOKEN_SECRET') {
                return 'refresh_token';
              }
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME') {
                return 3600;
              }
              if (key === 'JWT_ACCESS_TOKEN_SECRET') {
                return 'access_token';
              }
              if (key === 'JWT_ACCESS_TOKEN_EXPIRATION_TIME') {
                return 7200;
              }
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: mockService(),
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get(SignController);
    authService = module.get(AuthService);
  });

  describe('Admin Social Login', () => {
    describe('관리자 카카오 snsId 존재 여부', () => {
      const adminKaKaoDto = {
        name: '이름',
        email: 'admin@kakao.com',
        birth: '20220909',
        snsId: 'kakao',
        snsType: '01',
        snsToken: '',
        gender: '0',
        accessToken: '',
        resKakaoAccessToken: '',
      };
      const req = mockRequestObj('POST', adminKaKaoDto);
      const res = mockResponseObj();

      const getAccessToken = {
        accessToken: 'access_token',
        accessOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      const getRefreshToken = {
        refreshToken: 'refresh_token',
        refreshOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      it('카카오 snsId 정보가 있을 경우 loginSuccess: true 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const kakaoUserInfos = jest
          .spyOn(authService, 'kakaoUserInfos')
          .mockResolvedValue({ loginSuccess: true });

        const result = await authController.kakaoLoginUserInfo(req, res);

        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(kakaoUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: true });
      });

      it('카카오 snsId 정보가 없을 경우 loginSuccess: false 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const kakaoUserInfos = jest
          .spyOn(authService, 'kakaoUserInfos')
          .mockResolvedValue({ loginSuccess: false });

        const result = await authController.kakaoLoginUserInfo(req, res);

        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(kakaoUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: false });
      });
    });

    describe('관리자 네이버 snsId 존재 여부', () => {
      const adminNaverDto = {
        nickname: '별명',
        name: '이름',
        age: '20',
        birth: '20220909',
        phone: '010-8592-8520',
        snsId: 'naver',
        snsType: '00',
        snsToken: '',
        gender: '0',
        accessToken: '',
      };
      const req = mockRequestObj('POST', adminNaverDto);
      const res = mockResponseObj();

      const getAccessToken = {
        accessToken: 'access_token',
        accessOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      const getRefreshToken = {
        refreshToken: 'refresh_token',
        refreshOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      it('네이버 snsId 정보가 있을 경우 loginSuccess: true 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const naverUserInfos = jest
          .spyOn(authService, 'naverUserInfos')
          .mockResolvedValue({ loginSuccess: true });

        const result = await authController.naverLoginUserInfo(req, res);

        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(naverUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: true });
      });

      it('네이버 snsId 정보가 없을 경우 loginSuccess: false 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const naverUserInfos = jest
          .spyOn(authService, 'naverUserInfos')
          .mockResolvedValue({ loginSuccess: false });

        const result = await authController.naverLoginUserInfo(req, res);

        // Then
        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(naverUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: false });
      });
    });

    describe('관리자 구글 snsId 존재 여부', () => {
      const adminGoogleDto = {
        name: '이름',
        email: 'google@email.com',
        birth: '20220909',
        snsId: 'google',
        snsType: '02',
        snsToken: '',
        gender: '0',
        accessToken: '',
      };
      const req = mockRequestObj('POST', adminGoogleDto);
      const res = mockResponseObj();

      const getAccessToken = {
        accessToken: 'access_token',
        accessOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      const getRefreshToken = {
        refreshToken: 'refresh_token',
        refreshOption: {
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          maxAge: 3600,
        },
      };

      it('구글 snsId 정보가 있을 경우 loginSuccess: true 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const googleUserInfos = jest
          .spyOn(authService, 'googleUserInfos')
          .mockResolvedValue({ loginSuccess: true });

        const result = await authController.googleLoginUserInfo(req, res);

        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(googleUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: true });
      });

      it('구글 snsId 정보가 없을 경우 loginSuccess: false 반환', async () => {
        const socialGetCookieWithJwtAccessToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtAccessToken')
          .mockResolvedValue(getAccessToken);

        const socialGetCookieWithJwtRefreshToken = jest
          .spyOn(authService, 'socialGetCookieWithJwtRefreshToken')
          .mockResolvedValue(getRefreshToken);

        const setSocialCurrentRefreshToken = jest
          .spyOn(authService, 'setSocialCurrentRefreshToken')
          .mockResolvedValue(() => null);

        const setSocialToken = jest
          .spyOn(authService, 'setSocialToken')
          .mockResolvedValue(() => null);

        res.set('authentication', getAccessToken.accessToken);
        res.set('Refresh', getRefreshToken.refreshToken);

        const googleUserInfos = jest
          .spyOn(authService, 'googleUserInfos')
          .mockResolvedValue({ loginSuccess: false });

        const result = await authController.googleLoginUserInfo(req, res);

        expect(socialGetCookieWithJwtAccessToken).toHaveBeenCalledTimes(1);
        expect(socialGetCookieWithJwtRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialCurrentRefreshToken).toHaveBeenCalledTimes(1);
        expect(setSocialToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(googleUserInfos).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ loginSuccess: false });
      });
    });
  });

  describe('Logout Admin', () => {
    describe('관리자 로그아웃 여부', () => {
      it('관리자 로그아웃 성공', async () => {
        const adminInfo = {
          user: {
            accountId: 1,
          },
        };
        const req = mockRequestObj('POST', adminInfo);
        const res = mockResponseObj();

        const getResetTokens = {
          accessOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 0,
          },
          refreshOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 0,
          },
        };

        const getCookiesForLogOut = jest
          .spyOn(authService, 'getCookiesForLogOut')
          .mockReturnValue(getResetTokens);

        const removeRefreshToken = jest
          .spyOn(authService, 'removeRefreshToken')
          .mockResolvedValue(adminInfo.user.accountId);

        res.set('authentication', '');
        res.set('Refresh', '');

        jest.spyOn(response, 'sendStatus').mockReturnValue(res.status(200));

        const result = await authController.logoutAdmin(req, res);

        expect(getCookiesForLogOut).toHaveBeenCalledTimes(1);
        expect(removeRefreshToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(result).toEqual('로그아웃 완료');
      });
    });
  });

  describe('Logout User', () => {
    describe('사용자 로그아웃 여부', () => {
      it('사용자 로그아웃 성공', async () => {
        const userInfo = {
          user: {
            accountId: 1,
          },
        };
        const req = mockRequestObj('POST', userInfo);
        const res = mockResponseObj();

        const getResetTokens = {
          accessOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 0,
          },
          refreshOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 0,
          },
        };

        const getCookiesForLogOut = jest
          .spyOn(authService, 'getCookiesForLogOut')
          .mockReturnValue(getResetTokens);

        const removeRefreshToken = jest
          .spyOn(authService, 'removeRefreshToken')
          .mockResolvedValue(userInfo.user.accountId);

        res.set('authentication', '');
        res.set('Refresh', '');

        jest.spyOn(response, 'sendStatus').mockReturnValue(res.status(200));

        const result = await authController.logoutUser(req, res);

        expect(getCookiesForLogOut).toHaveBeenCalledTimes(1);
        expect(removeRefreshToken).toHaveBeenCalledTimes(1);
        expect(res.set).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(result).toEqual('로그아웃 완료');
      });
    });
  });
});
