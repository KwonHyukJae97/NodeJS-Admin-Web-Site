import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetQnaDetailCommand } from './get-qna-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna.entity';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { BoardFile } from '../../../file/entities/board-file.entity';
import { Comment } from '../../comment/entities/comment';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account.entity';
import { Admin } from '../../../account/admin/entities/admin.entity';

/**
 * 1:1 문의 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetQnaDetailCommand)
export class GetQnaDetailHandler implements ICommandHandler<GetQnaDetailCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 1:1 문의 상세 정보 조회 메소드
   * @param command : 1:1 문의 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 상세 정보 반환
   */
  async execute(command: GetQnaDetailCommand) {
    const { qnaId, account } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // board 조회수 업데이트
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect(Qna, 'qna', 'qna.boardId = board.boardId')
      .where('qna.qnaId = :qnaId', { qnaId: qnaId })
      .getOne();

    // 문의 내역 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .where('qna.qnaId = :qnaId', { qnaId: qnaId })
        .leftJoinAndSelect('qna.board', 'board')
        .leftJoin(Comment, 'comment', 'comment.qnaId = qna.qnaId')
        .select([
          'qna.qnaId AS qnaId',
          'qna.boardId AS boardId',
          'board.accountId AS accountId',
          'board.boardTypeCode AS boardTypeCode',
          'board.title AS title',
          'board.content AS content',
          'board.viewCount AS viewCount',
          'board.regDate AS regDate',
        ])
        .addSelect(['IF(comment.commentId IS NOT NULL, true, false) AS isComment'])
        .getRawOne();

      if (qna.accountId != account.accountId) {
        return this.convertException.badRequestAccountError('계정', 400);
      }

      // 업데이트된 조회수 저장
      qna.boardId = board.boardId;
      await queryRunner.manager.getRepository(Qna).save(qna);

      // 문의 작성자 정보 조회
      const qnaAccount = await this.accountRepository.findOneBy({ accountId: qna.accountId });
      const writer =
        qnaAccount == null ? '탈퇴 회원(*****)' : qnaAccount.name + '(' + qnaAccount.nickname + ')';

      // 파일 정보 조회
      const files = await this.fileRepository
        .createQueryBuilder('boardFile')
        .leftJoinAndSelect(Board, 'board', 'board.boardId = boardFile.boardId')
        .where('boardFile.boardId = :boardId', { boardId: qna.boardId })
        .getMany();

      // 답변 정보 조회
      const comments = await this.commentRepository
        .createQueryBuilder('comment')
        .where('comment.qnaId = :qnaId', { qnaId: qnaId })
        .orderBy({ 'comment.commentId': 'DESC' })
        .getMany();

      const commentList = await Promise.all(
        comments.map(async (comment) => {
          // 답변 작성자 정보 조회
          const commentAccount = await this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect(Admin, 'admin', 'admin.adminId = comment.adminId')
            .where('admin.adminId = :adminId', { adminId: comment.adminId })
            .leftJoinAndSelect(Account, 'account', 'account.accountId = admin.accountId')
            .select(['account.name AS name', 'account.nickname AS nickname'])
            .getRawOne();

          const commenter =
            commentAccount == null
              ? '탈퇴 관리자(*****)'
              : commentAccount.name + '(' + commentAccount.nickname + ')';

          return { ...comment, commenter };
        }),
      );

      const getQnaDetailDto = {
        qna: { ...qna, writer, fileList: files },
        commentList,
      };

      await queryRunner.commitTransaction();
      return getQnaDetailDto;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }
  }
}
