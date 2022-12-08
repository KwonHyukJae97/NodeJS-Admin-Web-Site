/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GetNoticeListHandler } from './get-notice-list.handler';
import { Notice } from '../entities/notice';
import { GetNoticeListQuery } from './get-notice-list.query';

const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    getRawCount: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetNoticeList', () => {
  let getNoticeListHandler: GetNoticeListHandler;
  let noticeRepository: MockRepository<Notice>;

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
        GetNoticeListHandler,
        ConvertException,

        {
          provide: getRepositoryToken(Notice),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getNoticeListHandler = module.get(GetNoticeListHandler);
    noticeRepository = module.get<MockRepository<Notice>>(getRepositoryToken(Notice));
  });

  describe('공지사항 리스트 조회', () => {
    const role = '본사 관리자';
    const noticeGrant = '0';
    const searchWord = '';

    const param = {
      role: role,
      noticeGrant: noticeGrant,
      searchWord: searchWord,
      pageNo: 1,
      pageSize: 10,
      totalData: false,
      getLimit: () => 1,
      getOffset: () => 10,
    };

    const searchWordParam = {
      role: role,
      noticeGrant: noticeGrant,
      searchWord: 'searchWord',
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

    const noticeList = [
      {
        noticeId: 1,
        isTop: true,
        board: board,
        noticeGrant: noticeGrant,
        role: role,
      },
    ];

    const resultNoticeList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          noticeId: 1,
          isTop: true,
          board: board,
          noticeGrant: noticeGrant,
          role: role,
        },
      ],
    };

    it('공지사항 리스트 조회', async () => {
      jest.spyOn(noticeRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getMany: () => noticeList,
          getCount: () => resultNoticeList.totalCount,
        };
      });
      const result = await getNoticeListHandler.execute(new GetNoticeListQuery(param));
      expect(result).toEqual(resultNoticeList);
    });

    it('검색어 입력 후 조회된 공지사항 리스트 조회', async () => {
      jest.spyOn(noticeRepository, 'createQueryBuilder').mockImplementation(() => {
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
          getMany: () => noticeList,
          getCount: () => resultNoticeList.totalCount,
        };
      });

      // 검색어 입력 후 리스트 반환
      const result = await getNoticeListHandler.execute(new GetNoticeListQuery(searchWordParam));
      expect(result).toEqual(resultNoticeList);
      expect(noticeRepository.createQueryBuilder).toBeCalledTimes(2);
    });

    it('공지사항 리스트 조회 실패', async () => {
      try {
        jest.spyOn(noticeRepository, 'createQueryBuilder').mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            getMany: () => noticeList,
            getCount: () => 0,
          };
        });
        const result = await getNoticeListHandler.execute(new GetNoticeListQuery(param));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('공지사항 정보를 찾을 수 없습니다.');
      }
    });
  });
});
