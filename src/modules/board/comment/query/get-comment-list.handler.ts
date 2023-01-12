import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentListQuery } from './get-comment-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Brackets, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { Qna } from '../../qna/entities/qna.entity';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Board } from '../../entities/board.entity';
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
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 전체 리스트 조회 메소드
   * @param query : 답변 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 전체 리스트 반환
   */
  async execute(query: GetCommentListQuery) {
    const { param } = query;

    // 각 qna별 최신 답변 정보를 조회하기 위한 서브 쿼리 (최신 commentId만 조회)
    const commentQb = this.commentRepository
      .createQueryBuilder('comment')
      .subQuery()
      .select(['MAX(comment.commentId) AS commentId', 'comment.qnaId AS qnaId'])
      .from(Comment, 'comment')
      .groupBy('comment.qnaId')
      .getQuery();

    const qna = this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoin(Board, 'board', 'qna.boardId = board.boardId')
      .leftJoin(Account, 'userAc', 'board.accountId = userAc.accountId ')
      // commentQb 서브 쿼리로 최신 commentId 조회 후
      .leftJoin(commentQb, 'comment', 'qna.qnaId = comment.qnaId')
      // Comment에서 최신 commentId로 최신 comment 정보 조인
      .leftJoin(Comment, 'lastComment', 'comment.commentId = lastComment.commentId')
      // 최신 comment에 대한 admin 정보 조인
      .leftJoin(Admin, 'admin', 'lastComment.adminId = admin.adminId')
      .leftJoin(Account, 'adminAc', 'admin.accountId = adminAc.accountId')
      .select([
        'qna.qnaId AS qnaId',
        'board.title AS title',
        'board.viewCount AS viewCount',
        'board.regDate AS regDate',
        'userAc.name AS writerName',
        'userAc.nickname AS writerNickname',
        'IF(comment.commentId IS NOT NULL, true, false) AS isComment',
        'comment.commentId AS lastCommentId',
        'admin.adminId AS adminId',
        'adminAc.name AS commenterName',
        'adminAc.nickname AS commenterNickname',
      ])
      .where('board.delDate IS NULL')
      .orderBy({ 'qna.qnaId': 'DESC' });

    // 작성자 검색
    if (param.searchKey === 'writer') {
      qna.andWhere(
        new Brackets((qb) => {
          qb.where('userAc.name like :name', { name: `%${param.searchWord}%` }).orWhere(
            'userAc.nickname like :nickname',
            { nickname: `%${param.searchWord}%` },
          );
        }),
      );
    }

    // 답변자 검색
    if (param.searchKey === 'commenter') {
      qna.andWhere(
        new Brackets((qb) => {
          qb.where('adminAc.name like :name', { name: `%${param.searchWord}%` }).orWhere(
            'adminAc.nickname like :nickname',
            { nickname: `%${param.searchWord}%` },
          );
        }),
      );
    }

    // 답변 상태 검색
    if (param.searchKey === 'isComment') {
      if (param.searchWord === 'false') {
        qna.andWhere('comment.commentId IS NULL');
      } else {
        qna.andWhere('comment.commentId');
      }
    }

    // 등록일 검색
    if (param.searchKey === 'regDate') {
      qna.andWhere('board.regDate like :regDate', {
        regDate: `%${param.searchWord}%`,
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
