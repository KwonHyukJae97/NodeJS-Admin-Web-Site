import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Company } from 'src/modules/company/entities/company.entity';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/entities/admin';
import { Account } from '../../entities/account';
import { GoogleSignUpAdminCommand } from './google-signup-admin.command';
import { GoogleSignUpAdminHandler } from './google-signup-admin.handler';

const mockRepository = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('구글 2차 정보가입', () => {
  let googleSignUpHandler: GoogleSignUpAdminHandler;
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
        GoogleSignUpAdminHandler,
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

    googleSignUpHandler = module.get(GoogleSignUpAdminHandler);
    adminRepository = module.get(getRepositoryToken(Admin));
    companyRepository = module.get(getRepositoryToken(Company));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('구글 2차정보 성공 여부', () => {
    it('구글 2차정보 가입 성공', async () => {
      const accountId = 11;
      const companyId = 11;
      const adminId = 11;

      const adminAccountData = {
        accountId: accountId,
        name: '권혁재',
        phone: '01012341234',
        nickname: 'kwon123',
        birth: '971113',
        gender: '0',
        snsId: 'google@gmail.com',
        snsType: '02',
        snsToken: 'token123',
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

      const result = await googleSignUpHandler.execute(
        new GoogleSignUpAdminCommand(
          adminAccountData.name,
          adminAccountData.phone,
          adminAccountData.nickname,
          adminAccountData.birth,
          adminAccountData.gender,
          adminAccountData.snsId,
          adminAccountData.snsToken,
          adminCompanyData.companyName,
          adminCompanyData.companyCode,
          adminCompanyData.businessNumber,
        ),
      );

      expect(result).toEqual(result);
    });
  });
});
