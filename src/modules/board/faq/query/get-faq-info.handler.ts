import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFaqInfoQuery } from './get-faq-info.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FaqCategory } from '../entities/faq_category';

/**
 * FAQ 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqInfoQuery)
export class GetFaqInfoHandler implements IQueryHandler<GetFaqInfoQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(FaqCategory)
    private categoryRepository: Repository<FaqCategory>,
  ) {}

  async execute(query: GetFaqInfoQuery) {
    const { role } = query;

    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      const faq = await this.faqRepository.find({
        order: { faqId: 'DESC' },
      });

      if (!faq) {
        throw new NotFoundException('작성된 게시글이 없습니다.');
      }
      // FAQ 리스트 반환
      return faq;

      // role = 일반 사용자 && 회원사 관리자일 경우 isUse: true 인 데이터만 조회
    } else {
      const faq = await this.faqRepository
        .createQueryBuilder('faq')
        .leftJoinAndSelect('faq.categoryId', 'categoryId')
        .where('categoryId.isUse = :isUse', { isUse: true })
        .getMany();

      if (!faq) {
        throw new NotFoundException('작성된 게시글이 없습니다.');
      }
      // FAQ 리스트 반환
      return faq;
    }
  }
}
