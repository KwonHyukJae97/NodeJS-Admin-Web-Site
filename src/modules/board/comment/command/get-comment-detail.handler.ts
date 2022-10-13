import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCommentDetailCommand } from './get-comment-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { Qna } from '../../qna/entities/qna';
import { BoardFile } from '../../../file/entities/board_file';

/**
 * 답변 상세조회 시, 커맨드를 처리하는 커맨드 핸들러 (서비스 로직 수행)
 */

@Injectable()
@CommandHandler(GetCommentDetailCommand)
export class GetCommentDetailHandler implements ICommandHandler<GetCommentDetailCommand> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Qna)
    private qnaRepository: Repository<Qna>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardFile)
    private fileRepository: Repository<BoardFile>,
  ) {}

  async execute(command: GetCommentDetailCommand) {
    const { qnaId, role } = command;

    if (role !== '본사 관리자' && role !== '회원사 관리자') {
      throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    }

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('작성된 문의 내역이 없습니다.');
    }

    const board = await this.boardRepository.findOneBy({ boardId: qna.boardId.boardId });

    board.viewCount++;

    try {
      await this.boardRepository.save(board);
    } catch (err) {
      console.log(err);
    }

    qna.boardId = board;

    try {
      await this.qnaRepository.save(qna);
    } catch (err) {
      console.log(err);
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
