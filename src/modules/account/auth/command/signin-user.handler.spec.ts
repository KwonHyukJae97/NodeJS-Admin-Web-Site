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
    it('사용자 로그인 성공', async () => {
      const userInput = {
        id: 'user',
        password: 'user',
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

      accountRepository.findOne.mockResolvedValue(userInput.id);
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

      expect(result).toEqual({ account: returnUser });
    });
  });
});
