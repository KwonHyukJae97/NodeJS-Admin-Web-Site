/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { Board } from '../../entities/board.entity';
import { BoardFile } from '../../../file/entities/board-file.entity';
import { Account } from '../../../account/entities/account';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { GetNoticeDetailHandler } from './get-notice-detail.handler';
import { Notice } from '../entities/notice.entity';
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
    it('공지사항 조회 성공', async () => {
      noticeRepository.findOneBy.mockReturnValue(notice);
      boardRepository.findOneBy.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);
      noticeRepository.save.mockReturnValue(notice);
      accountRepository.findOneBy.mockReturnValue(accountId);
      boardFileRepository.findBy.mockReturnValue(boardId);

      // When
      const result = await getNoticeDetailHandler.execute(new GetNoticeDetailCommand(noticeId));

      // Then
      expect(result).toEqual(resultNoticeInfo);
    });

    it('공지사항 조회 실패', async () => {
      try {
        const noticeId = 999;
        const result = await getNoticeDetailHandler.execute(new GetNoticeDetailCommand(noticeId));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('공지사항 정보를 찾을 수 없습니다.');
      }
    });

    it('게시글 조회 실패', async () => {
      try {
        const boardId = 999;
        noticeRepository.findOneBy.mockReturnValue(notice);

        const result = await getNoticeDetailHandler.execute(new GetNoticeDetailCommand(noticeId));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('게시글 정보를 찾을 수 없습니다.');
      }
    });
  });
});
