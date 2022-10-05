import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetQnaSearchQuery } from './get-qna-search.query';

/**
 * 1:1 문의 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetQnaSearchQuery)
export class GetQnaSearchHandler implements IQueryHandler<GetQnaSearchQuery> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,
  ) {}

  async execute(query: GetQnaSearchQuery) {
    const { keyword } = query;

    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .leftJoinAndSelect('qna.boardId', 'board')
      .where('board.title like :title', { title: `%${keyword}%` })
      .getMany();

    if (!qna || qna.length === 0) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    // 문의 내역 리스트 반환
    return qna;
  }
}
