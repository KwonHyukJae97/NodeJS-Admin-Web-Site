import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaListQuery } from './get-qna-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';

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
    const { account } = query;

    // 본인이 작성한 문의 내역 전체 조회
    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoinAndSelect('qna.board', 'board')
      .where('board.accountId like :accountId', { accountId: `%${account.accountId}%` })
      .orderBy('qna.qnaId', 'DESC')
      .getMany();

    if (qna.length === 0) {
      return this.convertException.notFoundError('QnA', 404);
    }

    return qna;
  }
}
