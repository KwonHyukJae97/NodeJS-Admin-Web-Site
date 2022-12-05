import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { CreateAdminhandler } from './create-admin.handler';
import { Admin } from '../entities/admin';
import { Account } from '../../entities/account';
import { CreateAdminCommand } from './create-admin.command';
import { ConvertException } from '../../../../common/utils/convert-exception';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateAdmin', () => {
  let createAdminHandler: CreateAdminhandler;
  let adminRepository: MockRepository<Admin>;
  let accountRepository: MockRepository<Account>;

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
        CreateAdminhandler,
        ConvertException,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    createAdminHandler = module.get(CreateAdminhandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('관리자 정보 정상 등록 여부', () => {
    it('등록 성공', async () => {
      // Given
      const admin = {
        id: 'test',
        password: 'test',
        name: '홍길동',
        email: 'test@email.com',
        phone: '010-2345-6069',
        nickname: '별명',
        birth: '20221211',
        gender: '0',
        companyId: 1,
        roleId: 1,
        isSuper: false,
        division: false,
      };

      const createAccount = {
        id: 'test',
        password: 'test',
        name: '홍길동',
        email: 'test@email.com',
        phone: '010-2345-6069',
        nickname: '별명',
        birth: '20221211',
        gender: '0',
        division: false,
      };

      const saveAccount = {
        accountId: 1,
        id: 'test',
        password: 'test',
        name: '홍길동',
        email: 'test@email.com',
        phone: '010-2345-6069',
        nickname: '별명',
        birth: '20221211',
        gender: '0',
        division: false,
      };

      const createAdmin = {
        accountId: saveAccount.accountId,
        companyId: admin.companyId,
        roleId: admin.roleId,
        isSuper: admin.isSuper,
      };

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.save.mockResolvedValue(saveAccount);
      adminRepository.create.mockResolvedValue(createAdmin);
      adminRepository.save.mockResolvedValue(createAdmin);

      // When
      const result = await createAdminHandler.execute(
        new CreateAdminCommand(
          admin.id,
          admin.password,
          admin.name,
          admin.email,
          admin.phone,
          admin.nickname,
          admin.birth,
          admin.gender,
          admin.companyId,
          admin.roleId,
          admin.isSuper,
          admin.division,
        ),
      );

      // Then
      expect(result).toEqual('관리자 등록 완료');
    });
  });
});
