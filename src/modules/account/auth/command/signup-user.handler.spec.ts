import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account';
import { User } from '../../user/entities/user';
import { SignUpUserCommand } from './signup-user.command';
import { SignUpUserHandler } from './signup-user.handler';

const mockRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//service 사용시
// type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('사용자 회원가입', () => {
  let signUpUserHandler: SignUpUserHandler;
  let userRepository: MockRepository<User>;
  let accountRepository: MockRepository<Account>;

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
        SignUpUserHandler,
        ConvertException,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    signUpUserHandler = module.get(SignUpUserHandler);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('사용자 회원가입 성공 여부', () => {
    it('사용자 회원가입 성공', async () => {
      const accountId = 10;
      const userId = 10;

      const userAccountData = {
        accountId: accountId,
        id: 'user1234',
        password: '12341234',
        name: '권혁재',
        email: 'email@email.com',
        phone: '01012341234',
        nickname: 'kwon123',
        birth: '971113',
        gender: '0',
      };

      const userData = {
        accountId: accountId,
        userId: userId,
        grade: 1,
      };

      accountRepository.create.mockReturnValue(userAccountData);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.id);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.email);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.phone);
      //   companyRepository.findOne.mockReturnValue(adminCompanyData.businessNumber);
      accountRepository.save.mockReturnValue(userAccountData);

      userRepository.create.mockReturnValue(userData);
      userRepository.save.mockReturnValue(userData);

      const result = await signUpUserHandler.execute(
        new SignUpUserCommand(
          userAccountData.id,
          userAccountData.password,
          userAccountData.name,
          userAccountData.email,
          userAccountData.phone,
          userAccountData.nickname,
          userAccountData.birth,
          userAccountData.gender,
          userData.grade,
        ),
      );

      expect(result).toEqual('회원가입 완료 (사용자)');
    });
  });
});
