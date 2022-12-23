/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { title } from 'process';
import { GetFaqListHandler } from './get-faq-list.handler';
import { Faq } from '../entities/faq';
import { GetFaqListQuery } from './get-faq-list.query';
import { FaqCategory } from '../entities/faq_category';

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
  let getFaqListHandler: GetFaqListHandler;
  let faqRepository: MockRepository<Faq>;

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
        GetFaqListHandler,
        ConvertException,

        {
          provide: getRepositoryToken(Faq),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getFaqListHandler = module.get(GetFaqListHandler);
    faqRepository = module.get<MockRepository<Faq>>(getRepositoryToken(Faq));
  });

  describe('FAQ 리스트 조회', () => {
    const role = '본사 관리자';
    const searchWord = '';
    const searchKey = '';

    const param = {
      role: role,
      searchWord: null,
      searchKey: null,
      pageNo: 1,
      pageSize: 10,
      totalData: false,
      getLimit: () => 1,
      getOffset: () => 10,
    };

    const board = {
      boardId: 1,
      accountId: 2,
      boardTypeCode: '2',
      title: searchWord,
      content: 'content',
      viewCount: 0,
    };

    const searchWordBoard = {
      boardId: 1,
      accountId: 2,
      boardTypeCode: '2',
      title: 'searchWord',
      content: 'content',
      viewCount: 0,
    };

    const category = {
      categoryId: 1,
      categoryName: 'categoryName',
      isUse: true,
    };

    const faqList = [
      {
        faqId: 1,
        category: category,
        isTop: true,
        board: board,
        role: role,
      },
    ];

    const resultFaqList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          faqId: 1,
          category: category,
          isTop: true,
          board: board,
          role: role,
        },
      ],
    };

    const resultSearchWordFaqList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          faqId: 1,
          category: category,
          isTop: true,
          board: searchWordBoard,
          role: role,
        },
      ],
    };

    const resultSearchWordWithKeyFaqList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          faqId: 1,
          category: category,
          isTop: true,
          board: searchWordBoard,
          role: role,
        },
      ],
    };
    it('FAQ 전체 리스트 반환', async () => {
      jest.spyOn(faqRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => faqList,
          getCount: () => resultFaqList.totalCount,
        };
      });

      const result = await getFaqListHandler.execute(new GetFaqListQuery(param));

      expect(result).toEqual(resultFaqList);
    });

    it('카테고리별 FAQ 리스트 반환', async () => {
      const searchKeyParam = {
        role: role,
        searchWord: null,
        searchKey: 'categoryName',
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      jest.spyOn(faqRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => faqList,
          getCount: () => resultFaqList.totalCount,
        };
      });

      const result = await getFaqListHandler.execute(new GetFaqListQuery(searchKeyParam));

      expect(resultFaqList.items[0].category.categoryName).toEqual(searchKeyParam.searchKey);
      expect(faqRepository.createQueryBuilder).toBeCalledTimes(2);
    });

    it('검색어로 조회된 FAQ 리스트 반환', async () => {
      const searchWordParam = {
        role: role,
        searchWord: 'searchWord',
        searchKey: null,
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      jest.spyOn(faqRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => resultSearchWordFaqList,
          getCount: () => resultSearchWordFaqList.totalCount,
        };
      });

      const result = await getFaqListHandler.execute(new GetFaqListQuery(searchWordParam));

      expect(resultSearchWordFaqList.items[0].board.title).toEqual(searchWordParam.searchWord);
      expect(faqRepository.createQueryBuilder).toBeCalledTimes(3);
    });

    it('검색어+카테고리로 조회된 전체 FAQ 리스트 반환', async () => {
      const searchKeyWithCategoryParam = {
        role: role,
        searchWord: 'searchWord',
        searchKey: 'categoryName',
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      jest.spyOn(faqRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => resultSearchWordWithKeyFaqList,
          getCount: () => resultSearchWordWithKeyFaqList.totalCount,
        };
      });

      const result = await getFaqListHandler.execute(
        new GetFaqListQuery(searchKeyWithCategoryParam),
      );
      expect(resultSearchWordWithKeyFaqList.items[0].category.categoryName).toEqual(
        searchKeyWithCategoryParam.searchKey,
      );
      expect(resultSearchWordWithKeyFaqList.items[0].board.title).toEqual(
        searchKeyWithCategoryParam.searchWord,
      );
      expect(faqRepository.createQueryBuilder).toBeCalledTimes(4);
    });

    it('FAQ 리스트 조회 실패', async () => {
      try {
        jest.spyOn(faqRepository, 'createQueryBuilder').mockImplementation(() => {
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
            getMany: () => faqList,
            getCount: () => 0,
          };
        });
        const result = await getFaqListHandler.execute(new GetFaqListQuery(param));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('FAQ 정보를 찾을 수 없습니다.');
      }
    });
  });
});
