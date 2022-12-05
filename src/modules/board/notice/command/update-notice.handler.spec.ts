import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { UpdateNoticeHandler } from './update-notice.handler';
import { Notice } from '../entities/notice';
import { Board } from '../../entities/board';
import { BoardFile } from 'src/modules/file/entities/board-file';
import { UpdateNoticeCommand } from './update-notice.command';
import { ConvertException } from 'src/common/utils/convert-exception';
import { BoardFileDb } from '../../board-file-db';
import { EventBus } from '@nestjs/cqrs';

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

describe('UpdateNotice', () => {
  let updateNoticeHandler: UpdateNoticeHandler;
  let noticeRepository: MockRepository<Notice>;
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
        UpdateNoticeHandler,
        ConvertException,
        BoardFileDb,
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
          provide: 'noticeFile',
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

    updateNoticeHandler = module.get(UpdateNoticeHandler);
    noticeRepository = module.get(getRepositoryToken(Notice));
    boardRepository = module.get(getRepositoryToken(Board));
    fileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('공지사항 정상 수정 여부', () => {
    it('공지사항 수정 성공', async () => {
      // Given
      const title = '공지사항입니다2.';
      const content = '공지사항 내용2';
      const isTop = true;
      const noticeGrant = 'noticeGrant2';
      const role = '본사 관리자';
      const files = [];
      const noticeId = 1;
      const boardId = 1;

      const board = {
        // accountId: 1,
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
        viewCount: 1,
      };

      const notice = {
        noticeGrant: noticeGrant,
        isTop: isTop,
        boardId: 1,
        board: board,
      };

      const updateNotice = {
        noticeGrant: 'noticeGrant',
        isTop: isTop,
        boardId: 1,
        board: updateBoard,
      };

      // const file = {
      //   boardFileId: 1,
      //   boardId: 1,
      //   fileName: 'fileName',
      //   fileExt: 'fileExt',
      //   filePath: 'filePath',
      //   fileSize: 100,
      // };

      noticeRepository.findOneBy.mockResolvedValue(notice);
      boardRepository.findOneBy.mockResolvedValue(board);
      fileRepository.findBy.mockResolvedValue(boardId);
      boardRepository.save.mockResolvedValue(updateBoard);
      noticeRepository.save.mockResolvedValue(updateNotice);

      // When
      const result = await updateNoticeHandler.execute(
        new UpdateNoticeCommand(
          updateBoard.title,
          updateBoard.content,
          isTop,
          noticeGrant,
          noticeId,
          role,
          files,
        ),
      );

      // Then
      if (result instanceof Board) {
        expect(result.title).toEqual(updateBoard.title);
      }
      if (result instanceof Notice) {
        expect(result.board).toEqual(updateNotice.board);
      }
    });
  });
});
