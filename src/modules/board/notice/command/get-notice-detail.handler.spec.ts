import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Account } from '../../../account/entities/account';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { GetNoticeDetailHandler } from './get-notice-detail.handler';
import { Notice } from '../entities/notice';
import { GetNoticeDetailCommand } from './get-notice-detail.command';

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

describe('GetNoticeDetail', () => {
  let getNoticeDetailHandler: GetNoticeDetailHandler;
  let noticeRepository: MockRepository<Notice>;
  let boardRepository: MockRepository<Board>;
  let boardFileRepository: MockRepository<BoardFile>;
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
        GetNoticeDetailHandler,
        ConvertException,
        {
          provide: getRepositoryToken(Notice),
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
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    getNoticeDetailHandler = module.get(GetNoticeDetailHandler);
    noticeRepository = module.get(getRepositoryToken(Notice));
    boardRepository = module.get(getRepositoryToken(Board));
    boardFileRepository = module.get(getRepositoryToken(BoardFile));
    accountRepository = module.get(getRepositoryToken(Account));
  });

  describe('공지사항 상세 정보 정상 조회 여부', () => {
    it('공지사항 조회 성공', async () => {
      // Given
      const noticeId = 1;
      const role = '본사 관리자';
      const accountId = 27;
      const boardId = 12;
      //   const viewCount = 0;
      //   const noticeGrant = '0';

      const board = {
        boardId: 11,
        accountId: 2,
        boardTypeCode: '2',
        title: 'title',
        content: 'content',
        viewCount: 0,
      };

      const notice = {
        noticeId: 1,
        role: role,
        board: board,
        boardId: board.boardId,
        noticeGrant: '0',
        isTop: true,
      };

      const resultNoticeInfo = {
        notice: notice,
        fileList: 12,
        writer: 'undefined(undefined)',
        // board: board,
      };

      noticeRepository.findOneBy.mockReturnValue(notice);
      boardRepository.findOneBy.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);
      noticeRepository.save.mockReturnValue(notice);
      accountRepository.findOneBy.mockReturnValue(accountId);
      boardFileRepository.findBy.mockReturnValue(boardId);

      // When
      const result = await getNoticeDetailHandler.execute(
        new GetNoticeDetailCommand(noticeId, role),
      );

      // Then
      expect(result).toEqual(resultNoticeInfo);
    });
  });
});
