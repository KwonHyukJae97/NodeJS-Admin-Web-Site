import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { AccountFile } from '../../../file/entities/account-file';
import { AccountFileDb } from '../../account-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { EventBus } from '@nestjs/cqrs';
import { AdminUpdateInfoHandler } from './admin-update-info-handler';
import { AdminUpdateInfoCommand } from './admin-update-info.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('AdminUpdateInfo', () => {
  let adminUpdateInfoHandler: AdminUpdateInfoHandler;
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
        AdminUpdateInfoHandler,
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

    adminUpdateInfoHandler = module.get(AdminUpdateInfoHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
    accountFileRepository = module.get(getRepositoryToken(AccountFile));
    eventBus = module.get(EventBus);
  });

  describe('관리자 정보 정상 수정 여부', () => {
    // Given
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
      accountId: 1,
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

    it('수정 성공', async () => {
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      accountRepository.update.mockResolvedValue(updateAccountInfo);
      accountFileRepository.findOneBy(adminInfo.accountId);

      const result = await adminUpdateInfoHandler.execute(
        new AdminUpdateInfoCommand(
          newAdminInfo.accountId,
          newAdminInfo.email,
          newAdminInfo.phone,
          newAdminInfo.nickname,
          newAdminInfo.file,
        ),
      );

      if (result instanceof Account) {
        expect(result.email).toEqual(resultAdminInfo.email);
        expect(result.nickname).toEqual(resultAdminInfo.nickname);
        expect(result.phone).toEqual(resultAdminInfo.phone);
      }
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
    });

    it('존재하는 이메일 정보 입력 시 이메일 수정 실패 처리', async () => {
      accountRepository.findOne.mockResolvedValue(newAdminInfo.email);
      accountRepository.update.mockRejectedValue(updateAccountInfo);
      try {
        const result = await adminUpdateInfoHandler.execute(
          new AdminUpdateInfoCommand(
            newAdminInfo.accountId,
            newAdminInfo.email,
            newAdminInfo.phone,
            newAdminInfo.nickname,
            newAdminInfo.file,
          ),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 이메일이므로 수정 정보를 확인해주세요.');
      }
    });

    it('존재하는 연락처 정보 입력 시 연락처 수정 실패 처리', async () => {
      accountRepository.findOne.mockResolvedValue(newAdminInfo.phone);
      accountRepository.findOne.mockRejectedValue(newAdminInfo.email);
      accountRepository.update.mockRejectedValue(updateAccountInfo);
      try {
        const result = await adminUpdateInfoHandler.execute(
          new AdminUpdateInfoCommand(
            newAdminInfo.accountId,
            newAdminInfo.email,
            newAdminInfo.phone,
            newAdminInfo.nickname,
            newAdminInfo.file,
          ),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 연락처이므로 수정 정보를 확인해주세요.');
      }
    });

    it('존재하는 닉네임 정보 입력 시 닉네임 수정 실패 처리', async () => {
      accountRepository.findOne.mockResolvedValue(newAdminInfo.nickname);
      accountRepository.findOne.mockRejectedValue(newAdminInfo.phone);
      accountRepository.update.mockRejectedValue(updateAccountInfo);
      try {
        const result = await adminUpdateInfoHandler.execute(
          new AdminUpdateInfoCommand(
            newAdminInfo.accountId,
            newAdminInfo.email,
            newAdminInfo.phone,
            newAdminInfo.nickname,
            newAdminInfo.file,
          ),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 닉네임이므로 수정 정보를 확인해주세요.');
      }
    });
  });
});
