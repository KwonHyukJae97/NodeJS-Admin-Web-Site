/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteQnaHandler } from './delete-qna.handler';
import { DeleteQnaCommand } from './delete-qna.command';
import { Repository } from 'typeorm';
import { Qna } from '../entities/qna';
import { Comment } from '../../comment/entities/comment';
import { Board } from '../../entities/board';
import { Account } from '../../../account/entities/account';
import { BoardFileDb } from '../../board-file-db';
import { BoardFile } from '../../../file/entities/board-file';
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
    it('삭제 성공', async () => {
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

      const commentDetail = [
        {
          comment: 'test Content',
          commentId: 11,
        },
      ];

      qnaRepository.findOneBy.mockResolvedValue(qnaId);
      boardRepository.findOneBy.mockResolvedValue(boardDetail);
      boardFileRepository.findBy.mockResolvedValue(boardId);
      commentRepository.findBy.mockResolvedValue(commentDetail);
      qnaRepository.delete.mockResolvedValue(qnaId);

      // When
      const result = await deleteQnaHandler.execute(new DeleteQnaCommand(qnaId, new account()));

      // Then
      expect(result).toEqual('삭제가 완료 되었습니다.');
    });
  });
});
