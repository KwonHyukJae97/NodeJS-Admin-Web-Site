import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { async } from 'rxjs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { BoardFile } from 'src/modules/file/entities/board-file';
import { Repository } from 'typeorm';
import { BoardFileDb } from '../../board-file-db';
import { Board } from '../../entities/board';
import { Faq } from '../entities/faq';
import { FaqCategory } from '../entities/faq_category';
import { CreateFaqCommand } from './create-faq.command';
import { CreateFaqHandler } from './create-faq.handler';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findOneBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('createFaq', () => {
  let createFaqHandler: CreateFaqHandler;
  let faqRepository: MockRepository<Faq>;
  let categoryRepository: MockRepository<FaqCategory>;
  let boardRepository: MockRepository<Board>;
  let fileRepository: MockRepository<BoardFile>;

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
        CreateFaqHandler,
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

    createFaqHandler = module.get(CreateFaqHandler);
    faqRepository = module.get(getRepositoryToken(Faq));
    categoryRepository = module.get(getRepositoryToken(FaqCategory));
    boardRepository = module.get(getRepositoryToken(Board));
    fileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('FAQ 등록 여부', () => {
    it('FAQ 등록 성공', async () => {
      const title = 'FAQ입니다.';
      const content = 'FAQ 내용';
      const categoryName = '카테고리 제목';
      const role = '본사 관리자';
      const files = [];

      const board = {
        accountId: 27,
        boardTypeCode: '1',
        title: title,
        content: content,
        viewCount: 0,
      };

      const category = {
        categoryName: categoryName,
      };

      const faq = {
        boardId: 1,
        categoryId: 1,
        board: board,
      };

      boardRepository.create.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);
      categoryRepository.findOneBy.mockReturnValue(category);
      faqRepository.create.mockReturnValue(faq);
      faqRepository.save.mockReturnValue(faq);

      const result = await createFaqHandler.execute(
        new CreateFaqCommand(title, content, categoryName, role, files),
      );
      expect(result).toEqual(faq);
    });
  });
});
