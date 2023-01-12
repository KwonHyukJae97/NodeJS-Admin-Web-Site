import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Admin } from '../entities/admin';
import { GetAllAdminQueryHandler } from './get-all-admin.handler';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { GetAllAdminQuery } from './get-all-admin.query';
import { ConvertException } from '../../../../common/utils/convert-exception';

const mockRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetAllAdmin', () => {
  let getAllAdminHandler: GetAllAdminQueryHandler;
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
        GetAllAdminQueryHandler,
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

    getAllAdminHandler = module.get(GetAllAdminQueryHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountFileRepository = module.get(getRepositoryToken(AccountFile));
  });

  describe('전체 관리자 정보 정상 조회 여부', () => {
    it('관리자 리스트 조회 성공', async () => {
      const adminInfo = [
        {
          adminId: 1,
          companyId: 1,
          roleId: 1,
          isSuper: true,
          accountId: 1,
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

      const adminList = [
        {
          admin: {
            adminId: 1,
            companyId: 1,
            roleId: 1,
            isSuper: true,
            accountId: 1,
          },
          file: {
            accountFileId: 1,
            accountId: 1,
            originalFileName: '스크린샷 2022-10-19 20.22.28(2)',
            fileExt: '.png',
            filePath:
              'https://b2c-file-test.s3.ap-northeast-2.amazonaws.com/account/2022-10-27/19082121_c7bddcb5-59fd-4d08-b816-5d734bf09566',
            fileSize: 355102,
          },
        },
      ];

      adminRepository.find.mockResolvedValue(adminInfo);
      accountFileRepository.findOneBy.mockResolvedValue(accountFile);

      const result = await getAllAdminHandler.execute(new GetAllAdminQuery());

      expect(result).toEqual(adminList);
      expect(accountFileRepository.findOneBy).toHaveBeenCalledTimes(1);
    });

    it('관리자 리스트가 없을 경우 404 에러 발생', async () => {
      adminRepository.find.mockResolvedValue(undefined);

      try {
        const result = await getAllAdminHandler.execute(GetAllAdminQuery);
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('관리자 정보를 찾을 수 없습니다.');
      }
    });
  });
});
