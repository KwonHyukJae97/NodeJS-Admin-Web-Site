import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './command/create-comment.command';
import { GetCommentListQuery } from './query/get-comment-list.query';
import { Comment } from './entities/comment';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateCommentCommand } from './command/update-comment.command';
import { GetCommentDetailDto } from './dto/get-comment-detail.dto';
import { GetCommentDetailCommand } from './command/get-comment-detail.command';
import { GetCommentInfoDto } from './dto/get-comment-info.dto';
import { GetCommentListDto } from './dto/get-comment-list.dto';

/**
 * 답변 API controller
 */
@Controller('comment')
export class CommentController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 답변 등록
   * @Param : qna_id
   * @Return : 답변 등록 커맨드 전송
   */
  @Post(':id')
  createComment(@Param('id') qnaId: number, @Body() createCommentDto: CreateCommentDto) {
    const { comment, adminId } = createCommentDto;
    const command = new CreateCommentCommand(qnaId, comment, adminId);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 전체 리스트 조회
   * @Return : 답변 리스트 조회 쿼리 전송
   */
  @Get()
  async getAllComment(@Body() getCommentInfoDto: GetCommentInfoDto) {
    const { role } = getCommentInfoDto;
    const getCommentListQuery = new GetCommentListQuery(role);
    return this.queryBus.execute(getCommentListQuery);
  }

  /**
   * 답변 상세 정보 조회
   * @Param : qna_id
   * @Return : 답변 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  async getCommentDetail(@Param('id') qnaId: number, @Body() getCommentInfoDto: GetCommentInfoDto) {
    const { role } = getCommentInfoDto;
    const command = new GetCommentDetailCommand(qnaId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 상세 정보 수정
   * @Param : comment_id
   * @Return : 답변 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  async updateComment(@Param('id') commentId: number, @Body() updateCommentDto: UpdateCommentDto) {
    const { comment, adminId } = updateCommentDto;
    const command = new UpdateCommentCommand(commentId, comment, adminId);
    return this.commandBus.execute(command);
  }
}
