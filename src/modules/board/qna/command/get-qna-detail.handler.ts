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
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 1:1 문의 상세 정보 조회 메소드
   * @param command : 1:1 문의 상세 정보 조회 커맨드
   * @returns : DB처리 실패 시 에러 메시지 반환 / 조회 성공 시 1:1 문의 상세 정보 반환
   */
  async execute(command: GetQnaDetailCommand) {
    const { qnaId, role, accountId } = command;

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // role = 본사 관리자 이거나 qna 작성자가 본인일 경우에만 상세 조회
    if (role === '본사 관리자' || accountId == qna.boardId.accountId) {
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

      const comment = await this.commentRepository.find({
        where: { qnaId: qnaId },
        order: { commentId: 'DESC' },
      });

      const getQnaDetailDto = {
        qnaId: qnaId,
        boardId: board,
        fileList: files,
        commentList: comment,
      };

      return getQnaDetailDto;
    } else {
      throw new BadRequestException('본인 또는 해당 관리자만 조회 가능합니다.');
    }
  }
}
