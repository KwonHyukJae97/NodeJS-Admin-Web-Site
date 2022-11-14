import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetQnaDetailCommand } from './get-qna-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Qna } from '../entities/qna';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../../file/entities/board-file';
import { Comment } from '../../comment/entities/comment';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Account } from '../../../account/entities/account';
import { Admin } from '../../../account/admin/entities/admin';
import { writer } from 'repl';

/**
 * 1:1 문의 상세 정보 조회용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(GetQnaDetailCommand)
export class GetQnaDetailHandler implements ICommandHandler<GetQnaDetailCommand> {
  constructor(
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(BoardFile) private fileRepository: Repository<BoardFile>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 1:1 문의 상세 정보 조회 메소드
   * @param command : 1:1 문의 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 상세 정보 반환
   */
  async execute(command: GetQnaDetailCommand) {
    const { qnaId } = command;

    // qna 정보 - board 정보 - comment 정보
    // qna 작성자 - comment 작성자
    // board 조회수 업데이트

    const qna = await this.qnaRepository
      .createQueryBuilder('qna')
      .where('qna.qnaId = :qnaId', { qnaId: qnaId })
      .leftJoinAndSelect('qna.board', 'board')
      .leftJoin(Comment, 'comment', 'comment.qnaId = qna.qnaId')
      // .leftJoin(Account, 'account', 'account.accountId = board.accountId')
      .select([
        'qna.qnaId AS qnaId',
        'qna.boardId AS boardId',
        'board.accountId AS accountId',
        'board.boardTypeCode AS boardTypeCode',
        'board.title AS title',
        'board.content AS content',
        'board.viewCount AS viewCount',
        'board.regDate AS regDate',
      ])
      .addSelect(['IF(comment.commentId IS NOT NULL, true, false) AS is_comment'])
      .getRawOne();

    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.qnaId = :qnaId', { qnaId: qnaId })
      .orderBy({ 'comment.commentId': 'DESC' })
      .getMany();

    // 문의 작성자 정보 조회
    const qnaAccount = await this.accountRepository.findOneBy({ accountId: qna.accountId });
    const qnaWriter = qnaAccount.name + '(' + qnaAccount.nickname + ')';

    const commentResult = comment.map(async (c) => {
      // 답변 작성자 정보 조회
      const commentAccount = await this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect(Admin, 'admin', 'admin.adminId = comment.adminId')
        .leftJoinAndSelect(Account, 'account', 'account.accountId = admin.accountId')
        .select(['account.name AS name', 'account.nickname AS nickname'])
        .getRawOne();

      const commentWriter =
        (await commentAccount.name) + '(' + (await commentAccount.nickname) + ')';

      return { ...c, writer: commentWriter };
    });

    // TODO: pending 해결 예정
    console.log('result', commentResult);

    const qnaDetail = {
      qna: { ...qna, writer: qnaWriter },
      comment: commentResult,
    };

    return qnaDetail;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // role = 본사 관리자 이거나 qna 작성자가 본인일 경우에만 상세 조회 (account.accountId == board.accountId)
    // if (role === '본사 관리자') {
    //   // 문의 내역 상세 조회할 때마다 조회수 반영
    //   /* 데이터 수정 및 새로고침 등의 경우, 무한대로 조회수가 증가할 수 있는 문제점은 추후 보완 예정 */
    //   board.viewCount++;
    //
    //   try {
    //     await this.boardRepository.save(board);
    //   } catch (err) {
    //     return this.convertException.badRequestError('게시글 정보에', 400);
    //   }
    //
    //   qna.board = board;
    //
    //   try {
    //     await this.qnaRepository.save(qna);
    //   } catch (err) {
    //     return this.convertException.badRequestError('QnA 정보에', 400);
    //   }
    //
    //   const qnaAccount = await this.accountRepository.findOneBy({ accountId: board.accountId });
    //
    //   if (!qnaAccount) {
    //     return this.convertException.notFoundError('작성자', 404);
    //   }
    //
    //   const files = await this.fileRepository.findBy({ boardId: board.boardId });
    //
    //   const comment = await this.commentRepository.find({
    //     where: { qnaId: qnaId },
    //     order: { commentId: 'DESC' },
    //   });
    //
    //   let commentInfo;
    //
    //   // 답변별 답변자 정보 담아주기
    //   const commentListInfo = await Promise.all(
    //     comment.map(async (comment) => {
    //       // TODO: 본사 관리자 기준으로 작성자 정보 넣어주는 테스트용 코드 > 회원사 정보 테이블 연결 시, 확인 후 삭제 예정
    //       const admin = await this.adminRepository.findOneBy({ adminId: comment.adminId });
    //
    //       const accountAdmin = await this.accountRepository.findOneBy({
    //         accountId: admin.accountId,
    //       });
    //
    //       commentInfo = {
    //         comment: comment,
    //         writer: accountAdmin.name + '(' + accountAdmin.nickname + ')',
    //       };
    //
    //       return commentInfo;
    //
    //       // TODO: 회원사 정보 테이블 연결 시, 확인 후 사용 예정
    //       // @ts-ignore
    //       // const admin = await this.adminRepository.findOneBy({ accountId: account.accountId });
    //
    //       // 회원사 관리자일 경우
    //       // if (admin.companyId) {
    //       //   const company = await this.companyRepository.findOneBy({ companyId: admin.companyId });
    //       //
    //       //   commentInfo = {
    //       //     comment: comment,
    //       //     writer: account.name + '(' + account.nickname + ')',
    //       //     companyName: company.companyName,
    //       //     companyId: company.companyId
    //       //   };
    //       //
    //       // 본사 관리자일 경우
    //       // } else {
    //       //   commentInfo = {
    //       //     comment: comment,
    //       //     writer: account.name + '(' + account.nickname + ')',
    //       //   };
    //       // }
    //       // return commentInfo;
    //     }),
    //   );
    //
    //   const getQnaDetailDto = {
    //     qna,
    //     writer: qnaAccount.name + '(' + qnaAccount.nickname + ')',
    //     fileList: files,
    //     commentListInfo,
    //   };
    //
    //   return getQnaDetailDto;
    // } else {
    //   throw new BadRequestException('본인 또는 해당 관리자만 조회 가능합니다.');
    // }
  }
}
