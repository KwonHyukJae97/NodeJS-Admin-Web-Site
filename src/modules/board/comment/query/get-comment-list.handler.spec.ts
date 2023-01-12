import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { GetCommentListHandler } from './get-comment-list.handler';
import { GetCommentListQuery } from './get-comment-list.query';
import { Comment } from '../entities/comment';
import { Qna } from '../../qna/entities/qna.entity';
import { Admin } from '../../../account/admin/entities/admin';
import { Board } from '../../entities/board.entity';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    subQuery: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
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

describe('GetCommentList', () => {
  let getCommentListHandler: GetCommentListHandler;
  let commentRepository: MockRepository<Comment>;
  let qnaRepository: MockRepository<Qna>;
  let adminRepository: MockRepository<Admin>;
  let boardRepository: MockRepository<Board>;

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
        GetCommentListHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Qna),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getCommentListHandler = module.get(GetCommentListHandler);
    commentRepository = module.get(getRepositoryToken(Comment));
    qnaRepository = module.get(getRepositoryToken(Qna));
    adminRepository = module.get(getRepositoryToken(Admin));
  });

  describe('전체 코멘트 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      const param = {
        searchKey: null,
        searchWord: null,
        pageNo: 1,
        pageSize: 10,
        totalData: false,
        getLimit: () => 1,
        getOffset: () => 10,
      };

      // 답변 리스트
      const commentList = [
        {
          qnaId: 1,
          accountId: 2,
          title: '100001',
          viewCount: 4,
          regDate: '2022-12-02 14:54:45',
          isComment: 1,
        },
      ];

      // 반환되는 답변 리스트 (페이징 처리)
      const resultCommentList = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 1,
        totalPage: 1,
        items: [
          {
            qnaId: 1,
            accountId: 2,
            title: '100001',
            viewCount: 4,
            regDate: '2022-12-02 14:54:45',
            isComment: 1,
          },
        ],
      };

      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
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
          leftJoin: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          offset: jest.fn().mockReturnThis(),
          getRawMany: () => commentList,
          getCount: () => resultCommentList.totalCount,
        };
      });

      // When
      const result = await getCommentListHandler.execute(new GetCommentListQuery(param));

      // Then
      expect(result).toEqual(resultCommentList);
    });
    //GetCommentListQuery 에 넘겨줄 param값 정의
    const param = {
      searchWord: null,
      searchKey: null,
      pageNo: 1,
      pageSize: 10,
      totalData: false,
      getLimit: () => 1,
      getOffset: () => 10,
    };

    it('코멘트 정보가 없는 404 에러 발생', async () => {
      if (param.totalData == undefined) {
        try {
          const result = await getCommentListHandler.execute(new GetCommentListQuery(param));
          expect(result).toBeDefined();
        } catch (Err) {
          expect(Err.status).toBe(404);
          expect(Err.response).toBe('QnA 정보를 찾을 수 없습니다.');
        }
      }
    });
  });
});
