import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq.entity';
import { Repository } from 'typeorm';
import { GetFaqListQuery } from './get-faq-list.query';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Page } from '../../../../common/utils/page';

/**
 * FAQ 전체 & 카테고리별 검색어에 해당하는 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetFaqListQuery)
export class GetFaqListHandler implements IQueryHandler<GetFaqListQuery> {
  constructor(
    @InjectRepository(Faq) private faqRepository: Repository<Faq>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * FAQ 전체 리스트 조회 및 검색어 조회 메소드
   * @param query : FAQ 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            카테고리, 검색어가 모두 없을 경우, 조회 성공 시 FAQ 전체 리스트 반환 /
   *            카테고리, 검색어가 모두 있을 경우, 조회 성공 시 카테고리 내에서 검색어에 포함되는 FAQ 리스트 반환 /
   *            카테고리가 없고 검색어만 있을 경우, 조회 성공 시 검색어에 포함되는 FAQ 리스트 반환 /
   *            카테고리만 있고 검색어가 없을 경우, 조회 성공 시 카테고리에 대한 FAQ 리스트 반환
   */
  async execute(query: GetFaqListQuery) {
    const { param } = query;

    const faq = await this.faqRepository
      .createQueryBuilder('faq')
      .leftJoinAndSelect('faq.board', 'board')
      .leftJoinAndSelect('faq.category', 'category')
      .orderBy('category.isUse', 'DESC')
      .addOrderBy('faq.faqId', 'DESC');

    // if (param.role !== '본사 관리자' && '회원사 관리자') {
    //   faq.where('category.isUse = :isUse', { isUse: true });
    // }

    if (param.searchKey) {
      faq.andWhere('category.categoryName like :categoryName', {
        categoryName: `%${param.searchKey}%`,
      });
    }

    if (param.searchWord) {
      faq.andWhere('board.title like :title', { title: `%${param.searchWord}%` });
    }

    let tempQuery = faq;

    if (!param.totalData) {
      tempQuery = tempQuery.take(param.getLimit()).skip(param.getOffset());
    }

    const list = await tempQuery.getMany();
    const total = await tempQuery.getCount();
    const pageNo = param.totalData ? 1 : param.pageNo;
    const pageSize = param.totalData ? total : param.pageSize;

    if (total === 0) {
      return this.convertException.notFoundError('FAQ', 404);
    }

    return new Page(pageNo, pageSize, total, list);
  }
}
