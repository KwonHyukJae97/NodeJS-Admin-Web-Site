import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../entities/notice';
import { Repository } from 'typeorm';
import { BadRequestException, Inject } from '@nestjs/common';
import { GetNoticeListQuery } from './get-notice-list.query';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Page } from '../../../../common/utils/page';

/**
 * 공지사항 전체 & 검색어에 해당하는 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetNoticeListQuery)
export class GetNoticeListHandler implements IQueryHandler<GetNoticeListQuery> {
  constructor(
    @InjectRepository(Notice) private noticeRepository: Repository<Notice>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 공지사항 전체 리스트 조회 및 검색어 조회 메소드
   * @param query : 공지사항 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 /
   *            검색어가 없을 경우, 조회 성공 시 공지사항 전체 리스트 반환 /
   *            검색어가 있을 경우, 조회 성공 시 검색어에 포함되는 공지사항 리스트 반환
   */
  async execute(query: GetNoticeListQuery) {
    // const { role, noticeGrant, searchWord, page } = query;
    const { param } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // 본사 관리자만 조회 권한이 있을 경우
    if (param.noticeGrant === '0') {
      if (param.role !== '본사 관리자') {
        throw new BadRequestException('본사 관리자만 접근 가능합니다.');
      }
      // 본사 및 회원사 관리자만 조회 권한이 있을 경우
    } else if (param.noticeGrant === '0|1') {
      if (param.role !== '본사 관리자' && param.role !== '회원사 관리자') {
        throw new BadRequestException('본사 또는 회원사 관리자만 접근 가능합니다.');
      }
    }

    const notice = await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.board', 'board')
      .where('notice.noticeGrant = :noticeGrant', { noticeGrant: param.noticeGrant })
      .orderBy('notice.noticeId', 'DESC');

    // 검색 키워드가 있을 경우
    if (param.searchWord) {
      notice.andWhere('board.title like :title', { title: `%${param.searchWord}%` });
    }

    // 전체 데이터 조회일 경우
    if (param.totalData) {
      const list = await notice.getMany();
      const total = await notice.getCount();

      if (total === 0) {
        return this.convertException.notFoundError('해당 키워드에 대한 공지사항', 404);
      }

      return new Page(1, 1, total, list);
    } else {
      const list = await notice.take(param.getLimit()).skip(param.getOffset()).getMany();
      const total = await notice.getCount();

      if (total === 0) {
        return this.convertException.notFoundError('해당 키워드에 대한 공지사항', 404);
      }

      return new Page(param.pageNo, param.pageSize, total, list);
    }

    // 검색 키워드가 있을 경우
    // if (keyword) {
    //   const notice = await this.noticeRepository
    //     .createQueryBuilder('notice')
    //     .leftJoinAndSelect('notice.board', 'board')
    //     .where('notice.noticeGrant = :noticeGrant', { noticeGrant: noticeGrant })
    //     .andWhere('board.title like :title', { title: `%${keyword}%` })
    //     .orderBy('notice.noticeId', 'DESC')
    //     .getMany();
    //
    //   if (!notice || notice.length === 0) {
    //     return this.convertException.notFoundError('해당 키워드에 대한 공지사항', 404);
    //   }
    //
    //   return notice;
    //
    //   // 검색 키워드가 없을 경우
    // } else {
    //   const notice = await this.noticeRepository
    //     .createQueryBuilder('notice')
    //     .leftJoinAndSelect('notice.board', 'board')
    //     .where('notice.noticeGrant = :noticeGrant', { noticeGrant: noticeGrant })
    //     .orderBy({ 'notice.noticeId': 'DESC' })
    //     .getMany();
    //
    //   if (notice.length === 0) {
    //     return this.convertException.notFoundError('공지사항', 404);
    //   }
    //
    //   return notice;
    // }
  }
}
