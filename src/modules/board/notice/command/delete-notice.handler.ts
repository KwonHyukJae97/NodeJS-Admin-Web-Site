import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteNoticeCommand } from './delete-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Notice } from '../entities/notice';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { FilesDeleteEvent } from '../../../file/event/files-delete-event';
import { BoardFileDb } from '../../board-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 공지사항 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteNoticeCommand)
export class DeleteNoticeHandler implements ICommandHandler<DeleteNoticeCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject('noticeFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private eventBus: EventBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 공지사항 삭제 메소드
   * @param command : 공지사항 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteNoticeCommand) {
    const { noticeId } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // if (role !== '본사 관리자' && role !== '회원사 관리자') {
    //   throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    // }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const notice = await this.noticeRepository.findOneBy({ noticeId });

    if (!notice) {
      return this.convertException.notFoundError('공지사항', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: notice.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // if (account.accountId != board.accountId) {
    //   return this.convertException.badRequestAccountError('작성자', 400);
    // }

    const boardFiles = await this.fileRepository.findBy({ boardId: board.boardId });

    if (boardFiles.length !== 0) {
      // 파일 삭제 이벤트 처리
      this.eventBus.publish(new FilesDeleteEvent(board.boardId, this.boardFileDb));
    }

    try {
      await queryRunner.manager.getRepository(Notice).delete(notice);
      await queryRunner.manager.getRepository(Board).softDelete({ boardId: board.boardId });
      await queryRunner.commitTransaction();

      return '삭제가 완료 되었습니다.';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }
  }
}
