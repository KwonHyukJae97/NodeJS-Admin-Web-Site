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
    it('등록 성공', async () => {
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

      boardRepository.create.mockResolvedValue(board);
      boardRepository.save.mockResolvedValue(board);
      qnaRepository.create.mockResolvedValue(qna);
      qnaRepository.save.mockResolvedValue(qna);

      // When
      const result = await createQnaHandler.execute(new CreateQnaCommand(title, content, files));

      // Then
      expect(result).toEqual(qna);
    });
  });
});
