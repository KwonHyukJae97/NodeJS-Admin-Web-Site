import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommand } from './update-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Board } from '../../entities/board';
import { ConvertException } from '../../../../common/utils/convert-exception';

/**
 * 답변 정보 수정용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentHandler implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  /**
   * 답변 정보 수정 메소드
   * @param command : 답변 정보 수정에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 수정 성공 시 답변 정보 반환
   */
  async execute(command: UpdateCommentCommand) {
    const { commentId, comment, adminId } = command;

    // TODO : 권한 정보 데코레이터 적용시 확인 후, 삭제 예정
    // 본사 관리자만 접근 가능
    // const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    //
    // if ( !admin ) {
    //   throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    // }

    const commentDetail = await this.commentRepository.findOneBy({ commentId: commentId });

    if (!commentDetail) {
      return this.convertException.notFoundError('답변', 404);
    }

    // TODO : 유저 정보 데코레이터 적용시 확인 후, 삭제 예정
    if (adminId !== commentDetail.adminId) {
      throw new BadRequestException('작성자만 수정이 가능합니다.');
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
