import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';

import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { SignUpAdminCommand } from './signup-admin.command';
import { SignUpAdminHandler } from './signup-admin.handler';

const mockRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
//service 사용시
// type MockService<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('관리자 회원가입', () => {
  let signUpAdminHandler: SignUpAdminHandler;
  let adminRepository: MockRepository<Admin>;
  let companyRepository: MockRepository<Company>;
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
        SignUpAdminHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    signUpAdminHandler = module.get(SignUpAdminHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    companyRepository = module.get(getRepositoryToken(Company));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('관리자 회원가입 성공 여부', () => {
    const accountId = 10;
    const companyId = 10;
    const adminId = 10;
    const id = 'user1234';
    const email = 'email@email.com';
    const phone = '01012341234';
    const nickname = 'kwon123';
    const businessNumber = '000-00-12345';

    const adminAccountData = {
      accountId: accountId,
      id: 'admin1234',
      password: '12341234',
      name: '권혁재',
      email: 'email@email.com',
      phone: '01012341234',
      nickname: 'kwon123',
      birth: '971113',
      gender: '0',
      division: true,
    };

    const adminCompanyData = {
      companyId: companyId,
      companyName: '회원사명',
      companyCode: 11,
      businessNumber: '000-00-00000',
    };

    const adminData = {
      accountId: accountId,
      adminId: adminId,
      companyId: companyId,
      roleId: 1,
      isSuper: false,
    };

    it('관리자 회원가입 성공', async () => {
      accountRepository.create.mockReturnValue(adminAccountData);
      accountRepository.save.mockReturnValue(adminAccountData);
      companyRepository.create.mockReturnValue(adminCompanyData);
      companyRepository.save.mockReturnValue(adminCompanyData);
      adminRepository.create.mockReturnValue(adminData);
      adminRepository.save.mockReturnValue(adminData);

      const result = await signUpAdminHandler.execute(
        new SignUpAdminCommand(
          adminAccountData.id,
          adminAccountData.password,
          adminAccountData.name,
          adminAccountData.email,
          adminAccountData.phone,
          adminAccountData.nickname,
          adminAccountData.birth,
          adminAccountData.gender,
          companyId,
          adminData.roleId,
          adminData.isSuper,
          adminAccountData.division,
          adminCompanyData.companyName,
          adminCompanyData.companyCode,
          adminCompanyData.businessNumber,
        ),
      );

      expect(result).toEqual('회원가입 완료(관리자)');
    });

    it('중복된 아이디를 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(true);
      // accountRepository.save.mockReturnValue(adminAccountData);

      try {
        const result = await signUpAdminHandler.execute(
          new SignUpAdminCommand(
            adminAccountData.id,
            adminAccountData.password,
            adminAccountData.name,
            adminAccountData.email,
            adminAccountData.phone,
            adminAccountData.nickname,
            adminAccountData.birth,
            adminAccountData.gender,
            companyId,
            adminData.roleId,
            adminData.isSuper,
            adminAccountData.division,
            adminCompanyData.companyName,
            adminCompanyData.companyCode,
            adminCompanyData.businessNumber,
          ),
        );
        expect(result).toBeDefined();
      } catch (Err) {
        expect(Err.status).toBe(400);
        expect(Err.response).toBe('이미 존재하는 아이디입니다. 입력된 내용을 확인해주세요.');
      }
    });

    it('중복된 이메을을 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);
      // accountRepository.save.mockResolvedValue(adminAccountData);

      if (!id) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 이메일입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('중복된 연락처을 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);
      // accountRepository.save.mockResolvedValue(adminAccountData);

      if (!id && !email) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 연락처입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('중복된 닉네임을 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(true);
      // accountRepository.save.mockResolvedValue(adminAccountData);

      if (!id && !email && !phone) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 닉네임입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('중복된 사업자번호를 입력한 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      companyRepository.findOne.mockResolvedValueOnce(true);
      // accountRepository.save.mockResolvedValue(adminAccountData);

      if (!id && !email && !phone && !nickname) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('이미 존재하는 사업자번호입니다. 입력된 내용을 확인해주세요.');
        }
      }
    });
    it('관리자 회원가입에 실패 할 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      companyRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockRejectedValue(adminAccountData);

      if (!id && !email && !phone && !nickname && !businessNumber) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('관리자 회원가입에 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('회원사 정보 가입에 실패 할 경우 400 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      companyRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockRejectedValue(adminAccountData);
      companyRepository.save.mockRejectedValue(adminCompanyData);

      if (!id && !email && !phone && !nickname && !businessNumber) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(400);
          expect(Err.response).toBe('회원사 정보 가입에 입력된 내용을 확인해주세요.');
        }
      }
    });

    it('admin테이블 저장에 문제가 있을 경우 500 에러 발생', async () => {
      accountRepository.create.mockResolvedValue(adminAccountData);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.findOne.mockResolvedValueOnce(false);
      companyRepository.findOne.mockResolvedValueOnce(false);
      accountRepository.save.mockRejectedValue(adminAccountData);
      adminRepository.save.mockRejectedValue(adminData);

      if (!id && !email && phone && nickname && businessNumber) {
        try {
          const result = await signUpAdminHandler.execute(
            new SignUpAdminCommand(
              adminAccountData.id,
              adminAccountData.password,
              adminAccountData.name,
              adminAccountData.email,
              adminAccountData.phone,
              adminAccountData.nickname,
              adminAccountData.birth,
              adminAccountData.gender,
              companyId,
              adminData.roleId,
              adminData.isSuper,
              adminAccountData.division,
              adminCompanyData.companyName,
              adminCompanyData.companyCode,
              adminCompanyData.businessNumber,
            ),
          );
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(500);
          expect(Err.response).toBe('에러가 발생하였습니다. 관리자에게 문의해주세요.');
        }
      }
    });
  });
});
