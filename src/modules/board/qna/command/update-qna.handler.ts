import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateQnaCommand } from './update-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFileDb } from '../../board-file-db';
import { FileType } from '../../../file/entities/file-type.enum';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { BoardFile } from '../../../file/entities/board-file';
import { DeleteFilesCommand } from '../../../file/command/delete-files.command';
import { CreateFilesCommand } from '../../../file/command/create-files.command';
import { UpdateFilesCommand } from '../../../file/command/update-files.command';

/**
 * 1:1 문의 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateQnaCommand)
export class UpdateQnaHandler implements ICommandHandler<UpdateQnaCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @Inject('boardFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 1:1 문의 정보 수정 메소드
   * @param command : 1:1 문의 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 1:1 문의 정보 반환
   */
  async execute(command: UpdateQnaCommand) {
    const { title, content, qnaId, files, account } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const qna = await this.qnaRepository.findOneBy({ qnaId });

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    if (account.accountId != board.accountId) {
      return this.convertException.badRequestAccountError('작성자', 400);
    }

    board.title = title;
    board.content = content;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      qna.board = board;
      await queryRunner.manager.getRepository(Qna).save(qna);

      const boardFiles = await this.fileRepository.findBy({ boardId: board.boardId });

      if (files.length === 0) {
        // 기존 파일만 존재하면 '삭제' 이벤트 처리
        if (boardFiles.length !== 0) {
          const command = new DeleteFilesCommand(board.boardId, this.boardFileDb, queryRunner);
          await this.commandBus.execute(command);
        }
      } else {
        // 신규 파일만 존재하면 '등록' 이벤트 처리
        if (boardFiles.length === 0) {
          const command = new CreateFilesCommand(
            board.boardId,
            FileType.QNA,
            null,
            files,
            this.boardFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
          // 신규 파일 & 기존 파일 모두 존재하면 '수정' 이벤트 처리
        } else {
          const command = new UpdateFilesCommand(
            board.boardId,
            FileType.QNA,
            null,
            files,
            this.boardFileDb,
            queryRunner,
          );
          await this.commandBus.execute(command);
        }
      }

      await queryRunner.commitTransaction();
      return qna;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('QnA 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
