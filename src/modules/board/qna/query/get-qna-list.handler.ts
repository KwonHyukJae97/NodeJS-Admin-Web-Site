import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaListQuery } from './get-qna-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna.entity';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Page } from '../../../../common/utils/page';
import { Comment } from '../../comment/entities/comment';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetQnaListQuery)
export class GetQnaListHandler implements IQueryHandler<GetQnaListQuery> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 1:1 문의 전체 리스트 조회 메소드
   * @param query : 1:1 문의 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 전체 리스트 반환
   */
  async execute(query: GetQnaListQuery) {
    const { param, account } = query;

    // 하나의 qna에 대한 답변 여부를 판단하기 위한 서브 쿼리
    const commentQb = this.commentRepository
      .createQueryBuilder()
      .subQuery()
      .select(['comment.commentId AS commentId', 'comment.qnaId AS qnaId'])
      .from(Comment, 'comment')
      .groupBy('comment.qnaId')
      .getQuery();

    // 본인이 작성한 문의 내역 전체 조회
    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoinAndSelect('qna.board', 'board')
      .leftJoin(commentQb, 'comment', 'comment.qnaId = qna.qnaId')
      .where('board.accountId like :accountId', { accountId: `%${account.accountId}%` })
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
      .orderBy('qna.qnaId', 'DESC');

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
