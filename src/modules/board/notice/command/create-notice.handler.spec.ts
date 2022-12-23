import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
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
    eventBus = module.get(EventBus);
  });

  describe('공지사항 등록 여부', () => {
    const content = '공지사항 내용';
    const isTop = true;
    const noticeGrant = 'noticeGrant';
    const role = '본사 관리자';
    const files = [];
    const title = '공지사항입니다.';
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

    it('공지사항 등록 성공', async () => {
      noticeRepository.create.mockReturnValue(notice);
      noticeRepository.save.mockReturnValue(notice);
      boardRepository.create.mockReturnValue(board);
      boardRepository.save.mockReturnValue(board);

      const result = await createNoticeHandler.execute(
        new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files),
      );
      expect(result).toEqual(notice);
      expect(eventBus.publish).toHaveBeenCalledTimes(0);
    });

    it('게시글 정보 필수 작성 체크 후 등록 실패 처리', async () => {
      try {
        boardRepository.save.mockRejectedValue(board);

        const result = await createNoticeHandler.execute(
          new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('게시글 정보에입력된 내용을 확인해주세요.');
      }
    });

    it('공지사항 정보 필수 작성 체크 후 등록 실패 처리', async () => {
      try {
        boardRepository.create.mockReturnValue(board);
        boardRepository.save.mockReturnValue(board);
        noticeRepository.save.mockRejectedValue(notice);

        const result = await createNoticeHandler.execute(
          new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files),
        );
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.response).toBe('공지사항 정보에입력된 내용을 확인해주세요.');
      }
    });
  });
});
