import { SignInUserHandler } from './signin-user.handler';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { AuthService } from '../auth.service';
import { TranslatorModule } from 'nestjs-translator';
import { Test, TestingModule } from '@nestjs/testing';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignInUserCommand } from './signin-user.command';
import * as bcrypt from 'bcrypt';

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

describe('SignIn User', () => {
  let signInUserHandler: SignInUserHandler;
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
        SignInUserHandler,
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

    signInUserHandler = module.get(SignInUserHandler);
    accountRepository = module.get(getRepositoryToken(Account));
    authService = module.get(AuthService);
  });

  describe('사용자 로그인 성공 여부', () => {
    const userInput = {
      id: 'user',
      password: 'user',
    };

    const findAccountFalse = {
      id: 'user',
      password: 'user',
      name: '사용자',
      email: 'user@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
      division: false,
    };

    const findAccountTrue = {
      id: 'user',
      password: 'user',
      name: '사용자',
      email: 'user@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
      division: true,
    };

    const returnUser = {
      accountId: 1,
      id: 'user',
      name: '사용자',
      email: 'user@email.com',
      phone: '010-1111-1111',
      nickname: '별명',
      birth: '20000203',
      gender: '0',
    };

    it('사용자 로그인 성공', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountFalse);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(userInput.password));
      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => returnUser,
        };
      });

      const result = await signInUserHandler.execute(
        new SignInUserCommand(userInput.id, userInput.password),
      );

      console.log(result);
      expect(result).toEqual({ account: returnUser });
    });

    it('계정 정보가 없을 경우 400 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(undefined);

      try {
        const result = await signInUserHandler.execute(
          new SignInUserCommand(userInput.id, userInput.password),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('사용자 로그인에  정보를 확인해주세요.');
      }
    });

    it('비밀번호가 올바르지 않을 경우 400 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountTrue);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      try {
        const result = await signInUserHandler.execute(
          new SignInUserCommand(userInput.id, userInput.password),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('입력한 비밀번호  정보를 확인해주세요.');
      }
    });

    it('사용자 계정이 아닐 경우 401 에러 발생', async () => {
      accountRepository.findOne.mockResolvedValue(findAccountTrue);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(userInput.password));
      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => returnUser,
        };
      });

      try {
        const result = await signInUserHandler.execute(
          new SignInUserCommand(userInput.id, userInput.password),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('사용자 로그인 정보가 아닙니다. 입력된 내용을 확인해주세요.');
      }
    });
  });
});
