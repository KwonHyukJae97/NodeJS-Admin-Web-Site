import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TranslatorModule } from 'nestjs-translator';
import { DeleteNoticeHandler } from './delete-notice.handler';
import { Notice } from '../entities/notice';
import { Board } from '../../entities/board';
import { BoardFile } from 'src/modules/file/entities/board-file';
import { BoardFileDb } from '../../board-file-db';
import { EventBus } from '@nestjs/cqrs';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DeleteNoticeCommand } from './delete-notice.command';

const mockRepository = () => ({
  findOneBy: jest.fn(),
  softDelete: jest.fn(),
  delete: jest.fn(),
  findBy: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteNotice', () => {
  let deleteNoticeHandler: DeleteNoticeHandler;
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
        DeleteNoticeHandler,
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

    deleteNoticeHandler = module.get(DeleteNoticeHandler);
    noticeRepository = module.get(getRepositoryToken(Notice));
    boardRepository = module.get(getRepositoryToken(Board));
    fileRepository = module.get(getRepositoryToken(BoardFile));
    eventBus = module.get(EventBus);
  });

  describe('공지사항 정상 삭제', () => {
    // Given
    const noticeId = 1;
    const role = '본사 관리자';
    const findOneNoticeId = { noticeId: 1 };
    const softDeleteNoticeId = { noticeId: 1 };
    const findOneBoardId = { boardId: 1 };
    const softDeleteBoardId = { boardId: 1 };

    it('삭제 성공', async () => {
      noticeRepository.findOneBy.mockResolvedValue(findOneNoticeId);
      boardRepository.findOneBy.mockResolvedValue(findOneBoardId);
      fileRepository.findBy.mockResolvedValue(findOneBoardId);
      noticeRepository.delete.mockResolvedValue(softDeleteNoticeId);
      boardRepository.softDelete.mockResolvedValue(softDeleteBoardId);

      // When
      const result = await deleteNoticeHandler.execute(new DeleteNoticeCommand(noticeId, role));

      // Then
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(result).toEqual('삭제가 완료 되었습니다.');
    });

    it('공지사항 조회 실패', async () => {
      try {
        const noticeId = 999;
        const result = await deleteNoticeHandler.execute(new DeleteNoticeCommand(noticeId, role));
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.response).toBe('공지사항 정보를 찾을 수 없습니다.');
      }
    });
  });
});
