import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Company } from '../entities/company.entity';
import { GetCompanyInfoQueryHandler } from './get-company-info.handler';
import { GetCompanyInfoQuery } from './get-company-info.query';

const mockRepository = () => ({
  findOneBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetDetailCompany', () => {
  let getCompanyInfoHandler: GetCompanyInfoQueryHandler;
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
        GetCompanyInfoQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getCompanyInfoHandler = module.get(GetCompanyInfoQueryHandler);
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe('회원사 상세 정보 정상 조회 여부', () => {
    it('회원사 상세정보 조회 성공', async () => {
      const companyId = 1;
      const company = {
        companyId: 1,
        companyName: '회원사',
        companyCode: 100001,
        businessNumber: '00-000-00000',
      };

      const companyInfo = {
        companyId: 1,
        companyName: '회원사',
        companyCode: 100001,
        businessNumber: '00-000-00000',
        userCount: 1,
        adminCount: 1,
      };

      companyRepository.findOneBy.mockResolvedValue(company);
      jest.spyOn(companyRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: () => companyInfo,
        };
      });

      const result = await getCompanyInfoHandler.execute(new GetCompanyInfoQuery(companyId));

      expect(result).toEqual(companyInfo);
    });
  });
});
