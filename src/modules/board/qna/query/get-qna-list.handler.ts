import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaListQuery } from './get-qna-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Page } from '../../../../common/utils/page';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetQnaListQuery)
export class GetQnaListHandler implements IQueryHandler<GetQnaListQuery> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 1:1 문의 전체 리스트 조회 메소드
   * @param query : 1:1 문의 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 전체 리스트 반환
   */
  async execute(query: GetQnaListQuery) {
    const { param } = query;

    // 본인이 작성한 문의 내역 전체 조회
    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoinAndSelect('qna.board', 'board')
      // .where('board.accountId like :accountId', { accountId: `%${account.accountId}%` })
      .where('board.accountId like :accountId', { accountId: `%${param.accountId}%` })
      .orderBy('qna.qnaId', 'DESC');

    let tempQuery = qna;

    if (!param.totalData) {
      tempQuery = tempQuery.take(param.getLimit()).skip(param.getOffset());
    }

    const list = await tempQuery.getMany();
    const total = await tempQuery.getCount();
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('QnA', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
