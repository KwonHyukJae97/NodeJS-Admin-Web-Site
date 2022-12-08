/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateQnaHandler } from './create-qna.handler';
import { CreateQnaCommand } from './create-qna.command';
import { Repository } from 'typeorm';
import { Qna } from '../entities/qna';
import { Board } from '../../entities/board';
import { BoardFileDb } from '../../board-file-db';
import { BoardFile } from '../../../file/entities/board-file';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { EventBus } from '@nestjs/cqrs';

// Repository mocking
const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateQna', () => {
  let createQnaHandler: CreateQnaHandler;
  let qnaRepository: MockRepository<Qna>;
  let boardRepository: MockRepository<Board>;
  let boardFileRepository: MockRepository<BoardFile>;
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
        CreateQnaHandler,
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
        { provide: 'qnaFile', useClass: BoardFileDb },
      ],
    }).compile();

    createQnaHandler = module.get(CreateQnaHandler);
    qnaRepository = module.get(getRepositoryToken(Qna));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('qna 정상 등록 여부', () => {
    // Given
    const accountId = 27;
    const boardTypeCode = '2';
    const title = 'test';
    const content = 'test Content';
    const viewCount = 0;

    const board = {
      boardId: 11,
      accountId: accountId,
      boardTypeCode: boardTypeCode,
      title: title,
      content: content,
      viewCount: viewCount,
    };

    const qna = {
      boardId: board.boardId,
      board: board,
    };

    const files = [];

    it('QNA 등록 성공', async () => {
      boardRepository.create.mockResolvedValue(board);
      boardRepository.save.mockResolvedValue(board);
      qnaRepository.create.mockResolvedValue(qna);
      qnaRepository.save.mockResolvedValue(qna);

      // When
      const result = await createQnaHandler.execute(new CreateQnaCommand(title, content, files));

      // Then
      expect(result).toEqual(qna);
    });

    it('게시글 정보 필수 작성 체크 후 등록 실패 처리', async () => {
      try {
        boardRepository.save.mockRejectedValue(board);

        const result = await createQnaHandler.execute(new CreateQnaCommand(title, content, files));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('게시글 정보에입력된 내용을 확인해주세요.');
      }
    });

    it('QNA 정보 필수 작성 체크 후 등록 실패 처리', async () => {
      try {
        boardRepository.create.mockReturnValue(board);
        boardRepository.save.mockReturnValue(board);
        qnaRepository.create.mockResolvedValue(qna);
        qnaRepository.save.mockRejectedValue(qna);

        const result = await createQnaHandler.execute(new CreateQnaCommand(title, content, files));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('QnA 정보에입력된 내용을 확인해주세요.');
      }
    });
  });
});
