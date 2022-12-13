/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateQnaHandler } from './update-qna.handler';
import { UpdateQnaCommand } from './update-qna.command';
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
  findOneBy: jest.fn(),
  findBy: jest.fn(),
});

// MockRepository 타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateQna', () => {
  let updateQnaHandler: UpdateQnaHandler;
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
        UpdateQnaHandler,
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

    updateQnaHandler = module.get(UpdateQnaHandler);
    qnaRepository = module.get(getRepositoryToken(Qna));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('qna 정상 수정 여부', () => {
    // Given
    const qnaId = 1;
    const boardId = 11;
    const files = [];

    // 기존 내용 - board
    const boardDetail = {
      title: 'title',
      content: 'content',
      boardId: 11,
    };

    // 수정할 내용 - board
    const updateBoard = {
      title: 'Update Title',
      content: 'Update Content',
      boardId: 11,
    };

    // 기존 내용 - qna
    const qnaDetail = {
      boardId: boardId,
      board: boardDetail,
      qnaId: 1,
    };

    // 수정할 내용 - qna
    const updateQna = {
      boardId: boardId,
      board: updateBoard,
      qnaId: 1,
    };
    it('수정 성공', async () => {
      qnaRepository.findOneBy.mockResolvedValue(qnaDetail);
      boardRepository.findOneBy.mockResolvedValue(boardDetail);
      boardFileRepository.findBy.mockResolvedValue(boardId);
      boardRepository.save.mockResolvedValue(updateBoard);
      qnaRepository.save.mockResolvedValue(updateQna);

      // When
      const result = await updateQnaHandler.execute(
        new UpdateQnaCommand(updateBoard.title, updateBoard.content, qnaId, files),
      );

      // Then
      if (result instanceof Board) {
        expect(result.title).toEqual(updateBoard.title);
      }
      if (result instanceof Qna) {
        expect(result.board).toEqual(updateQna.board);
      }
    });

    it('QNA 조회 실패', async () => {
      try {
        const qnaId = 999;
        const result = await updateQnaHandler.execute(
          new UpdateQnaCommand(updateBoard.title, updateBoard.content, qnaId, files),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('QnA 정보를 찾을 수 없습니다.');
      }
    });

    it('게시글 필수 작성 체크', async () => {
      try {
        qnaRepository.findOneBy.mockResolvedValue(qnaDetail);
        boardRepository.findOneBy.mockResolvedValue(boardDetail);
        boardFileRepository.findBy.mockResolvedValue(boardId);
        boardRepository.save.mockRejectedValue(undefined);
        const result = await updateQnaHandler.execute(
          new UpdateQnaCommand(updateBoard.title, updateBoard.content, qnaId, files),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('게시글 정보에입력된 내용을 확인해주세요.');
      }
    });
  });
});
