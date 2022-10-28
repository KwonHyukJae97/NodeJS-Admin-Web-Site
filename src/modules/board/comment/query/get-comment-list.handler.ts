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
import { Account } from '../../../account/entities/account';
import { Company } from '../../../company/entities/company.entity';

/**
 * 답변 전체 리스트 조회용 쿼리 핸들러
 */
@QueryHandler(GetCommentListQuery)
export class GetCommentListHandler implements IQueryHandler<GetCommentListQuery> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 전체 리스트 조회 메소드
   * @param query : 답변 전체 조회 쿼리
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 전체 리스트 반환
   */
  async execute(query: GetCommentListQuery) {
    const { role, account, writer, commenter, regDate } = query;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // if (role !== '본사 관리자' && role !== '회원사 관리자') {
    //   throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    // }

    // TODO : 관리자 형태에 따른 문의내역 조회 기능 진행중
    // 본사 관리자일 경우, 문의내역 전체 조회(회원사/회원사에 속한 일반사용자/사용자)
    if (role === '본사 관리자') {
      // const qna = await this.qnaRepository.find({
      //   order: { qnaId: 'DESC' },
      // });

      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .leftJoinAndSelect('qna.board', 'board')
        .leftJoinAndSelect(Comment, 'comment', 'comment.qnaId = qna.qnaId')
        .where('board.regDate like :regDate', { regDate: `%${regDate}%` })
        .where('comment.adminId like :adminId', { adminId: `%${commenter}%` })
        .orderBy({ 'qna.qnaId': 'DESC' })
        .getMany();

      if (qna.length === 0) {
        return this.convertException.notFoundError('QnA', 404);
      }

      let isComment;

      const qnaCommentList = await Promise.all(
        qna.map(async (qna) => {
          // 각 문의 내역마다 반복문 돌려가면서 해당 답변 리스트 조회
          const commentList = await this.commentRepository.findBy({ qnaId: qna.qnaId });
          // 문의내역의 답변 유무에 따른 true/false
          if (commentList.length === 0) {
            isComment = false;
          } else {
            isComment = true;
          }

          const board = await this.boardRepository.findOneBy({ boardId: qna.boardId });

          if (!board) {
            return this.convertException.notFoundError('게시글', 404);
          }

          // list에 필요한 필드로 구성한 Dto 객체 생성
          const qnaCommentListDto = {
            qndId: qna.qnaId,
            accountId: board.accountId,
            title: board.title,
            viewCount: board.viewCount,
            regDate: board.regDate,
            isComment,
          };

          return qnaCommentListDto;
        }),
      );

      return qnaCommentList;
    }
    // 회원사 관리자일 경우, 해당 회원사에 대한 문의내역 조회(회원사에 속한 일반사용자)
    else if (role === '회원사 관리자') {
      const admin = await this.adminRepository.findOneBy({ accountId: account.accountId });
      const adminCompanyId = admin.companyId;

      // 작성자와 관리자 company_id가 동일한 문의 내역만 조회
      // 전체 문의에서 companyt_id로 검색?
      const qna = await this.qnaRepository
        .createQueryBuilder('qna')
        .leftJoinAndSelect('qna.board', 'board')
        .leftJoinAndSelect(User, 'user', 'user.accountId = board.accountId')
        .leftJoinAndSelect('user.userId', 'user_company')
        .where('user_company.companyId = :companyId', { companyId: admin.companyId })
        // .where('user.accountId = :accountId', { accountId: 37 })
        // .where('user.accountId = :accountId', { accountId: board.accountId})
        // .leftJoinAndSelect(User, 'user', 'user.accountId = board.accountId')
        // .leftJoinAndSelect('qna.accountId', 'account')
        // .leftJoinAndSelect('user.userId', 'user_company')
        // .where('user_company.companyId = :companyId', { companyId: companyId })
        .orderBy({ 'qna.qnaId': 'DESC' })
        .getMany();

      return qna;
    } else {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    // const qna = await this.qnaRepository.find({
    //   order: { qnaId: 'DESC' },
    // });
    //
    // if (qna.length === 0) {
    //   return this.convertException.notFoundError('QnA', 404);
    // }
    //
    // let isComment;
    //
    // const qnaCommentList = await Promise.all(
    //   qna.map(async (qna) => {
    //     // 각 문의 내역마다 반복문 돌려가면서 해당 답변 리스트 조회
    //     const commentList = await this.commentRepository.findBy({ qnaId: qna.qnaId });
    //
    //     // 문의내역의 답변 유무에 따른 true/false
    //     if (commentList.length === 0) {
    //       isComment = false;
    //     } else {
    //       isComment = true;
    //     }
    //
    //     const board = await this.boardRepository.findOneBy({ boardId: qna.boardId });
    //
    //     if (!board) {
    //       return this.convertException.notFoundError('게시글', 404);
    //     }
    //
    //     // list에 필요한 필드로 구성한 Dto 객체 생성
    //     const qnaCommentListDto = {
    //       qndId: qna.qnaId,
    //       accountId: board.accountId,
    //       title: board.title,
    //       viewCount: board.viewCount,
    //       regDate: board.regDate,
    //       isComment,
    //     };
    //
    //     return qnaCommentListDto;
    //   }),
    // );
    //
    // return qnaCommentList;
  }
}
