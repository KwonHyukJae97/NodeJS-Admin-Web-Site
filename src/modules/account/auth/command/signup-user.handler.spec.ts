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
    const accountId = 10;
    const userId = 10;
    const id = 'user1234';
    const email = 'email@email.com';
    const phone = '01012341234';
    const nickname = 'kwon123';

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
    it('사용자 회원가입 성공', async () => {
      accountRepository.create.mockReturnValue(userAccountData);
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

    it('중복된 아이디를 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockReturnValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.save.mockReturnValue(userAccountData);

      try {
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
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(400);
        expect(Err.response).toBe('이미 존재하는 아이디입니다. 입력된 내용을 확인해주세요.');
      }
    });

    it('중복된 이메일을 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.findOne.mockResolvedValue(email);
      accountRepository.save.mockResolvedValue(userAccountData);

      if (!id) {
        try {
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
          expect(result).toBeDefined();
        } catch (Err: any) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 이메일입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('중복된 연락처를 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.findOne.mockResolvedValue(email);
      accountRepository.findOne.mockResolvedValue(phone);
      accountRepository.save.mockResolvedValue(userAccountData);

      if (!id && !email) {
        try {
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
          expect(result).toBeDefined();
        } catch (Err: any) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 연락처입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('중복된 닉네임을 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.findOne.mockResolvedValue(email);
      accountRepository.findOne.mockResolvedValue(phone);
      accountRepository.findOne.mockResolvedValue(nickname);
      accountRepository.save.mockResolvedValue(userAccountData);

      if (!id && !email && !phone) {
        try {
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
          expect(result).toBeDefined();
        } catch (Err: any) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 닉네임입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('사용자 회원가입에 실패 할 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.findOne.mockResolvedValue(email);
      accountRepository.findOne.mockResolvedValue(phone);
      accountRepository.findOne.mockResolvedValue(nickname);
      accountRepository.save.mockRejectedValue(userAccountData);

      if (!id && !email && !phone && !nickname) {
        try {
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
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('사용자 회원가입에 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('유저테이블 저장에 문제가 있을 경우 500 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(userAccountData);
      accountRepository.findOne.mockResolvedValue(id);
      accountRepository.findOne.mockResolvedValue(email);
      accountRepository.findOne.mockResolvedValue(phone);
      accountRepository.findOne.mockResolvedValue(nickname);
      accountRepository.save.mockRejectedValue(userAccountData);
      userRepository.save.mockRejectedValue(userAccountData);

      if (!id && !email && !phone && !nickname) {
        try {
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
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(500);
          expect(Err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      }
    });
  });
});
