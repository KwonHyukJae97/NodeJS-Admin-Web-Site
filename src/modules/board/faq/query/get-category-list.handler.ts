import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCategoryListQuery } from './get-category-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqCategory } from '../entities/faq_category';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * FAQ 카테고리 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetCategoryListQuery)
export class GetCategoryListHandler implements IQueryHandler<GetCategoryListQuery> {
  constructor(
    @InjectRepository(FaqCategory) private categoryRepository: Repository<FaqCategory>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * FAQ 카테고리 조회 메소드
   * @param query : FAQ 카테고리 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 FAQ 카테고리 리스트 반환
   */
  async execute(query: GetCategoryListQuery) {
    const { role } = query;

    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .orderBy('category.isUse', 'DESC');

    if (role !== '본사 관리자') {
      category.where('category.isUse = :isUse', { isUse: true });
    }

    const categoryList = await category.getMany();

    return categoryList;
  }
}
