import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetFaqSearchQuery } from './get-faq-search.query';

/**
 * FAQ 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqSearchQuery)
export class GetFaqSearchHandler implements IQueryHandler<GetFaqSearchQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async execute(query: GetFaqSearchQuery) {
    const { keyword } = query;

    console.log(keyword);

    const faq = await this.faqRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.boardId', 'board')
      .where('notice.board = :title', { title: Like(`%${keyword}%`) })
      .getMany();

    if (!faq) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    // FAQ 리스트 반환
    return faq;
  }
}
