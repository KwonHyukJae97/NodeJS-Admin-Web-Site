import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Board } from '../../entities/board';
import { BoardFile } from 'src/modules/file/entities/board-file';
import { ConvertException } from 'src/common/utils/convert-exception';
import { BoardFileDb } from '../../board-file-db';
import { EventBus } from '@nestjs/cqrs';
import { UpdateFaqHandler } from './update-faq.handler';
import { Faq } from '../entities/faq';
import { FaqCategory } from '../entities/faq_category';
import { UpdateFaqCommand } from './update-faq.command';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  update: jest.fn(),
  insert: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UpdateFaq', () => {
  let updateFaqHandler: UpdateFaqHandler;
  let faqRepository: MockRepository<Faq>;
  let boardRepository: MockRepository<Board>;
  let fileRepository: MockRepository<BoardFile>;
  let categoryRepository: MockRepository<FaqCategory>;

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
        UpdateFaqHandler,
        ConvertException,
        BoardFileDb,
        {
          provide: getRepositoryToken(Faq),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(FaqCategory),
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
          provide: 'faqFile',
          useClass: BoardFileDb,
        },
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    updateFaqHandler = module.get(UpdateFaqHandler);
    faqRepository = module.get(getRepositoryToken(Faq));
    boardRepository = module.get(getRepositoryToken(Board));
    fileRepository = module.get(getRepositoryToken(BoardFile));
    categoryRepository = module.get(getRepositoryToken(FaqCategory));
  });

  describe('Faq 정상 수정 여부', () => {
    it('Faq 수정 성공', async () => {
      // Given
      const title = 'Faq제목.';
      const content = 'faq 내용';
      const categoryName = '카테고리 제목';
      const role = '본사 관리자';
      const faqId = 1;
      const files = [];
      const boardId = 1;

      const board = {
        boardId: boardId,
        boardTypeCode: '0',
        title: title,
        content: content,
        viewCount: 0,
      };

      const updateBoard = {
        boardId: boardId,
        boardTypeCode: '1',
        title: 'title',
        content: 'content',
      };

      const faq = {
        board: board,
      };

      const updateFaq = {
        board: updateBoard,
      };

      faqRepository.findOneBy.mockResolvedValue(faq);
      boardRepository.findOneBy.mockResolvedValue(board);
      fileRepository.findBy.mockResolvedValue(boardId);
      categoryRepository.findOneBy.mockResolvedValue(categoryName);
      boardRepository.save.mockResolvedValue(updateBoard);
      faqRepository.save.mockResolvedValue(updateFaq);

      // When
      const result = await updateFaqHandler.execute(
        new UpdateFaqCommand(
          updateBoard.title,
          updateBoard.content,
          categoryName,
          role,
          faqId,
          files,
        ),
      );

      // Then
      if (result instanceof Board) {
        expect(result.title).toEqual(updateBoard.title);
      }
      if (result instanceof Faq) {
        expect(result.board).toEqual(updateFaq.board);
      }
      // expect(result).toEqual(undefined);
    });
  });
});
