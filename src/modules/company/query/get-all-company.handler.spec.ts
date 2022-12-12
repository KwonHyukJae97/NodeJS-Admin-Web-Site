import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetAllCompanyQueryHandler } from './get-all-company.handler';
import { Company } from '../entities/company.entity';
import { GetAllCompanyQuery } from './get-all-company.query';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    getRawCount: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetAlCompany', () => {
  let getAllCompanyHandler: GetAllCompanyQueryHandler;
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
        GetAllCompanyQueryHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getAllCompanyHandler = module.get(GetAllCompanyQueryHandler);
    companyRepository = module.get(getRepositoryToken(Company));
  });

  describe('전체 회원사 정보 정상 조회 여부', () => {
    const companyList = [
      {
        companyId: 1,
        companyName: '회원사 테스트',
        companyCode: 100001,
        businessNumber: '10-000-00000',
        userCount: 1,
        adminCount: 1,
      },
      {
        companyId: 2,
        companyName: '클라이 교육',
        companyCode: 100002,
        businessNumber: '10-000-00000',
        userCount: 1,
        adminCount: 1,
      },
    ];

    const searchCompanyList = [
      {
        companyId: 1,
        companyName: '회원사 테스트',
        companyCode: 100001,
        businessNumber: '10-000-00000',
        userCount: 1,
        adminCount: 1,
      },
    ];

    const resultAllCompanyList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          companyId: 1,
          companyName: '회원사 테스트',
          companyCode: 100001,
          businessNumber: '10-000-00000',
          userCount: 1,
          adminCount: 1,
        },
        {
          companyId: 2,
          companyName: '클라이 교육',
          companyCode: 100002,
          businessNumber: '10-000-00000',
          userCount: 1,
          adminCount: 1,
        },
      ],
    };

    const resultSearchCompanyList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          companyId: 1,
          companyName: '회원사 테스트',
          companyCode: 100001,
          businessNumber: '10-000-00000',
          userCount: 1,
          adminCount: 1,
        },
      ],
    };

    it('회원사 리스트 조회 성공', async () => {
      const param = {
        searchWord: null,
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      jest.spyOn(companyRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          getRawMany: () => companyList,
          getCount: () => resultAllCompanyList.totalCount,
        };
      });

      const result = await getAllCompanyHandler.execute(new GetAllCompanyQuery(param));

      expect(result).toEqual(companyList);
    });

    it('회원사 리스트 검색 조회 성공', async () => {
      const searchParam = {
        searchWord: '회원사',
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      jest.spyOn(companyRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          getRawMany: () => searchCompanyList,
          getCount: () => resultSearchCompanyList.totalCount,
        };
      });

      const result = await getAllCompanyHandler.execute(new GetAllCompanyQuery(searchParam));

      expect(result).toEqual(resultSearchCompanyList);
    });
  });
});
