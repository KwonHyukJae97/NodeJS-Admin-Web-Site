/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAllUserQueryHandler } from './get-all-user.handler';
import { User } from '../entities/user';
import { AccountFile } from '../../../file/entities/account-file';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GetAllUserQuery } from './get-all-user.query';

// Repository mocking
const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetAllUser', () => {
  let getAllUserHandler: GetAllUserQueryHandler;
  let userRepository: MockRepository<User>;
  let accountFileRepository: MockRepository<AccountFile>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      providers: [
        GetAllUserQueryHandler,
        ConvertException,

        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(AccountFile),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getAllUserHandler = module.get(GetAllUserQueryHandler);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    accountFileRepository = module.get<MockRepository<AccountFile>>(
      getRepositoryToken(AccountFile),
    );
  });

  describe('유저리스트 조회', () => {
    const userInfoList = [
      {
        accountId: 1,
        userId: 1,
        grade: 0,
      },
      {
        accountId: 2,
        userId: 2,
        grade: 1,
      },
    ];

    const accountFile = {
      accountFileId: 1,
      accountId: 1,
      originalFileName: '스크린샷 2022-10-19 20.22.28(2)',
      fileExt: '.png',
      filePath:
        'https://b2c-file-test.s3.ap-northeast-2.amazonaws.com/account/2022-10-27/19082121_c7bddcb5-59fd-4d08-b816-5d734bf09566',
      fileSize: 355102,
    };

    const resultUserList = [
      {
        user: {
          accountId: 1,
          userId: 1,
          grade: 0,
        },
        file: accountFile,
      },
      {
        user: {
          accountId: 2,
          userId: 2,
          grade: 1,
        },
        file: null,
      },
    ];

    it('사용자 리스트 조회 성공', async () => {
      userRepository.find.mockResolvedValue(userInfoList);
      accountFileRepository.findOneBy.mockResolvedValueOnce(accountFile);
      accountFileRepository.findOneBy.mockResolvedValueOnce(undefined);

      const result = await getAllUserHandler.execute(GetAllUserQuery);

      expect(userRepository.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual(resultUserList);
    });

    it('사용자 리스트가 없을 경우 404 에러 발생', async () => {
      userRepository.find.mockResolvedValue(undefined);

      try {
        const result = await getAllUserHandler.execute(GetAllUserQuery);
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('사용자 정보를 찾을 수 없습니다.');
      }
    });
  });
});
