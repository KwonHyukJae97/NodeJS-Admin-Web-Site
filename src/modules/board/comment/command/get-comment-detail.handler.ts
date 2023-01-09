import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCommentDetailCommand } from './get-comment-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { DataSource, Repository } from 'typeorm';
import { Board } from '../../entities/board.entity';
import { Qna } from '../../qna/entities/qna.entity';
import { BoardFile } from '../../../file/entities/board-file.entity';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account';
import { Admin } from '../../../account/admin/entities/admin';
import { Company } from '../../../company/entities/company.entity';

/**
 * 답변 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetCommentDetailCommand)
export class GetCommentDetailHandler implements ICommandHandler<GetCommentDetailCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 답변 상세 정보 조회 메소드
   * @param command : 답변 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 상세 정보 반환
   */
  async execute(command: GetCommentDetailCommand) {
    const { qnaId } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .where('qna.qnaId = :qnaId', { qnaId: qnaId })
      .leftJoinAndSelect('qna.board', 'board')
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
      .getRawOne();

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // 문의 내역 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await queryRunner.manager.getRepository(Board).save(board);

      qna.boardId = board.boardId;
      await queryRunner.manager.getRepository(Qna).save(qna);

      const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

      const files = await this.fileRepository.findBy({ boardId: board.boardId });

      const comments = await this.commentRepository.find({
        where: { qnaId: qnaId },
        order: { commentId: 'DESC' },
      });

      let commentInfo;

      // 답변별 답변자 정보 담아주기
      const commentList = await Promise.all(
        comments.map(async (comment) => {
          // 쿼리빌더로 한번에 admin + account 정보 조회
          const adminAccount = await this.adminRepository
            .createQueryBuilder('admin')
            .leftJoinAndSelect(Account, 'account', 'account.accountId = admin.accountId')
            .where('admin.adminId = :adminId', { adminId: comment.adminId })
            .getRawOne();

          const commenter =
            adminAccount == null
              ? '탈퇴 관리자(*****)'
              : adminAccount.account_name + '(' + adminAccount.account_nickname + ')';

          // 본사 관리자일 경우
          if (adminAccount.admin_is_super == 0) {
            commentInfo = {
              ...comment,
              commenter,
            };

            // 회원사 관리자일 경우
          } else {
            const company = await this.companyRepository.findOneBy({
              companyId: adminAccount.admin_company_id,
            });

            const commenter =
              adminAccount == null
                ? '탈퇴 관리자(*****)'
                : adminAccount.account_name + '(' + adminAccount.account_nickname + ')';

            commentInfo = {
              ...comment,
              commenter,
              companyName: company.companyName,
              companyId: company.companyId,
            };
          }
          return commentInfo;
        }),
      );

      const writer =
        account == null ? '탈퇴 회원(*****)' : account.name + '(' + account.nickname + ')';

      const getCommentDetailDto = {
        qna: { ...qna, writer, fileList: files },
        commentList,
      };

      await queryRunner.commitTransaction();
      return getCommentDetailDto;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }
  }
}
