import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './command/create-comment.command';
import { GetCommentInfoQuery } from './query/get-comment-info.query';
import { Comment } from './entities/comment';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateCommentCommand } from './command/update-comment.command';
import { GetCommentDetailDto } from './dto/get-comment-detail.dto';
import { GetCommentDetailCommand } from './command/get-comment-detail.command';
import { GetCommentSearchQuery } from './query/get-comment-search.query';
import { GetCommentInfoDto } from './dto/get-comment-info.dto';

/**
 * 답변 관련 API 처리하는 컨트롤러
 */

@Controller('comment')
export class CommentController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 답변 등록
   * @ param : qna_id
   */
  @Post(':id')
  createComment(
    @Param('id') qnaId: number,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<string> {
    const { comment, adminId } = createCommentDto;
    const command = new CreateCommentCommand(qnaId, comment, adminId);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 리스트 조회
   */
  @Get()
  async getAllComment(@Body() getCommentInfoDto: GetCommentInfoDto) {
    const { role } = getCommentInfoDto;
    const getCommentInfoQuery = new GetCommentInfoQuery(role);
    return this.queryBus.execute(getCommentInfoQuery);
  }

  /**
   * 답변 상세 조회
   * @ param : qna_id
   */
  @Get(':id')
  async getCommentDetail(
    @Param('id') qnaId: number,
    @Body() getCommentInfoDto: GetCommentInfoDto,
  ): Promise<GetCommentDetailDto> {
    const { role } = getCommentInfoDto;
    const command = new GetCommentDetailCommand(qnaId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 검색어 조회
   * @ query : keyword
   */
  @Get()
  async getCommentSearch(@Query('keyword') keyword: string) {
    const getCommentSearchQuery = new GetCommentSearchQuery(keyword);
    return this.queryBus.execute(getCommentSearchQuery);
  }

  /**
   * 답변 수정
   * @ param : comment_id
   */
  @Patch(':id')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const { comment, adminId } = updateCommentDto;
    const command = new UpdateCommentCommand(commentId, comment, adminId);
    return this.commandBus.execute(command);
  }
}
