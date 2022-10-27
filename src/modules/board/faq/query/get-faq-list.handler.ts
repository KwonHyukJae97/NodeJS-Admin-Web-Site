import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { GetFaqListQuery } from './get-faq-list.query';
import { Inject } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';

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
    const { categoryName, keyword, role } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      // FAQ 전체에서 키워드 검색
      if (!categoryName && keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('board.title like :title', { title: `%${keyword}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // 해당 카테고리 내에서 키워드 검색
      else if (categoryName && keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('board.title like :title', { title: `%${keyword}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // 해당 카테고리 내에서 FAQ 전체 조회
      else if (categoryName && !keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // FAQ 전체 조회
      else {
        const faq = await this.faqRepository.find({
          order: { faqId: 'DESC' },
        });

        if (!faq) {
          return this.convertException.notFoundError('FAQ', 404);
        }

        return faq;
      }

      // role = 일반 사용자 && 회원사 관리자일 경우 isUse: true 인 데이터만 조회
    } else {
      // FAQ 전체에서 키워드 검색
      if (!categoryName && keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('board.title like :title', { title: `%${keyword}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // 해당 카테고리 내에서 키워드 검색
      else if (categoryName && keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('board.title like :title', { title: `%${keyword}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // 해당 카테고리 내에서 FAQ 전체 조회
      else if (categoryName && !keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.board', 'board')
          .leftJoinAndSelect('faq.category', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          return this.convertException.notFoundError('해당 키워드에 대한 FAQ', 404);
        }

        return faq;
      }

      // FAQ 전체 조회
      else {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.category', 'categoryId')
          .leftJoinAndSelect('faq.board', 'board')
          .where('categoryId.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq) {
          return this.convertException.notFoundError('FAQ', 404);
        }

        return faq;
      }
    }
  }
}
