import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './update-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Admin } from '../../../account/admin/entities/admin';

/**
 * 답변 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 정보 수정 메소드
   * @param command : 답변 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 답변 정보 반환
   */
  async execute(command: UpdateCommentCommand) {
    const { commentId, comment, account } = command;

    const commentDetail = await this.commentRepository.findOneBy({ commentId });

    if (!commentDetail) {
      return this.convertException.notFoundError('답변', 404);
    }

    const admin = await this.adminRepository.findOneBy({ adminId: commentDetail.adminId });

    if (!admin) {
      return this.convertException.notFoundError('관리자 계정', 404);
    }

    if (account.accountId != admin.accountId) {
      return this.convertException.badRequestAccountError('작성자', 400);
    }

    commentDetail.comment = comment;

    try {
      await this.commentRepository.save(commentDetail);
    } catch (err) {
      return this.convertException.badRequestError('답변 정보에', 400);
    }

    return commentDetail;
  }
}
