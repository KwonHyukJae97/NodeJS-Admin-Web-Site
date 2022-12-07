/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetUserInfoQueryHandler } from './get-user-info.handler';
import { User } from '../entities/user';
import { AccountFile } from '../../../file/entities/account-file';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GetUserInfoQuery } from './get-user-info.query';
import { GetAllAdminQuery } from '../../admin/query/get-all-admin.query';
import { GetAdminInfoQuery } from '../../admin/query/get-admin-info.query';

// Repository mocking
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetUserInfo', () => {
  let getUserInfoHandler: GetUserInfoQueryHandler;
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
        GetUserInfoQueryHandler,
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

    getUserInfoHandler = module.get(GetUserInfoQueryHandler);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    accountFileRepository = module.get<MockRepository<AccountFile>>(
      getRepositoryToken(AccountFile),
    );
  });

  describe('유저 상세정보 조회', () => {
    const mockedUser = {
      user: {
        userId: '1',
        grade: 0,
        accountId: '1',
        account: {
          accountId: '1',
          id: 'test',
          password: '1234',
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
          updateDate: '2022-10-13T12:24:54.000Z',
          delDate: null,
          loginDate: null,
          division: null,
        },
      },
      file: {
        accountFileId: '15',
        accountId: '1',
        originalFileName: 'sample_images_01',
        fileName: 'account/2022-10-13/12245419_ca8c3783-3683-4a64-86c9-825ffc5af850',
        fileExt: '.png',
        filePath:
          'https://b2c-file-test.s3.amazonaws.com/account/2022-10-13/12245419_ca8c3783-3683-4a64-86c9-825ffc5af850',
        fileSize: '5545',
        regDate: '2022-10-13T12:24:54.000Z',
        updateDate: null,
        delDate: null,
      },
    };

    it('유저 상세 정보 반환', async () => {
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => mockedUser,
        };
      });
      const result = await getUserInfoHandler.execute(new GetUserInfoQuery(1));
      expect(result).toEqual(mockedUser);
    });

    it('해당 사용자 정보가 없을 경우 404 에러 발생', async () => {
      const userId = 1;

      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => undefined,
        };
      });

      try {
        const result = await getUserInfoHandler.execute(new GetUserInfoQuery(userId));
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('사용자 정보를 찾을 수 없습니다.');
      }
    });
  });
});
