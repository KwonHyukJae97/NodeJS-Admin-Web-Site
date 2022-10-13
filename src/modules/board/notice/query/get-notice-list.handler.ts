import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetNoticeListQuery } from './get-notice-list.query';

/**
 * 공지사항 목록/검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetNoticeListQuery)
export class GetNoticeListHandler implements IQueryHandler<GetNoticeListQuery> {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async execute(query: GetNoticeListQuery) {
    const { keyword, role, noticeGrant } = query;

    // 본사 관리자만 조회 권한이 있을 경우
    if (noticeGrant === '0') {
      if (role !== '본사 관리자') {
        throw new BadRequestException('본사 관리자만 접근 가능합니다.');
      }
      // 본사 및 회원사 관리자만 조회 권한이 있을 경우
    } else if (noticeGrant === '0|1') {
      if (role !== '본사 관리자' && role !== '회원사 관리자') {
        throw new BadRequestException('본사 또는 회원사 관리자만 접근 가능합니다.');
      }
    }

    // 검색 키워드가 있을 경우
    if (keyword) {
      const notice = await this.noticeRepository
        .createQueryBuilder('notice')
        .leftJoinAndSelect('notice.boardId', 'board')
        .where('notice.noticeGrant = :noticeGrant', { noticeGrant: noticeGrant })
        .andWhere('board.title like :title', { title: `%${keyword}%` })
        .orderBy('notice.noticeId', 'DESC')
        .getMany();

      if (!notice || notice.length === 0) {
        throw new NotFoundException('검색 결과가 없습니다.');
      }
      // 공지사항 리스트 반환
      return notice;

      // 검색 키워드가 없을 경우
    } else {
      const notice = await this.noticeRepository
        .createQueryBuilder('notice')
        .leftJoinAndSelect('notice.boardId', 'board')
        .where('notice.noticeGrant = :noticeGrant', { noticeGrant: noticeGrant })
        .orderBy({ 'notice.noticeId': 'DESC' })
        .getMany();

      if (notice.length === 0) {
        throw new NotFoundException('작성된 공지사항이 없습니다.');
      }
      // 공지사항 리스트 반환
      return notice;
    }
  }
}
