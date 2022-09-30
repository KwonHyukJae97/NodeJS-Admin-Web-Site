import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFaqInfoQuery } from './get-faq-info.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * FAQ 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqInfoQuery)
export class GetFaqInfoHandler implements IQueryHandler<GetFaqInfoQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async execute(query: GetFaqInfoQuery) {
    const faq = await this.faqRepository.find({
      order: { faqId: 'DESC' },
    });

    if (!faq) {
      throw new NotFoundException('작성된 게시글이 없습니다.');
    }
    // FAQ 리스트 반환
    return faq;
  }
}
