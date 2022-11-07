import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentListQuery } from './get-comment-list.query';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { BadRequestException, Inject } from '@nestjs/common';
import { Qna } from '../../qna/entities/qna';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Board } from '../../entities/board';
import { Admin } from '../../../account/admin/entities/admin';
import { User } from '../../../account/user/entities/user';
import { UserCompany } from '../../../account/user/entities/user-company';

/**
 * 답변 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetCommentListQuery)
export class GetCommentListHandler implements IQueryHandler<GetCommentListQuery> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 전체 리스트 조회 메소드
   * @param query : 답변 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 전체 리스트 반환
   */
  async execute(query: GetCommentListQuery) {
    const { role, account } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // if (role !== '본사 관리자' && role !== '회원사 관리자') {
    //   throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    // }

    // 하나의 qna에 대한 답변 여부를 판단하기 위한 서브 쿼리
    const commentQb = this.commentRepository
      .createQueryBuilder()
      .subQuery()
      .select(['comment.commentId AS commentId', 'comment.qnaId AS qnaId'])
      .from(Comment, 'comment')
      .groupBy('comment.qnaId')
      .getQuery();

    // 본사 관리자일 경우, 문의내역 전체 조회(회원사/회원사에 속한 일반사용자/일반 사용자)
    if (role === '본사 관리자') {
      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .leftJoin(Board, 'board', 'board.boardId = qna.boardId')
        .leftJoin(commentQb, 'comment', 'comment.qnaId = qna.qnaId')
        .select([
          'qna.qnaId AS qna_id',
          'board.accountId',
          'board.title',
          'board.viewCount',
          'board.regDate',
        ])
        .addSelect(['IF(comment.commentId IS NOT NULL, true, false) AS is_comment'])
        .where('board.delDate IS NULL')
        .orderBy({ 'qna.qnaId': 'DESC' })
        .getRawMany();

      if (qna.length === 0) {
        return this.convertException.notFoundError('QnA', 404);
      }

      return qna;
    }

    // 회원사 관리자일 경우, 해당 회원사에 대한 문의내역 조회(회원사에 속한 일반사용자)
    else if (role === '회원사 관리자') {
      const admin = await this.adminRepository.findOneBy({ accountId: account.accountId });

      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .leftJoin(Board, 'board', 'board.boardId = qna.boardId')
        .leftJoin(User, 'user', 'user.accountId = board.accountId')
        .leftJoin(UserCompany, 'user_company', 'user_company.userId = user.userId')
        .leftJoin(commentQb, 'comment', 'comment.qnaId = qna.qnaId')
        .select([
          'qna.qnaId AS qna_id',
          'board.accountId',
          'board.title',
          'board.viewCount',
          'board.regDate',
        ])
        .addSelect(['IF(comment.commentId IS NOT NULL, true, false) AS is_comment'])
        .where('board.delDate IS NULL')
        .andWhere('user_company.companyId = :companyId', { companyId: admin.companyId })
        .orderBy({ 'qna.qnaId': 'DESC' })
        .getRawMany();

      if (qna.length === 0) {
        return this.convertException.notFoundError('QnA', 404);
      }

      return qna;
    } else {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }
  }
}
