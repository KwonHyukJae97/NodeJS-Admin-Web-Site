import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';
import { Admin } from '../../../account/admin/entities/admin';
import { Account } from '../../../account/entities/account';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { GetFaqDetailHandler } from './get-faq-detail.handler';
import { Faq } from '../entities/faq';
import { FaqCategory } from '../entities/faq_category';
import { GetFaqDetailCommand } from './get-faq-detail.command';

const mockRepository = () => ({
  findOneBy: jest.fn(),
  save: jest.fn(),
  findBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockReturnThis(),
  }),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('GetFaqDetail', () => {
  let getFaqDetailHandler: GetFaqDetailHandler;
  let faqRepository: MockRepository<Faq>;
  let boardRepository: MockRepository<Board>;
  let boardFileRepository: MockRepository<BoardFile>;
  let categoryRepository: MockRepository<FaqCategory>;
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
        GetFaqDetailHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Faq),
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
          provide: getRepositoryToken(FaqCategory),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getFaqDetailHandler = module.get(GetFaqDetailHandler);
    faqRepository = module.get(getRepositoryToken(Faq));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
    categoryRepository = module.get(getRepositoryToken(FaqCategory));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('faq 상세 정보 정상 조회 여부', () => {
    it('조회 성공', async () => {
      // Given
      const faqId = 1;
      const role = '본사 관리자';
      //   const categoryId = 1;
      const accountId = 2;
      const boardId = 1;
      //   const viewCount = 0;

      const board = {
        boardId: 2,
        accountId: 2,
        boardTypeCode: '2',
        title: 'title',
        content: 'content',
        viewCount: 0,
      };
      const category = {
        categoryId: 1,
        categoryName: '카테고리 제목',
      };

      const files = [];

      const faq = {
        faqId: 1,
        category: category,
        board: board,
        // boardId: board.boardId,
      };

      const resultFaqInfo = {
        faq: faq,
        category: category,
        // board: board,
        fileList: 1,
        writer: 'undefined(undefined)',
      };

      faqRepository.findOneBy.mockReturnValue(faq);
      categoryRepository.findOneBy.mockReturnValue(category);
      boardRepository.findOneBy.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);
      faqRepository.save.mockReturnValue(faq);
      accountRepository.findOneBy.mockReturnValue(accountId);
      boardFileRepository.findBy.mockReturnValue(boardId);

      // When
      const result = await getFaqDetailHandler.execute(new GetFaqDetailCommand(faqId, role));

      // Then
      expect(result).toEqual(resultFaqInfo);
    });
  });
});
