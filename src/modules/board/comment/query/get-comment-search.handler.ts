import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Like, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetCommentSearchQuery } from './get-comment-search.query';

/**
 * 답변 검색어 조회 시, 쿼리를 구현하는 쿼리 핸들러
 */

@QueryHandler(GetCommentSearchQuery)
export class GetCommentSearchHandler implements IQueryHandler<GetCommentSearchQuery> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async execute(query: GetCommentSearchQuery) {
    const { keyword } = query;

    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.boardId', 'board')
      .where('board.title like :title', { title: `%${keyword}%` })
      .getMany();

    if (!comment || comment.length === 0) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    // 문의 내역 리스트 반환
    return comment;
  }
}
