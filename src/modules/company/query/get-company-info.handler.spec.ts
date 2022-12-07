import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Company } from '../entities/company.entity';
import { GetCompanyInfoQueryHandler } from './get-company-info.handler';
import { GetCompanyInfoQuery } from './get-company-info.query';

// Repository에서 사용되는 함수 복제
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

// MockRepository 타입 정의
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
    it('조회 성공', async () => {
      // Given
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

      // 반환값 설정 (mockResolvedValue = 비동기 반환값 / mockReturnValue = 일반 반환값 반환 시 사용)
      companyRepository.findOneBy.mockResolvedValue(company);
      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
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

      // When
      const result = await getCompanyInfoHandler.execute(new GetCompanyInfoQuery(companyId));

      // Then
      expect(result).toEqual(companyInfo);
    });
  });
});
