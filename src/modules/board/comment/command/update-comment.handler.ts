import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './update-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';

/**
 * 답변 수정 시, 커맨드를 처리하는 커맨드 핸들러
 */

@Injectable()
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    private eventBus: EventBus,
  ) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, comment, adminId } = command;

    const commentDetail = await this.commentRepository.findOneBy({ commentId: commentId });

    if (!commentDetail) {
      throw new NotFoundException('존재하지 않는 답변 내역입니다.');
    }

    if (adminId !== commentDetail.adminId) {
      throw new BadRequestException('작성자만 수정이 가능합니다.');
    }

    commentDetail.comment = comment;

    try {
      await this.commentRepository.save(commentDetail);
    } catch (err) {
      console.log(err);
    }

    // 변경된 답변 반환
    return commentDetail;
  }
}
