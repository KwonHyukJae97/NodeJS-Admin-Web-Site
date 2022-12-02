import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../../entities/account';
import { AccountFile } from '../../../file/entities/account-file';
import { AccountFileDb } from '../../account-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { EventBus } from '@nestjs/cqrs';
import { UpdateAdminHandler } from './update-admin.handler';
import { Admin } from '../entities/admin';
import { UpdateAdminCommand } from './update-admin.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateAdmin', () => {
  let updateAdminHandler: UpdateAdminHandler;
  let adminRepository: MockRepository<Admin>;
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
        UpdateAdminHandler,
        ConvertException,
        AccountFileDb,
        {
          provide: getRepositoryToken(Admin),
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

    updateAdminHandler = module.get(UpdateAdminHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
    accountFileRepository = module.get(getRepositoryToken(AccountFile));
    eventBus = module.get(EventBus);
  });

  describe('관리자 정보 정상 수정 여부', () => {
    it('수정 성공', async () => {
      // Given
      const adminId = { userId: 1 };
      const mockFile = {
        fieldname: 'file',
        originalname: 'medal.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from(__dirname + '/../../medal.png', 'utf8'),
        size: 51828,
      } as Express.MulterS3.File;

      // 수정하고자 하는 값
      const newAdminInfo = {
        roleId: 1,
        password: 'password',
        email: 'test@email.com',
        phone: '010-0000-0000',
        nickname: '닉네임 변경',
        adminId: 1,
        isSuper: true,
        file: mockFile,
      };

      // 기존 값(admin)
      const adminInfo = {
        accountId: 1,
        companyId: 1,
        roleId: 1,
        isSuper: false,
      };

      // 기존 값(account)
      const accountInfo = {
        accountId: 1,
        id: 'test',
        name: '이름',
        email: 'email@email.com',
        phone: '010-1111-1111',
        nickname: '닉네임',
        birth: '20221202',
        gender: '0',
      };

      // 수정 내용 반영시 예상 결과 값(admin)
      const updateAdminInfo = {
        accountId: 1,
        companyId: 1,
        roleId: 2,
        isSuper: true,
      };

      // 수정 내용 반영시 예상 결과 값(account)
      const updateAccountInfo = {
        accountId: 1,
        id: 'test',
        name: '이름',
        email: 'test@email.com',
        phone: '010-0000-0000',
        nickname: '닉네임 변경',
        birth: '20221202',
        gender: '0',
      };

      // 예상 결과 값
      const resultAdminInfo = {
        accountId: 1,
        id: 'test',
        password: '$2a$10$9BXY43cplwHcQYkwt6FEgeM2q.edMDehiGPzN3Fn6GASzZ9QrNOYq',
        name: '이름',
        email: 'test@email.com',
        phone: '010-0000-0000',
        nickname: '닉네임 변경',
        birth: '20221202',
        gender: '0',
      };

      adminRepository.findOneBy.mockResolvedValue(adminInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      adminRepository.save(updateAdminInfo);
      accountRepository.save(updateAccountInfo);
      accountFileRepository.findOneBy(adminInfo.accountId);

      // When
      const result = await updateAdminHandler.execute(
        new UpdateAdminCommand(
          newAdminInfo.password,
          newAdminInfo.email,
          newAdminInfo.phone,
          newAdminInfo.nickname,
          newAdminInfo.roleId,
          newAdminInfo.isSuper,
          newAdminInfo.adminId,
          newAdminInfo.file,
        ),
      );

      // Then
      if (result instanceof Account) {
        expect(result.email).toEqual(resultAdminInfo.email);
        expect(result.nickname).toEqual(resultAdminInfo.nickname);
        expect(result.phone).toEqual(resultAdminInfo.phone);
      }
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
    });
  });
});
