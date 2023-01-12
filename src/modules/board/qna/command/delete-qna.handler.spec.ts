/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteQnaHandler } from './delete-qna.handler';
import { DeleteQnaCommand } from './delete-qna.command';
import { Repository } from 'typeorm';
import { Qna } from '../entities/qna.entity';
import { Comment } from '../../comment/entities/comment';
import { Board } from '../../entities/board.entity';
import { Account } from '../../../account/entities/account';
import { BoardFileDb } from '../../board-file-db';
import { BoardFile } from '../../../file/entities/board-file.entity';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { EventBus } from '@nestjs/cqrs';

// Repository mocking
const mockRepository = () => ({
  delete: jest.fn(),
  softDelete: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  map: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteQna', () => {
  let deleteQnaHandler: DeleteQnaHandler;
  let qnaRepository: MockRepository<Qna>;
  let commentRepository: MockRepository<Comment>;
  let boardRepository: MockRepository<Board>;
  let boardFileRepository: MockRepository<BoardFile>;
  let accountRepository: MockRepository<Account>;
  let eventBus: jest.Mocked<EventBus>;

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
        DeleteQnaHandler,
        ConvertException,
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
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
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        { provide: 'qnaFile', useClass: BoardFileDb },
      ],
    }).compile();

    deleteQnaHandler = module.get(DeleteQnaHandler);
    qnaRepository = module.get(getRepositoryToken(Qna));
    commentRepository = module.get(getRepositoryToken(Comment));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('qna 정상 삭제 여부', () => {
    // Given
    const qnaId = 1;
    const boardId = 11;
    const commentId = 1;
    const files = [];
    const account = Account;

    // 기존 내용 - board
    const boardDetail = {
      title: 'title',
      content: 'content',
      boardId: 11,
    };

    const accountIdCheck = {
      title: 'title',
      content: 'content',
      boardId: 11,
      accountId: 27,
    };

    const commentDetail = [
      {
        comment: 'test Content',
        commentId: 11,
      },
    ];

    it('QNA 삭제 성공', async () => {
      qnaRepository.findOneBy.mockResolvedValue(qnaId);
      boardRepository.findOneBy.mockResolvedValue(boardDetail);
      boardFileRepository.findBy.mockResolvedValue(boardId);
      commentRepository.findBy.mockResolvedValue(commentDetail);
      commentRepository.softDelete.mockResolvedValue(commentId);
      qnaRepository.delete.mockResolvedValue(qnaId);
      boardRepository.softDelete.mockResolvedValue(boardId);

      // When
      const result = await deleteQnaHandler.execute(new DeleteQnaCommand(qnaId, new account()));

      // Then
      expect(result).toEqual('삭제가 완료 되었습니다.');
      expect(commentRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('QNA 조회 실패', async () => {
      try {
        const qnaId = 999;
        const result = await deleteQnaHandler.execute(new DeleteQnaCommand(qnaId, new account()));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('QnA 정보를 찾을 수 없습니다.');
      }
    });

    it('QNA 삭제 처리 실패', async () => {
      try {
        qnaRepository.findOneBy.mockResolvedValue(qnaId);
        boardRepository.findOneBy.mockResolvedValue(boardDetail);
        boardFileRepository.findBy.mockResolvedValue(boardId);
        commentRepository.findBy.mockResolvedValue(commentDetail);
        qnaRepository.delete.mockRejectedValue(qnaId);
        const result = await deleteQnaHandler.execute(new DeleteQnaCommand(qnaId, new account()));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(500);
      }
    });

    it('QNA 작성자 본인 여부 체크', async () => {
      try {
        qnaRepository.findOneBy.mockResolvedValue(qnaId);
        boardRepository.findOneBy.mockResolvedValue(accountIdCheck);
        boardFileRepository.findBy.mockResolvedValue(boardId);
        commentRepository.findBy.mockResolvedValue(commentDetail);
        qnaRepository.delete.mockRejectedValue(qnaId);
        const result = await deleteQnaHandler.execute(new DeleteQnaCommand(qnaId, new account()));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('작성자 정보를 확인해주세요.');
      }
    });
  });
});
