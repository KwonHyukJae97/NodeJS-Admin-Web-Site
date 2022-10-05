import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaInfoQuery } from './get-qna-info.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * 1:1 문의 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetQnaInfoQuery)
export class GetQnaInfoHandler implements IQueryHandler<GetQnaInfoQuery> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,
  ) {}

  async execute(query: GetQnaInfoQuery) {
    const qna = await this.qnaRepository.find({
      order: { qnaId: 'DESC' },
    });

    if (!qna) {
      throw new NotFoundException('작성된 문의 내역이 없습니다.');
    }
    // 문의 내역 리스트 반환
    return qna;
  }
}
