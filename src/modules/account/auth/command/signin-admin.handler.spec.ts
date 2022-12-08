import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { AuthService } from '../auth.service';
import { TranslatorModule } from 'nestjs-translator';
import { Test, TestingModule } from '@nestjs/testing';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SignInAdminHandler } from './signin-admin.handler';
import { SignInAdminCommand } from './signin-admin.command';

const mockRepository = () => ({
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

const mockService = () => ({
  getById: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('SignIn Admin', () => {
  let signInAdminHandler: SignInAdminHandler;
  let accountRepository: MockRepository<Account>;
  let authService: MockService<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      providers: [
        SignInAdminHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: AuthService,
          useValue: mockService(),
        },
      ],
    }).compile();

    signInAdminHandler = module.get(SignInAdminHandler);
    accountRepository = module.get(getRepositoryToken(Account));
    authService = module.get(AuthService);
  });

  describe('관리자 로그인 성공 여부', () => {
    const adminInput = {
      id: 'admin',
      password: 'admin',
      accessToken: '',
      refreshToken: '',
    };

    const findAccountFalse = {
      id: 'admin',
      password: 'admin',
      name: '관리자',
      email: 'admin@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
      division: false,
    };

    const findAccountTrue = {
      id: 'admin',
      password: 'admin',
      name: '관리자',
      email: 'admin@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
      division: true,
    };

    const returnAdmin = {
      accountId: 1,
      id: 'admin',
      name: '관리자',
      email: 'admin@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
    };

    it('관리자 로그인 성공', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountTrue);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => returnAdmin,
        };
      });

      const result = await signInAdminHandler.execute(
        new SignInAdminCommand(
          adminInput.id,
          adminInput.password,
          adminInput.accessToken,
          adminInput.refreshToken,
        ),
      );

      console.log(result);
      expect(result).toEqual({
        account: returnAdmin,
        accessToken: adminInput.accessToken,
        refreshToken: adminInput.refreshToken,
      });
    });

    it('계정 정보가 없을 경우 400 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(undefined);

      try {
        const result = await signInAdminHandler.execute(
          new SignInAdminCommand(
            adminInput.id,
            adminInput.password,
            adminInput.accessToken,
            adminInput.refreshToken,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('관리자 로그인에  정보를 확인해주세요.');
      }
    });

    it('비밀번호가 일치하지 않을 경우 400 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountTrue);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      try {
        const result = await signInAdminHandler.execute(
          new SignInAdminCommand(
            adminInput.id,
            adminInput.password,
            adminInput.accessToken,
            adminInput.refreshToken,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('비밀번호에  정보를 확인해주세요.');
      }
    });

    it('관리자 계정이 아닐 경우 401 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountFalse);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => returnAdmin,
        };
      });

      try {
        const result = await signInAdminHandler.execute(
          new SignInAdminCommand(
            adminInput.id,
            adminInput.password,
            adminInput.accessToken,
            adminInput.refreshToken,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(401);
        expect(err.message).toBe('관리자 로그인 정보를 확인해주세요.');
      }
    });
  });
});
