import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommand } from './create-comment.command';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../entities/comment';
import { DataSource, Repository } from 'typeorm';
import { Qna } from '../../qna/entities/qna.entity';
import { ConvertException } from '../../../../common/utils/convert-exception';
import { Admin } from '../../../account/admin/entities/admin.entity';

/**
 * 답변 등록용 커맨드 핸들러
 */
@Injectable()
@CommandHandler(CreateCommentCommand)
export class CreateCommentHandler implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Qna) private qnaRepository: Repository<Qna>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  /**
   * 답변 등록 메소드
   * @param command : 답변 등록에 필요한 파라미터
   * @returns : DB처리 실패 시 에러 메시지 반환 / 등록 완료 시 답변 정보 반환
   */
  async execute(command: CreateCommentCommand) {
    const { qnaId, comment, account } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const qna = await this.qnaRepository.findOneBy({ qnaId });

    if (!qna) {
      return this.convertException.notFoundError('QnA', 404);
    }

    const admin = await this.adminRepository.findOneBy({ accountId: account.accountId });

    if (!admin) {
      return this.convertException.notFoundError('관리자', 404);
    }

    try {
      const qnaComment = queryRunner.manager.getRepository(Comment).create({
        qnaId,
        comment,
        adminId: admin.adminId,
      });

      await queryRunner.manager.getRepository(Comment).save(qnaComment);

      await queryRunner.commitTransaction();
      return qnaComment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('답변 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
