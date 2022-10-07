import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFaqListQuery } from './get-faq-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FaqCategory } from '../entities/faq_category';
import { getDateTime } from '../../../../common/utils/time-common-method';

/**
 * FAQ 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqListQuery)
export class GetFaqListHandler implements IQueryHandler<GetFaqListQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,

    @InjectRepository(FaqCategory)
    private categoryRepository: Repository<FaqCategory>,
  ) {}

  async execute(query: GetFaqListQuery) {
    const { role } = query;

    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      const faq = await this.faqRepository.find({
        order: { faqId: 'DESC' },
      });

      if (!faq) {
        throw new NotFoundException('작성된 게시글이 없습니다.');
      }

      // 시간 변경
      faq.map((faq) => {
        faq.boardId.regDate = getDateTime(faq.boardId.regDate);
      });

      // FAQ 리스트 반환
      return faq;

      // role = 일반 사용자 && 회원사 관리자일 경우 isUse: true 인 데이터만 조회
    } else {
      const faq = await this.faqRepository
        .createQueryBuilder('faq')
        .leftJoinAndSelect('faq.categoryId', 'categoryId')
        .leftJoinAndSelect('faq.boardId', 'board')
        .where('categoryId.isUse = :isUse', { isUse: true })
        .orderBy({ 'faq.faqId': 'DESC' })
        .getMany();

      if (!faq) {
        throw new NotFoundException('작성된 게시글이 없습니다.');
      }

      // 시간 변경
      faq.map((faq) => {
        faq.boardId.regDate = getDateTime(faq.boardId.regDate);
      });

      // FAQ 리스트 반환
      return faq;
    }
  }
}
