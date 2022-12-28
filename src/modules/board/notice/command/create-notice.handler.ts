import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './create-notice.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { CreateFilesCommand } from '../../../file/command/create-files.command';

/**
 * 공지사항 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateNoticeCommand)
export class CreateNoticeHandler implements ICommandHandler<CreateNoticeCommand> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject('boardFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 공지사항 등록 메소드
   * @param command : 공지사항 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 공지사항 정보 반환
   */
  async execute(command: CreateNoticeCommand) {
    const { title, content, isTop, noticeGrant, files, account } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const board = queryRunner.manager.getRepository(Board).create({
        accountId: account.accountId,
        boardTypeCode: '0',
        title,
        content,
        viewCount: 0,
      });

      await queryRunner.manager.getRepository(Board).save(board);

      const notice = queryRunner.manager.getRepository(Notice).create({
        noticeGrant,
        isTop,
        boardId: board.boardId,
        board: board,
      });

      await queryRunner.manager.getRepository(Notice).save(notice);

      // board-file 트랜잭션 처리를 위해 event 방식에서 command 방식으로 변경
      if (files.length !== 0) {
        const command = new CreateFilesCommand(
          board.boardId,
          FileType.NOTICE,
          files,
          this.boardFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }

      await queryRunner.commitTransaction();
      return notice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('공지사항 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
