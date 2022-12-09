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
    it('조회 성공', async () => {
      // Given
      const param = {
        searchWord: null,
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      const companyList = [
        {
          companyId: 1,
          companyName: '회원사 테스트',
          companyCode: 100001,
          businessNumber: '10-000-00000',
          userCount: 1,
          adminCount: 1,
        },
      ];

      const resultCompanyList = {
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
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          getRawMany: () => companyList,
          getCount: () => resultCompanyList.totalCount,
        };
      });

      // When
      const result = await getAllCompanyHandler.execute(new GetAllCompanyQuery(param));

      // Then
      expect(result).toEqual(resultCompanyList);
    });
    //GetAllCompanyQuery 에 넘겨줄 param값 정의
    const param = {
      searchWord: null,
      pageNo: 1,
      pageSize: 10,
      totalData: false,
      getLimit: () => 1,
      getOffset: () => 10,
    };

    it('회원사 리스트가 없는 404 에러 발생', async () => {
      if (param.totalData == undefined) {
        try {
          const result = await getAllCompanyHandler.execute(new GetAllCompanyQuery(param));
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(404);
          expect(Err.response).toBe('회원사 정보를 찾을 수 없습니다.');
        }
      }
    });
  });
});
