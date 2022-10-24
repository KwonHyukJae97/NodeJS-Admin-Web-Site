import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCommentDetailCommand } from './get-comment-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { Qna } from '../../qna/entities/qna';
import { BoardFile } from '../../../file/entities/board-file';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account';
import { Admin } from '../../../account/admin/entities/admin';
import { Company } from '../../../company/entities/company.entity';

/**
 * 답변 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetCommentDetailCommand)
export class GetCommentDetailHandler implements ICommandHandler<GetCommentDetailCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 상세 정보 조회 메소드
   * @param command : 답변 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 답변 상세 정보 반환
   */
  async execute(command: GetCommentDetailCommand) {
    const { qnaId, role } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });

    if (!board) {
      return this.convertException.notFoundError('게시글', 404);
    }

    // 문의 내역 상세 조회할 때마다 조회수 반영
    /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    board.viewCount++;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      return this.convertException.badRequestError('게시글 정보에', 400);
    }

    qna.boardId = board;

    try {
      await this.qnaRepository.save(qna);
    } catch (err) {
      return this.convertException.badRequestError('QnA 정보에', 400);
    }

    const account = await this.accountRepository.findOneBy({ accountId: board.accountId });

    if (!account) {
      return this.convertException.badRequestAccountError('작성자', 400);
    }

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const commentList = await this.commentRepository.find({
      where: { qnaId: qnaId },
      order: { commentId: 'DESC' },
    });

    let commentInfo;

    // 답변별 답변자 정보 담아주기
    const commentListInfo = await Promise.all(
      commentList.map(async (comment) => {
        // TODO: 본사 관리자 기준으로 작성자 정보 넣어주는 테스트용 코드 > 회원사 정보 테이블 연결 시, 확인 후 삭제 예정
        const admin = await this.adminRepository.findOneBy({ adminId: comment.adminId });

        // @ts-ignore
        const accountAdmin = await this.accountRepository.findOneBy({
          accountId: admin.accountId.accountId,
        });

        commentInfo = {
          comment: comment,
          writer: accountAdmin.name + '(' + accountAdmin.nickname + ')',
        };

        return commentInfo;

        // TODO: 회원사 정보 테이블 연결 시, 확인 후 사용 예정
        // @ts-ignore
        // const admin = await this.adminRepository.findOneBy({ accountId: account.accountId });

        // 회원사 관리자일 경우
        // if (admin.companyId) {
        //   const company = await this.companyRepository.findOneBy({ companyId: admin.companyId });
        //
        //   commentInfo = {
        //     comment: comment,
        //     writer: account.name + '(' + account.nickname + ')',
        //     companyName: company.companyName,
        //     companyId: company.companyId
        //   };
        //
        // 본사 관리자일 경우
        // } else {
        //   commentInfo = {
        //     comment: comment,
        //     writer: account.name + '(' + account.nickname + ')',
        //   };
        // }
        // return commentInfo;
      }),
    );

    const getCommentDetailDto = {
      qna,
      writer: account.name + '(' + account.nickname + ')',
      fileList: files,
      commentListInfo,
    };

    return getCommentDetailDto;
  }
}
