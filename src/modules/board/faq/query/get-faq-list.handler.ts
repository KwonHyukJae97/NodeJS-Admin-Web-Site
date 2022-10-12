import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from '../entities/faq';
import { Repository } from 'typeorm';
import { GetFaqLisQuery } from './get-faq-lis.query';
import { NotFoundException } from '@nestjs/common';

/**
 * FAQ 목록/카테고리별 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetFaqLisQuery)
export class GetFaqListHandler implements IQueryHandler<GetFaqLisQuery> {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async execute(query: GetFaqLisQuery) {
    const { categoryName, keyword, role } = query;

    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      // FAQ 전체에서 키워드 검색
      if (!categoryName && keyword) {
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
        // FAQ 전체 조회
        return faq;
      }

      // 해당 카테고리 내에서 키워드 검색
      else if (categoryName && keyword) {
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
        // FAQ 전체 조회
        return faq;
      }

      // 해당 카테고리 내에서 FAQ 전체 조회
      else if (categoryName && !keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }
        // FAQ 리스트 반환
        return faq;
      }

      // FAQ 전체 조회
      else {
        const faq = await this.faqRepository.find({
          order: { faqId: 'DESC' },
        });

        if (!faq) {
          throw new NotFoundException('작성된 게시글이 없습니다.');
        }
        // FAQ 리스트 반환
        return faq;
      }

      // role = 일반 사용자 && 회원사 관리자일 경우 isUse: true 인 데이터만 조회
    } else {
      // FAQ 전체에서 키워드 검색
      if (!categoryName && keyword) {
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
        // FAQ 전체 조회
        return faq;
      }

      // 해당 카테고리 내에서 키워드 검색
      else if (categoryName && keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('board.title like :title', { title: `%${keyword}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }
        // FAQ 전체 조회
        return faq;
      }

      // 해당 카테고리 내에서 FAQ 전체 조회
      else if (categoryName && !keyword) {
        const faq = await this.faqRepository
          .createQueryBuilder('faq')
          .leftJoinAndSelect('faq.boardId', 'board')
          .leftJoinAndSelect('faq.categoryId', 'category')
          .where('category.categoryName like :categoryName', { categoryName: `%${categoryName}%` })
          .andWhere('category.isUse = :isUse', { isUse: true })
          .orderBy({ 'faq.faqId': 'DESC' })
          .getMany();

        if (!faq || faq.length === 0) {
          throw new NotFoundException('검색 결과가 없습니다.');
        }
        // FAQ 리스트 반환
        return faq;
      }

      // FAQ 전체 조회
      else {
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
        // FAQ 리스트 반환
        return faq;
      }
    }
  }
}
