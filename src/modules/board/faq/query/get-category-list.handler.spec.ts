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
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
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

    it('FaqCategory 리스트 반환', async () => {
      jest.spyOn(catogoryRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: () => categoryList,
        };
      });

      const result = await getCategoryListHandler.execute(new GetCategoryListQuery(role));
      expect(result).toEqual(resultCategoryList);
    });

    it('FaqCategory 리스트 조회 실패', async () => {
      try {
        jest.spyOn(catogoryRepository, 'createQueryBuilder').mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getMany: () => undefined,
          };
        });
        const result = await getCategoryListHandler.execute(new GetCategoryListQuery(role));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err).rejects.toThrowError('카테고리 정보를 찾을 수 없습니다.');
      }
    });
  });
});
