import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { ConvertException } from 'src/common/utils/convert-exception';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../entities/account';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SignController } from './auth.controller';
import { EmailService } from 'src/modules/email/email.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import * as uuid from 'uuid';
import * as bcrypt from 'bcrypt';

const mockRepository = () => ({
  update: jest.fn(async () => await Promise.resolve()),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
});

const mockEmailService = () => ({
  sendTempPassword: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('Auth Service', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let emailService: MockService<EmailService>;
  let accountRepository: MockRepository<Account>;

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
                return 3600;
              }
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload, option) => {
              return 'TOKEN';
            }),
          },
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
        {
          provide: uuid,
          useValue: {
            v4: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: mockEmailService(),
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    emailService = module.get(EmailService);
    accountRepository = module.get(getRepositoryToken(Account));
    jwtService = module.get(JwtService);
  });

  describe('임시 비밀번호 정상 발급 여부', () => {
    const Dto = { email: 'email@email.co.kr' };
    const tempUUID = uuid.v4();
    const tempPassword = tempUUID.split('-')[0];
    const user = {
      accountId: '1',
      id: 'test',
      password: '$2b$10$TtoRALAr8GVpJibZ4xU2N.cPT3ZK.WBgxDCnIQVWs.X0/HE4vqbge',
      name: '홍길동',
      email: 'email@email.co.kr',
      phone: '010-2323-1212',
      nickname: 'test1234',
      birth: '19880909',
      gender: '0',
      currentHashedRefreshToken: null,
      ci: null,
      snsId: null,
      snsType: null,
      snsToken: null,
      regDate: '2022-09-26T18:21:23.000Z',
      updateDate: '2022-12-06T18:32:07.000Z',
      delDate: null,
      loginDate: null,
      division: null,
    };

    it('임시 비밀번호 발급 성공', async () => {
      const salt = bcrypt.genSalt();
      const hashedPassword = bcrypt.hash(tempPassword, await salt);

      accountRepository.findOne.mockResolvedValue(user);
      accountRepository.update.mockResolvedValue(hashedPassword);
      emailService.sendTempPassword.mockReturnValue(Dto.email);

      const result = await authService.findPassword(Dto);

      expect(result.message).toEqual('이메일을 확인해주세요.');
    });

    it('메일정보 불일치', async () => {
      try {
        accountRepository.findOne.mockResolvedValueOnce(undefined);
        const result = await authService.findPassword(Dto);
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response.message).toBe('메일 정보가 정확하지 않습니다.');
      }
    });

    it('비밀번호 찾기 오류', async () => {
      try {
        await accountRepository.update.mockRejectedValue(undefined);
        throw new Error('비밀번호 찾기 오류입니다. 다시 시도해주세요.');
      } catch (e) {
        expect(e.message).toBe('비밀번호 찾기 오류입니다. 다시 시도해주세요.');
      }
    });
    describe('setCurrentRefreshToken', () => {
      it('일반 로그인 시 리프레시 토큰 정보 정상 업데이트 성공', async () => {
        const refreshToken = 'TOKEN';
        const id = 'test';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update');

        const result = await authService.setCurrentRefreshToken(refreshToken, id);

        expect(result).toBeUndefined();
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(accountRepository.update).toHaveBeenCalled();
      });

      it('일반 로그인 시 리프레시 토큰 정보 정상 업데이트 실패', async () => {
        const refreshToken = 'TOKEN';
        const id = 'test';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update').mockRejectedValue(null);

        try {
          const result = await authService.setCurrentRefreshToken(refreshToken, id);
          expect(result).toBeDefined();
          expect(bcrypt.hash).toHaveBeenCalled();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('setSocialCurrentRefreshToken', () => {
      it('소셜 로그인 시 리프레시 토큰 정보 정상 업데이트 성공', async () => {
        const refreshToken = 'TOKEN';
        const snsId = 'kakao@email.com';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update');

        const result = await authService.setSocialCurrentRefreshToken(refreshToken, snsId);

        expect(result).toBeUndefined();
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(accountRepository.update).toHaveBeenCalled();
      });

      it('소셜 로그인 시 리프레시 토큰 정보 정상 업데이트 실패', async () => {
        const refreshToken = 'TOKEN';
        const snsId = 'kakao@email.com';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update').mockRejectedValue(null);

        try {
          const result = await authService.setSocialCurrentRefreshToken(refreshToken, snsId);
          expect(result).toBeDefined();
          expect(bcrypt.hash).toHaveBeenCalled();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('setSocialToken', () => {
      it('소셜 로그인 시 sns 토큰 정보 정상 업데이트 성공', async () => {
        const snsToken = 'TOKEN';
        const snsId = 'kakao@email.com';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update');

        const result = await authService.setSocialToken(snsToken, snsId);

        expect(result).toBeUndefined();
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(accountRepository.update).toHaveBeenCalled();
      });

      it('소셜 로그인 시 sns 토큰 정보 정상 업데이트 실패', async () => {
        const snsToken = 'TOKEN';
        const snsId = 'kakao@email.com';

        jest.spyOn(bcrypt, 'hash');
        jest.spyOn(accountRepository, 'update').mockRejectedValue(null);

        try {
          const result = await authService.setSocialToken(snsToken, snsId);
          expect(result).toBeDefined();
          expect(bcrypt.hash).toHaveBeenCalled();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('getCookieWithJwtAccessToken', () => {
      it('일반 로그인 시 엑세스 토큰 정상 발급', () => {
        const id = 'test';
        const snsType = '00';

        const returnAccessToken = {
          accessToken: 'TOKEN',
          accessOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 3600000,
          },
        };

        const result = authService.getCookieWithJwtAccessToken(id, snsType);

        expect(result).toBeDefined();
        expect(result).toEqual(returnAccessToken);
      });
    });

    describe('socialGetCookieWithJwtAccessToken', () => {
      it('소셜 로그인 시 엑세스 토큰 정상 발급', () => {
        const snsId = 'kakao@email.com';
        const snsType = '00';

        const returnAccessToken = {
          accessToken: 'TOKEN',
          accessOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 3600000,
          },
        };

        const result = authService.socialGetCookieWithJwtAccessToken(snsId, snsType);

        expect(result).toBeDefined();
        expect(result).toEqual(returnAccessToken);
      });
    });

    describe('getCookieWithJwtRefreshToken', () => {
      it('일반 로그인 시 리프레시 토큰 정상 발급 여부', () => {
        const id = 'test';
        const snsType = '00';

        const returnRefreshToken = {
          refreshToken: 'TOKEN',
          refreshOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 3600000,
          },
        };

        const result = authService.getCookieWithJwtRefreshToken(id, snsType);

        expect(result).toBeDefined();
        expect(result).toEqual(returnRefreshToken);
      });
    });

    describe('socialGetCookieWithJwtRefreshToken', () => {
      it('소셜 로그인 시 리프레시 토큰 정상 발급 여부', () => {
        const snsId = 'kakao@email.com';
        const snsType = '00';

        const returnRefreshToken = {
          refreshToken: 'TOKEN',
          refreshOption: {
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            maxAge: 3600000,
          },
        };

        const result = authService.socialGetCookieWithJwtRefreshToken(snsId, snsType);

        expect(result).toBeDefined();
        expect(result).toEqual(returnRefreshToken);
      });
    });

    describe('getCookiesForLogOut', () => {
      it('로그아웃 시 엑세스/리프레시 토큰 옵션 초기화 성공', () => {
        const result = authService.getCookiesForLogOut();

        expect(result).toBeDefined();
      });
    });

    describe('removeRefreshToken', () => {
      it('로그아웃 시 리프레시 토큰 삭제 후 정보 업데이트 성공', async () => {
        const accountId = 1;

        const updateAccount = {
          accountId: 1,
          name: '이름',
          email: 'admin@kakao.com',
          phone: '010-2345-6069',
          nickname: '별명',
          birth: '20220909',
          gender: '0',
          division: true,
          currentHashedRefreshToken: null,
        };

        accountRepository.update.mockResolvedValue(updateAccount);

        const result = await authService.removeRefreshToken(accountId);

        expect(result).toBeDefined();
        expect(accountRepository.update).toHaveBeenCalledTimes(1);
      });

      it('로그아웃 시 리프레시 토큰 삭제 후 정보 업데이트 실패', async () => {
        const accountId = 1;

        const updateAccount = {
          accountId: 1,
          name: '이름',
          email: 'admin@kakao.com',
          phone: '010-2345-6069',
          nickname: '별명',
          birth: '20220909',
          gender: '0',
          division: true,
          currentHashedRefreshToken: null,
        };

        accountRepository.update.mockRejectedValue(updateAccount);

        try {
          const result = await authService.removeRefreshToken(accountId);
          expect(result).toBeDefined();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('kakaoUserInfos', () => {
      const adminKakaoDto = {
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

      const findAccount = {
        name: '이름',
        email: 'admin@kakao.com',
        phone: '010-2345-6069',
        nickname: '별명',
        birth: '20220909',
        snsId: 'kakao',
        snsType: '01',
        snsToken: '',
        gender: '0',
        division: true,
      };

      it('계정 정보가 있을 경우 loginSuccess: true 반환', async () => {
        accountRepository.findOne.mockResolvedValue(findAccount);

        const result = await authService.kakaoUserInfos(adminKakaoDto);

        expect(result).toEqual({ loginSuccess: true });
      });

      it('계정 정보가 없을 경우 loginSuccess: false 반환', async () => {
        accountRepository.findOne.mockResolvedValue(undefined);

        const result = await authService.kakaoUserInfos(adminKakaoDto);

        expect(result).toEqual({ loginSuccess: false });
      });

      it('계정 정보 조회 시 문제가 발생할 경우 500 에러 발생', async () => {
        accountRepository.findOne.mockRejectedValue(findAccount);

        try {
          const result = await authService.kakaoUserInfos(adminKakaoDto);
          expect(result).toBeDefined();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('naverUserInfos', () => {
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

      const findAccount = {
        name: '이름',
        email: 'admin@naver.com',
        phone: '010-8592-8520',
        nickname: '별명',
        birth: '20220909',
        snsId: 'naver',
        snsType: '01',
        snsToken: '',
        gender: '0',
        division: true,
      };

      it('계정 정보가 있을 경우 loginSuccess: true 반환', async () => {
        accountRepository.findOne.mockResolvedValue(findAccount);

        const result = await authService.naverUserInfos(adminNaverDto);

        expect(result).toEqual({ loginSuccess: true });
      });

      it('계정 정보가 없을 경우 loginSuccess: false 반환', async () => {
        accountRepository.findOne.mockResolvedValue(undefined);

        const result = await authService.naverUserInfos(adminNaverDto);

        expect(result).toEqual({ loginSuccess: false });
      });

      it('계정 정보 조회 시 문제가 발생할 경우 500 에러 발생', async () => {
        accountRepository.findOne.mockRejectedValue(findAccount);

        try {
          const result = await authService.naverUserInfos(adminNaverDto);
          expect(result).toBeDefined();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });

    describe('googleUserInfos', () => {
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

      const findAccount = {
        name: '이름',
        email: 'google@email.com',
        phone: '010-8592-8520',
        nickname: '별명',
        birth: '20220909',
        snsId: 'google',
        snsType: '02',
        snsToken: '',
        gender: '0',
        division: true,
      };

      it('계정 정보가 있을 경우 loginSuccess: true 반환', async () => {
        accountRepository.findOne.mockResolvedValue(findAccount);

        const result = await authService.googleUserInfos(adminGoogleDto);

        expect(result).toEqual({ loginSuccess: true });
      });

      it('계정 정보가 없을 경우 loginSuccess: false 반환', async () => {
        accountRepository.findOne.mockResolvedValue(undefined);

        const result = await authService.googleUserInfos(adminGoogleDto);

        expect(result).toEqual({ loginSuccess: false });
      });

      it('계정 정보 조회 시 문제가 발생할 경우 500 에러 발생', async () => {
        accountRepository.findOne.mockRejectedValue(findAccount);

        try {
          const result = await authService.googleUserInfos(adminGoogleDto);
          expect(result).toBeDefined();
        } catch (err) {
          expect(err.status).toBe(500);
          expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      });
    });
  });
});
