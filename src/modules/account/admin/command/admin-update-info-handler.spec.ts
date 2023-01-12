import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../../entities/account';
import { Admin } from '../entities/admin';
import { AccountFile } from '../../../file/entities/account-file.entity';
import { AccountFileDb } from '../../account-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { EventBus } from '@nestjs/cqrs';
import { AdminUpdateInfoHandler } from './admin-update-info-handler';
import { AdminUpdateInfoCommand } from './admin-update-info.command';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
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

  describe('관리자 상세정보 정상 수정 여부', () => {
    const mockFile = [
      {
        fieldname: 'file',
        originalname: 'medal.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from(__dirname + '/../../medal.png', 'utf8'),
        size: 51828,
      },
    ] as Express.MulterS3.File[];

    // 수정하고자 하는 값
    const newAdminInfo = {
      accountId: 1,
      email: 'test@email.com',
      phone: '010-0000-0000',
      nickname: '닉네임 변경',
      file: mockFile,
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

    const accountFile = {
      accountFileId: 1,
      accountId: 1,
      originalFileName: '스크린샷 2022-10-19 20.22.28(2)',
      fileExt: '.png',
      filePath:
        'https://b2c-file-test.s3.ap-northeast-2.amazonaws.com/account/2022-10-27/19082121_c7bddcb5-59fd-4d08-b816-5d734bf09566',
      fileSize: 355102,
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

    it('관리자 상세정보 수정 성공', async () => {
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountFileRepository.findOneBy.mockResolvedValue(accountFile);

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

    it('해당 계정 정보가 없을 경우 404 에러 발생', async () => {
      // accountRepository.findOneBy.mockResolvedValue(undefined);
      accountRepository.findOneBy.mockRejectedValue(undefined);

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
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('관리자 정보를 찾을 수 없습니다.');
      }
    });

    it('변경하고자 하는 이메일이 중복될 경우 400 에러 발생', async () => {
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      accountRepository.findOne.mockResolvedValueOnce(accountInfo);

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
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 이메일이므로 수정 정보를 확인해주세요.');
      }
    });

    it('변경하고자 하는 연락처가 중복될 경우 400 에러 발생', async () => {
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountRepository.findOne.mockResolvedValueOnce(accountInfo);

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
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 연락처이므로 수정 정보를 확인해주세요.');
      }
    });

    it('변경하고자 하는 닉네임이 중복될 경우 400 에러 발생', async () => {
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountRepository.findOne.mockResolvedValueOnce(undefined);
      accountRepository.update.mockResolvedValueOnce(newAdminInfo);
      accountRepository.findOne.mockResolvedValueOnce(accountInfo);

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
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('이미 존재하는 닉네임이므로 수정 정보를 확인해주세요.');
      }
    });
  });
});
