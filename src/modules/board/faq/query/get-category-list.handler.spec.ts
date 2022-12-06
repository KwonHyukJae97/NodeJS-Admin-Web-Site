/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { FaqCategory } from '../entities/faq_category';
import { GetCategoryListHandler } from './get-category-list.handler';
import { GetCategoryListQuery } from './get-category-list.query';

const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    getRawCount: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetNoticeList', () => {
  let getCategoryListHandler: GetCategoryListHandler;
  let catogoryRepository: MockRepository<FaqCategory>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TranslatorModule.forRoot({
          global: true,
          defaultLang: 'ko',
          translationSource: '/src/common/i18n',
        }),
      ],
      providers: [
        GetCategoryListHandler,
        ConvertException,

        {
          provide: getRepositoryToken(FaqCategory),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getCategoryListHandler = module.get(GetCategoryListHandler);
    catogoryRepository = module.get<MockRepository<FaqCategory>>(getRepositoryToken(FaqCategory));
  });

  describe('FaqCategory 리스트 조회', () => {
    it('FaqCategory 리스트 반환', async () => {
      const role = '본사 관리자';

      const categoryList = {
        categoryId: 1,
        categoryName: 'categoryName',
        isUse: true,
      };

      const resultCategoryList = {
        categoryId: 1,
        categoryName: 'categoryName',
        isUse: true,
      };

      jest.spyOn(catogoryRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => categoryList,
        };
      });

      const result = await getCategoryListHandler.execute(new GetCategoryListQuery(role));

      expect(result).toEqual(resultCategoryList);
    });
  });
});
