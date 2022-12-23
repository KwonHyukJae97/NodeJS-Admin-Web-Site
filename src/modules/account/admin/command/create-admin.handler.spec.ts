import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { CreateAdminhandler } from './create-admin.handler';
import { Admin } from '../entities/admin';
import { Account } from '../../entities/account';
import { CreateAdminCommand } from './create-admin.command';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Company } from '../../../company/entities/company.entity';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateAdmin', () => {
  let createAdminHandler: CreateAdminhandler;
  let adminRepository: MockRepository<Admin>;
  let accountRepository: MockRepository<Account>;
  let companyRepository: MockRepository<Company>;

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
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    createAdminHandler = module.get(CreateAdminhandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe('관리자 정보 정상 등록 여부', () => {
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
      companyName: '본사',
      companyCode: 100001,
      businessNumber: '123-45-67890',
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

    const createCompany = {
      companyId: admin.companyId,
      companyName: admin.companyName,
      companyCode: admin.companyCode,
      businessNumber: admin.businessNumber,
    };
    it('관리자 정보 등록 성공', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.save.mockResolvedValue(saveAccount);
      companyRepository.create.mockResolvedValue(createCompany);
      companyRepository.save.mockResolvedValue(createCompany);
      adminRepository.create.mockResolvedValue(createAdmin);
      adminRepository.save.mockResolvedValue(createAdmin);

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
          admin.companyName,
          admin.companyCode,
          admin.businessNumber,
        ),
      );

      expect(result).toEqual('관리자 등록 완료');
    });

    it('id 중복일 경우 401 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(true);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.response.statusCode).toBe(401);
        expect(err.response.message).toBe('이미 존재하는 아이디입니다.');
      }
    });

    it('이메일 중복일 경우 401 에러 발생', async () => {
      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.response.statusCode).toBe(401);
        expect(err.response.message).toBe('이미 존재하는 이메일입니다.');
      }
    });

    it('연락처 중복일 경우 401 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.response.statusCode).toBe(401);
        expect(err.response.message).toBe('이미 존재하는 연락처입니다.');
      }
    });

    it('닉네임 중복일 경우 401 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.response.statusCode).toBe(401);
        expect(err.response.message).toBe('이미 존재하는 닉네임입니다.');
      }
    });

    it('사업자번호 중복일 경우 401 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      companyRepository.findOne.mockResolvedValueOnce(true);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.response.statusCode).toBe(401);
        expect(err.response.message).toBe('이미 존재하는 사업자번호입니다.');
      }
    });

    it('계정 정보에 문제가 있을 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockRejectedValue(saveAccount);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('관리자 정보 등록에입력된 내용을 확인해주세요.');
      }
    });

    it('회원사 정보에 문제가 있을 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockResolvedValue(saveAccount);
      companyRepository.create.mockResolvedValue(createCompany);
      companyRepository.save.mockRejectedValue(createCompany);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('회원사 정보 가입에입력된 내용을 확인해주세요.');
      }
    });

    it('관리자 정보에 문제가 있을 경우 500 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(createAccount);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockResolvedValue(saveAccount);
      companyRepository.create.mockResolvedValue(createCompany);
      companyRepository.save.mockResolvedValue(createCompany);
      adminRepository.create.mockResolvedValue(createAdmin);
      adminRepository.save.mockRejectedValue(createAdmin);

      try {
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
            admin.companyName,
            admin.companyCode,
            admin.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
      }
    });
  });
});
