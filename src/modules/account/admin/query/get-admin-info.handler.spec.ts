import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Admin } from '../entities/admin';
import { GetAdminInfoQueryHandler } from './get-admin-info.handler';
import { AccountFile } from '../../../file/entities/account-file';
import { GetAdminInfoQuery } from './get-admin-info.query';
import { ConvertException } from '../../../../common/utils/convert-exception';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  findOneBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetDetailAdmin', () => {
  let getAdminInfoHandler: GetAdminInfoQueryHandler;
  let adminRepository: MockRepository<Admin>;
  let accountFileRepository: MockRepository<AccountFile>;

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
        GetAdminInfoQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(AccountFile),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getAdminInfoHandler = module.get(GetAdminInfoQueryHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountFileRepository = module.get(getRepositoryToken(AccountFile));
  });

  describe('관리자 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      // Given
      const adminId = 1;

      const account = {
        accountId: 1,
        id: 'test',
        name: '이름',
        email: 'test@email.com',
        phone: '010-0000-0000',
        nickname: '닉네임 변경',
        birth: '20221202',
        gender: '0',
      };

      const admin = {
        adminId: 1,
        companyId: 1,
        roleId: 1,
        accountId: 1,
        isSuper: false,
        account: account,
      };

      const accountFile = {
        accountFileId: 1,
        accountId: 1,
        originalFileName: '스크린샷 2022-10-19 20.22.28(2)',
        fileExt: '.png',
        filePath:
          'https://b2c-file-test.s3.ap-northeast-2.amazonaws.com/account/2022-10-27/19082121_c7bddcb5-59fd-4d08-b816-5d734bf09566',
        fileSize: 355102,
      };

      const resultAdminInfo = {
        user: {
          adminId: 1,
          companyId: 1,
          roleId: 1,
          accountId: 1,
          isSuper: false,
          account: account,
        },
        file: accountFile,
      };

      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(adminRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => admin,
        };
      });
      accountFileRepository.findOneBy.mockResolvedValue(accountFile);

      // When
      const result = await getAdminInfoHandler.execute(new GetAdminInfoQuery(adminId));

      // Then
      expect(result).toEqual(resultAdminInfo);
    });
  });
});
