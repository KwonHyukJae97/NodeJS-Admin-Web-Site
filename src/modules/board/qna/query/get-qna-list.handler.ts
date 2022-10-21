import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaListQuery } from './get-qna-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Inject, NotFoundException } from '@nestjs/common';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 1:1 문의 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetQnaListQuery)
export class GetQnaListHandler implements IQueryHandler<GetQnaListQuery> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 1:1 문의 전체 리스트 조회 메소드
   * @param query : 1:1 문의 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 전체 리스트 반환
   */
  async execute(query: GetQnaListQuery) {
    const { role, accountId } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      const qna = await this.qnaRepository.find({
        order: { qnaId: 'DESC' },
      });

      if (qna.length === 0) {
        return this.convertException.notFoundError('QnA', 404);
      }

      return qna;

      // role = 일반 사용자 && 회원사 관리자일 경우 본인 데이터만 조회
    } else {
      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .leftJoinAndSelect('qna.boardId', 'board')
        .where('board.accountId like :accountId', { accountId: `%${accountId}%` })
        .orderBy('qna.qnaId', 'DESC')
        .getMany();

      if (qna.length === 0) {
        return this.convertException.notFoundError('QnA', 404);
      }

      return qna;
    }
  }
}
