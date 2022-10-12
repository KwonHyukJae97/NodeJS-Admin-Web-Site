import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQnaListQuery } from './get-qna-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * 1:1 문의 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetQnaListQuery)
export class GetQnaListHandler implements IQueryHandler<GetQnaListQuery> {
  constructor(
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,
  ) {}

  async execute(query: GetQnaListQuery) {
    const { role, accountId } = query;

    // role = 본사 관리자일 경우 전체 데이터 조회
    if (role === '본사 관리자') {
      const qna = await this.qnaRepository.find({
        order: { qnaId: 'DESC' },
      });

      if (qna.length === 0) {
        throw new NotFoundException('작성된 문의 내역이 없습니다.');
      }

      // 문의 내역 리스트 반환
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
        throw new NotFoundException('작성된 문의 내역이 없습니다.');
      }

      // 문의 내역 리스트 반환
      return qna;
    }
  }
}
