import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCommentDetailCommand } from './get-comment-detail.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { BoardFile } from '../../file/entities/board_file';
import { Qna } from '../../qna/entities/qna';

/**
 * 답변 상세조회 시, 커맨드를 처리하는 커맨드 핸들러 (서비스 로직 수행)
 */

@Injectable()
@CommandHandler(GetCommentDetailCommand)
export class GetCommentDetailHandler implements ICommandHandler<GetCommentDetailCommand> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async execute(command: GetCommentDetailCommand) {
    const { qnaId, role } = command;

    const comment = await this.commentRepository.findOneBy({ qnaId: qnaId });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    return comment;
  }
}
