import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { UpdateUserHandler } from './update-user.handler';
import { User } from '../entities/user';
import { Account } from '../../entities/account';
import { AccountFile } from '../../../file/entities/account-file';
import { AccountFileDb } from '../../account-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { EventBus } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import * as bcrypt from 'bcryptjs';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateUser', () => {
  let updateUserHandler: UpdateUserHandler;
  let userRepository: MockRepository<User>;
  let accountRepository: MockRepository<Account>;
  let accountFileRepository: MockRepository<AccountFile>;
  let eventBus: jest.Mocked<EventBus>;

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
        UpdateUserHandler,
        ConvertException,
        AccountFileDb,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(AccountFile),
          useValue: mockRepository(),
        },
        {
          provide: 'accountFile',
          useClass: AccountFileDb,
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    updateUserHandler = module.get(UpdateUserHandler);
    userRepository = module.get(getRepositoryToken(User));
    accountRepository = module.get(getRepositoryToken(Account));
    accountFileRepository = module.get(getRepositoryToken(AccountFile));
    eventBus = module.get(EventBus);
  });

  describe('사용자 정보 정상 수정 여부', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'medal.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from(__dirname + '/../../medal.png', 'utf8'),
      size: 51828,
    } as Express.MulterS3.File;

    // 수정하고자 하는 값
    const newUserInfo = {
      userId: 1,
      password: 'password',
      email: 'test@email.com',
      phone: '010-0000-0000',
      nickname: '닉네임 변경',
      grade: 0,
      file: mockFile,
    };

    // 기존 값(user)
    const userInfo = {
      userId: 1,
      grade: 1,
      accountId: 1,
    };

    // 기존 값(account)
    const accountInfo = {
      accountId: 1,
      id: 'test',
      name: '이름',
      email: 'email@email.com',
      phone: '010-1111-1111',
      nickname: '닉네임',
      grade: 1,
      birth: '20221202',
      gender: '0',
    };

    // 수정 내용 반영시 예상 결과 값(user)
    const updateUserInfo = {
      userId: 1,
      grade: 0,
      accountId: 1,
    };

    const updateAccountInfo = {
      accountId: 1,
      id: 'test',
      name: '이름',
      email: 'test@email.com',
      phone: '010-0000-0000',
      nickname: '닉네임 변경',
      grade: 0,
      birth: '20221202',
      gender: '0',
    };

    // 예상 결과 값
    const resultUserInfo = {
      accountId: 1,
      id: 'test',
      password: '$2a$10$9BXY43cplwHcQYkwt6FEgeM2q.edMDehiGPzN3Fn6GASzZ9QrNOYq',
      name: '이름',
      email: 'test@email.com',
      phone: '010-0000-0000',
      nickname: '닉네임 변경',
      grade: 0,
      birth: '20221202',
      gender: '0',
    };

    it('사용자 정보 수정 성공', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      userRepository.save.mockResolvedValue(updateUserInfo);
      jest.spyOn(bcrypt, 'genSalt');
      jest.spyOn(bcrypt, 'hash');
      accountRepository.save.mockResolvedValue(updateAccountInfo);
      accountFileRepository.findOneBy.mockResolvedValue(userInfo.accountId);

      const result = await updateUserHandler.execute(
        new UpdateUserCommand(
          newUserInfo.password,
          newUserInfo.email,
          newUserInfo.phone,
          newUserInfo.nickname,
          newUserInfo.grade,
          newUserInfo.userId,
          newUserInfo.file,
        ),
      );

      if (result instanceof Account) {
        expect(result.email).toEqual(resultUserInfo.email);
        expect(result.nickname).toEqual(resultUserInfo.nickname);
        expect(result.phone).toEqual(resultUserInfo.phone);
      }
      if (result instanceof User) {
        expect(result.grade).toEqual(resultUserInfo.grade);
      }
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
    });

    it('학년 정보에 문제가 있을 경우 400 에러 발생', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      userRepository.save.mockRejectedValue(updateUserInfo);

      try {
        const result = await updateUserHandler.execute(
          new UpdateUserCommand(
            newUserInfo.password,
            newUserInfo.email,
            newUserInfo.phone,
            newUserInfo.nickname,
            newUserInfo.grade,
            newUserInfo.userId,
            newUserInfo.file,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('학년정보에입력된 내용을 확인해주세요.');
      }
    });

    it('계정 정보에 문제가 있을 경우 500 에러 발생', async () => {
      userRepository.findOneBy.mockResolvedValue(userInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      userRepository.save.mockResolvedValue(updateUserInfo);
      accountRepository.save.mockRejectedValue(updateAccountInfo);

      try {
        const result = await updateUserHandler.execute(
          new UpdateUserCommand(
            newUserInfo.password,
            newUserInfo.email,
            newUserInfo.phone,
            newUserInfo.nickname,
            newUserInfo.grade,
            newUserInfo.userId,
            newUserInfo.file,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
      }
    });
  });
});
