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

    const files = await this.fileRepository.findBy({ boardId: board.boardId });

    const commentList = await this.commentRepository.find({
      where: { qnaId: qnaId },
      order: { commentId: 'DESC' },
    });

    const getCommentDetailDto = {
      qna,
      fileList: files,
      commentList,
    };

    return getCommentDetailDto;
  }
}
