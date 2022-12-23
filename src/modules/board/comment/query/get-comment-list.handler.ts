import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentListQuery } from './get-comment-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Brackets, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Qna } from '../../qna/entities/qna';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Board } from '../../entities/board';
import { Admin } from '../../../account/admin/entities/admin';
import { Page } from '../../../../common/utils/page';
import { Account } from '../../../account/entities/account';

/**
 * 답변 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetCommentListQuery)
export class GetCommentListHandler implements IQueryHandler<GetCommentListQuery> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 전체 리스트 조회 메소드
   * @param query : 답변 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 전체 리스트 반환
   */
  async execute(query: GetCommentListQuery) {
    const { param } = query;

    // 하나의 qna에 대한 답변 여부를 판단하기 위한 서브 쿼리
    const commentQb = this.commentRepository
      .createQueryBuilder()
      .subQuery()
      .select([
        'comment.commentId AS commentId',
        'comment.qnaId AS qnaId',
        'comment.adminId AS adminId',
      ])
      .from(Comment, 'comment')
      .groupBy('comment.qnaId')
      .getQuery();

    // 전체 문의내역 조회 (본사관리자 기준)
    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoin(Board, 'board', 'qna.boardId = board.boardId')
      .leftJoin(commentQb, 'comment', 'qna.qnaId = comment.qnaId')
      .select([
        'qna.qnaId AS qnaId',
        'board.accountId AS accountId',
        'board.title AS title',
        'board.viewCount AS viewCount',
        'board.regDate AS regDate',
      ])
      .addSelect(['IF(comment.commentId IS NOT NULL, true, false) AS isComment'])
      .where('board.delDate IS NULL')
      .orderBy({ 'qna.qnaId': 'DESC' });

    // 작성자 검색
    if (param.writer) {
      qna.leftJoin(Account, 'account', 'board.accountId = account.accountId');
      qna.andWhere(
        new Brackets((qb) => {
          qb.where('account.name like name', { name: `%${param.commenter}%` }).orWhere(
            'account.nickname like :nickname',
            { nickname: `%${param.commenter}%` },
          );
        }),
      );
    }

    // 답변자 검색
    if (param.commenter) {
      qna.leftJoin(Admin, 'admin', 'comment.adminId = admin.adminId');
      qna.leftJoin(Account, 'account', 'admin.accountId = account.accountId');
      qna.andWhere(
        new Brackets((qb) => {
          qb.where('account.name like name', { name: `%${param.commenter}%` }).orWhere(
            'account.nickname like :nickname',
            { nickname: `%${param.commenter}%` },
          );
        }),
      );
    }

    // 답변 상태 검색
    if (param.isComment != null) {
      if (!param.isComment) {
        qna.andWhere('comment.commentId IS NULL');
      } else {
        qna.andWhere('comment.commentId');
      }
    }

    // 등록일 검색
    if (param.regDate) {
      qna.andWhere('board.regDate like :regDate', {
        regDate: `%${param.regDate}%`,
      });
    }

    let tempQuery = qna;

    if (!param.totalData) {
      // Raw 쿼리로 받아온 데이터는 take, skip 적용이 안되어 limit, offset으로 대체
      tempQuery = tempQuery.limit(param.getLimit()).offset(param.getOffset());
    }

    const list = await tempQuery.getRawMany();
    const total = await tempQuery.getCount();
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('QnA', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
