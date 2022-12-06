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
    it('공지사항 리스트 반환', async () => {
      const role = '본사 관리자';
      const noticeGrant = '0';

      const param = {
        role: role,
        noticeGrant: noticeGrant,
        searchWord: null,
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
        title: 'title',
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

      const result = await getNoticeListHandler.execute(new GetNoticeListQuery(param));

      expect(result).toEqual(resultNoticeList);
    });
  });
});
