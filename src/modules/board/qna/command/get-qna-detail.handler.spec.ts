/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Qna } from '../entities/qna';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';
import { Admin } from '../../../account/admin/entities/admin';
import { Account } from '../../../account/entities/account';
import { GetQnaDetailHandler } from './get-qna-detail.handler';
import { GetQnaDetailCommand } from './get-qna-detail.command';
import { ConvertException } from '../../../../common/utils/convert-exception';

// Repository에서 사용되는 함수 복제
const mockRepository = () => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
  }),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetDetailAdmin', () => {
  let getQnaDetailHandler: GetQnaDetailHandler;
  let qnaRepository: MockRepository<Qna>;
  let boardRepository: MockRepository<Board>;
  let boardFileRepository: MockRepository<BoardFile>;
  let commentRepository: MockRepository<Comment>;
  let adminRepository: MockRepository<Admin>;
  let accountRepository: MockRepository<Account>;

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
        GetQnaDetailHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Qna),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Board),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(BoardFile),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getQnaDetailHandler = module.get(GetQnaDetailHandler);
    qnaRepository = module.get(getRepositoryToken(Qna));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
    commentRepository = module.get(getRepositoryToken(Comment));
    adminRepository = module.get(getRepositoryToken(Admin));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('qna 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      // Given
      const qnaId = 1;
      const accountId = 27;
      const viewCount = 0;
      const boardId = 11;
      const files = [];

      const board = {
        boardId: boardId,
        accountId: accountId,
        boardTypeCode: '2',
        title: 'title',
        content: 'content',
        viewCount: viewCount,
      };

      // 답변 작성자 정보
      const commentList = [
        {
          qnaId: qnaId,
          accountId: accountId,
          title: '100001',
          viewCount: 4,
          regDate: '2022-12-02 14:54:45',
          isComment: 1,
        },
      ];

      // 답변 정보
      const commentDetail = [
        {
          qnaId: qnaId,
          accountId: accountId,
          title: '100001',
          viewCount: viewCount,
          regDate: '2022-12-02 14:54:45',
          isComment: 1,
        },
      ];

      // qna 정보
      const qna = {
        boardId: board.boardId,
        board: board,
      };

      // 반환되는 qna 정보
      const resultQnaInfo = {
        qna: {
          boardId: board.boardId,
          fileList: [],
          writer: 'undefined(undefined)',
          board: {
            boardId: board.boardId,
            accountId: accountId,
            boardTypeCode: '2',
            title: 'title',
            content: 'content',
            viewCount: 1,
          },
        },
        comment: [
          {
            qnaId: qnaId,
            accountId: accountId,
            title: '100001',
            viewCount: viewCount,
            regDate: '2022-12-02 14:54:45',
            isComment: 1,
            writer: 'undefined(undefined)',
          },
        ],
      };

      // jest.requireMock(<모듈 이름>) 을 사용하면 해당 모듈을 mocking 할 수 있음
      jest.spyOn(boardRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: () => board,
        };
      });
      boardRepository.save(board);

      jest.spyOn(qnaRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getRawOne: () => qna,
        };
      });
      qnaRepository.save(qna);
      accountRepository.findOneBy.mockResolvedValue(accountId);

      jest.spyOn(boardFileRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getMany: () => files,
        };
      });

      jest.spyOn(commentRepository, 'createQueryBuilder').mockImplementation(() => {
        const mockModule = jest.requireMock('typeorm');
        return {
          ...mockModule,
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: () => commentDetail,
          getRawOne: () => commentList,
        };
      });

      // When
      const result = await getQnaDetailHandler.execute(new GetQnaDetailCommand(qnaId));

      // Then
      expect(result).toEqual(resultQnaInfo);
    });
  });
});
