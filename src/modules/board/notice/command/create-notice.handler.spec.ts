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
import { Notice } from '../entities/notice';
import { CreateNoticeCommand } from './create-notice.command';
import { CreateNoticeHandler } from './create-notice.handler';

const mockRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('createNotice', () => {
  let createNoticeHandler: CreateNoticeHandler;
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
        CreateNoticeHandler,
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

    createNoticeHandler = module.get(CreateNoticeHandler);
    noticeRepository = module.get(getRepositoryToken(Notice));
    boardRepository = module.get(getRepositoryToken(Board));
    fileRepository = module.get(getRepositoryToken(BoardFile));
  });

  describe('공지사항 등록 여부', () => {
    it('공지사항 등록 성공', async () => {
      const title = '공지사항입니다.';
      const content = '공지사항 내용';
      const isTop = true;
      const noticeGrant = 'noticeGrant';
      const role = '본사 관리자';
      const files = [];

      const board = {
        accountId: 1,
        boardTypeCode: '0',
        title: title,
        content: content,
        viewCount: 0,
      };

      const notice = {
        noticeGrant: noticeGrant,
        isTop: isTop,
        boardId: 1,
        board: board,
      };

      noticeRepository.create.mockReturnValue(notice);
      noticeRepository.save.mockReturnValue(notice);
      boardRepository.create.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);

      const result = await createNoticeHandler.execute(
        new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files),
      );
      expect(result).toEqual(notice);
    });
  });
});
