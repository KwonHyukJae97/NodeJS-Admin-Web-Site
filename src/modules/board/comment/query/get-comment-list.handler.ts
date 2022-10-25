import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentListQuery } from './get-comment-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { Qna } from '../../qna/entities/qna';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 답변 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetCommentListQuery)
export class GetCommentListHandler implements IQueryHandler<GetCommentListQuery> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 전체 리스트 조회 메소드
   * @param query : 답변 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 전체 리스트 반환
   */
  async execute(query: GetCommentListQuery) {
    const { role } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const qna = await this.qnaRepository.find({
      order: { qnaId: 'DESC' },
    });

    if (qna.length === 0) {
      return this.convertException.notFoundError('QnA', 404);
    }

    let isComment;

    const qnaCommentList = await Promise.all(
      qna.map(async (x) => {
        // 각 문의 내역마다 반복문 돌려가면서 해당 답변 리스트 조회
        const commentList = await this.commentRepository.findBy({ qnaId: x.qnaId });
        // 문의내역의 답변 유무에 따른 true/false
        if (commentList.length === 0) {
          isComment = false;
        } else {
          isComment = true;
        }

        // list에 필요한 필드로 구성한 Dto 객체 생성
        const qnaCommentListDto = {
          qndId: x.qnaId,
          accountId: x.boardId.accountId,
          title: x.boardId.title,
          viewCount: x.boardId.viewCount,
          regDate: x.boardId.regDate,
          isComment,
        };

        return qnaCommentListDto;
      }),
    );

    return qnaCommentList;
  }
}
