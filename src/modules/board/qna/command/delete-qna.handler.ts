import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteQnaCommand } from './delete-qna.command';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Qna } from '../entities/qna';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';
import { BoardFileDb } from '../../board-file-db';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { DeleteFilesCommand } from '../../../file/command/delete-files.command';

/**
 * 1:1 문의 삭제용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(DeleteQnaCommand)
export class DeleteQnaHandler implements ICommandHandler<DeleteQnaCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @Inject('boardFile') private boardFileDb: BoardFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  /**
   * 1:1 문의 삭제 메소드
   * @param command : 1:1 문의 삭제에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 삭제 성공 시 완료 메시지 반환
   */
  async execute(command: DeleteQnaCommand) {
    const { qnaId, account } = command;

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

    const boardFiles = await this.fileRepository.findBy({ boardId: board.boardId });

    try {
      if (boardFiles.length !== 0) {
        // 파일 삭제 이벤트 처리
        const command = new DeleteFilesCommand(board.boardId, this.boardFileDb, queryRunner);
        await this.commandBus.execute(command);
      }

      const comments = await this.commentRepository.findBy({ qnaId });

      comments.map((comment) => {
        queryRunner.manager.getRepository(Comment).softDelete({ commentId: comment.commentId });
      });

      await queryRunner.manager.getRepository(Qna).delete(qna);
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
