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
    it('유저리스트 반환', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await getAllUserHandler.execute(GetAllUserQuery);

      expect(userRepository.find).toHaveBeenCalledTimes(1);

      expect(result).toEqual([]);
    });
  });
});
