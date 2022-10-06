import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentInfoQuery } from './get-comment-info.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Qna } from '../../qna/entities/qna';

/**
 * 답변 전체 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetCommentInfoQuery)
export class GetCommentInfoHandler implements IQueryHandler<GetCommentInfoQuery> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,
  ) {}

  async execute(query: GetCommentInfoQuery) {
    const { role } = query;

    if (role !== '본사 관리자') {
      throw new BadRequestException('본사 관리자만 접근 가능합니다.');
    }

    const qna = await this.qnaRepository.find({
      order: { qnaId: 'DESC' },
    });

    if (!qna || qna.length === 0) {
      throw new NotFoundException('작성된 문의 내역이 없습니다.');
    }

    let isComment;

    const qnaAdminList = await Promise.all(
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
    return qnaAdminList;
  }
}
