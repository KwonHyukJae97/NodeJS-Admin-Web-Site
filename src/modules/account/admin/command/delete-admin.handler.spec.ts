import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Account } from '../../entities/account';
import { AccountFile } from '../../../file/entities/account-file';
import { EventBus } from '@nestjs/cqrs';
import { AccountFileDb } from '../../account-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { DeleteAdminHandler } from './delete-admin.handler';
import { Admin } from '../entities/admin';
import { DeleteAdminCommand } from './delete-admin.command';
import { GetAdminInfoQuery } from '../query/get-admin-info.query';

const mockRepository = () => ({
  softDelete: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteAdmin', () => {
  let deleteAdminHandler: DeleteAdminHandler;
  let adminRepository: MockRepository<Admin>;
  let accountRepository: MockRepository<Account>;
  let acccountFileRepository: MockRepository<AccountFile>;
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
        DeleteAdminHandler,
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

    deleteAdminHandler = module.get(DeleteAdminHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
    acccountFileRepository = module.get(getRepositoryToken(AccountFile));
    eventBus = module.get(EventBus);
  });

  describe('관리자 정보 정상 삭제 여부', () => {
    const adminId = 1;
    const delDate = new Date();

    it('삭제 성공', async () => {
      const adminInfo = {
        accountId: 1,
        companyId: 1,
        roleId: 1,
        isSuper: false,
      };

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

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      adminRepository.findOneBy.mockResolvedValue(adminInfo);
      accountRepository.findOneBy.mockResolvedValue(accountInfo);
      acccountFileRepository.findOneBy.mockResolvedValue(accountInfo.accountId);
      jest.spyOn(accountRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: () => null,
        };
      });

      // When
      const result = await deleteAdminHandler.execute(new DeleteAdminCommand(adminId, delDate));

      // Then
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(result).toEqual('관리자 삭제 완료');
    });

    it('해당 관리자 계정 정보가 없을 경우 404 에러 발생', async () => {
      const adminInfo = {
        accountId: 0,
        companyId: 1,
        roleId: 1,
        isSuper: false,
      };

      adminRepository.findOneBy.mockResolvedValue(adminInfo);
      accountRepository.findOneBy.mockResolvedValue(undefined);

      try {
        const result = await deleteAdminHandler.execute(new DeleteAdminCommand(adminId, delDate));
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('관리자 정보를 찾을 수 없습니다.');
      }
    });
  });
});
