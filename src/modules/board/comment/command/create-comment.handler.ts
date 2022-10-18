import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommand } from './create-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { Repository } from 'typeorm';
import { Qna } from '../../qna/entities/qna';

/**
 * 답변 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
  ) {}

  /**
   * 답변 등록 메소드
   * @param command : 답변 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 답변 정보 반환
   */
  async execute(command: CreateCommentCommand) {
    const { qnaId, comment, adminId } = command;

    // 본사 관리자만 접근 가능
    // const admin = await this.adminRepository.findOneBy({ adminId: adminId });
    //
    // if ( !admin ) {
    //   throw new BadRequestException('본사 및 회원사 관리자만 접근 가능합니다.');
    // }

    const qna = await this.qnaRepository.findOneBy({ qnaId: qnaId });

    if (!qna) {
      throw new NotFoundException('존재하지 않는 문의 내역입니다.');
    }

    const qnaComment = this.commentRepository.create({
      qnaId,
      comment,
      adminId,
    });

    try {
      await this.commentRepository.save(qnaComment);
    } catch (err) {
      console.log(err);
    }

    return qnaComment;
  }
}
