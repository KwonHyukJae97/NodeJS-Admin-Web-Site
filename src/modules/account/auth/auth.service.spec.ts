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
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockEmailService = () => ({
  sendTempPassword: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('AuthService', () => {
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
  });
});
