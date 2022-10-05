import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetFaqSearchQuery } from './get-faq-search.query';

/**
 * FAQ 카테고리별 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqSearchQuery)
export class GetFaqSearchHandler implements IQueryHandler<GetFaqSearchQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async execute(query: GetFaqSearchQuery) {
    const { categoryName, keyword, role } = query;

    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      // 카테고리가 없을 경우, 전체 게시글에서 검색
      if (!categoryName) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('board.title like :title', { title: `%${keyword}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }

        return faq;

        // 카테고리가 있을 경우, 카테고리 내에서 검색
      } else {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('board.title like :title', { title: `%${keyword}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }

        return faq;
      }

      // role = 일반 사용자 && 회원사 관리자일 경우 isUse: true 인 데이터만 조회
    } else {
      // 카테고리가 없을 경우, 전체 게시글에서 검색
      if (!categoryName) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('board.title like :title', { title: `%${keyword}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }

        return faq;

        // 카테고리가 있을 경우, 카테고리 내에서 검색
      } else {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('board.title like :title', { title: `%${keyword}%` })
          .andWhere('category.isUse like :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }
        // FAQ 리스트 반환
        return faq;
      }
    }
  }
}
