import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetQnaListHandler } from './get-Qna-list.handler';
import { GetQnaListQuery } from './get-Qna-list.query';
import { Comment } from '../../comment/entities/comment';
import { Qna } from '../entities/qna.entity';
import { Account } from '../../../account/entities/account';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    subQuery: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetQnaList', () => {
  let getQnaListHandler: GetQnaListHandler;
  let commentRepository: MockRepository<Comment>;
  let qnaRepository: MockRepository<Qna>;

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
        GetQnaListHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Qna),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getQnaListHandler = module.get(GetQnaListHandler);
    commentRepository = module.get(getRepositoryToken(Comment));
    qnaRepository = module.get(getRepositoryToken(Qna));
  });

  describe('전체 qna 정보 정상 조회 여부', () => {
    const param = {
      accountId: 1,
      searchWord: null,
      pageNo: 1,
      pageSize: 10,
      totalData: false,
      getLimit: () => 1,
      getOffset: () => 10,
    };

    const qnaList = [
      {
        qnaId: 1,
        boardId: 1,
        accountId: 27,
        boardTypeCode: '2',
        title: '답변 테스트',
        content: '관리자별 답변 조회 테스트',
        viewCount: 0,
        regDate: '2022-11-16T08:05:00.000Z',
        isComment: 0,
      },
    ];

    const resultQnaList = {
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      totalPage: 1,
      items: [
        {
          qnaId: 1,
          boardId: 1,
          accountId: 27,
          boardTypeCode: '2',
          title: '답변 테스트',
          content: '관리자별 답변 조회 테스트',
          viewCount: 0,
          regDate: '2022-11-16T08:05:00.000Z',
          isComment: 0,
        },
      ],
    };
    it('QNA 조회 성공', async () => {
      jest.spyOn(commentRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          subQuery: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnThis(),
        };
      });

      jest.spyOn(qnaRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          select: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          getRawMany: () => qnaList,
          getCount: () => resultQnaList.totalCount,
        };
      });

      // When
      const result = await getQnaListHandler.execute(new GetQnaListQuery(param, new Account()));

      // Then
      expect(result).toEqual(resultQnaList);
    });

    it('QNA 리스트 조회 실패', async () => {
      try {
        jest.spyOn(commentRepository, 'createQueryBuilder').mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            subQuery: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnThis(),
          };
        });

        jest.spyOn(qnaRepository, 'createQueryBuilder').mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            select: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            getRawMany: () => qnaList,
            getCount: () => 0,
          };
        });
        const result = await getQnaListHandler.execute(new GetQnaListQuery(param, new Account()));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('QnA 정보를 찾을 수 없습니다.');
      }
    });
  });
});
