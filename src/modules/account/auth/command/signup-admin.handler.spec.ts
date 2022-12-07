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
    it('관리자 회원가입 성공', async () => {
      const accountId = 10;
      const companyId = 10;
      const adminId = 10;

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

      accountRepository.create.mockReturnValue(adminAccountData);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.id);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.email);
      //   accountRepository.findOne.mockReturnValue(adminAccountData.phone);
      //   companyRepository.findOne.mockReturnValue(adminCompanyData.businessNumber);
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
  });
});
