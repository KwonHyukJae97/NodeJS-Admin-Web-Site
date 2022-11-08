import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from './command/create-comment.command';
import { GetCommentListQuery } from './query/get-comment-list.query';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateCommentCommand } from './command/update-comment.command';
import { GetCommentDetailCommand } from './command/get-comment-detail.command';
import { GetCommentInfoDto } from './dto/get-comment-info.dto';
import { Account } from '../../account/entities/account';
import { GetUser } from '../../account/decorator/account.decorator';
import { JwtAuthGuard } from '../../../guard/jwt/jwt-auth.guard';

/**
 * 답변 API controller
 */
@Controller('comment')
export class CommentController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 답변 등록
   * @param : qna_id
   * @returns : 답변 등록 커맨드 전송
   */
  @Post(':id')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('id') qnaId: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() account: Account,
  ) {
    const { comment } = createCommentDto;
    const command = new CreateCommentCommand(qnaId, comment, account);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 전체 & 검색 결과 리스트 조회
   * @query : writer
   * @query : commenter
   * @query : regDate
   * @returns : 답변 리스트 조회 쿼리 전송
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllComment(
    @Body() getCommentInfoDto: GetCommentInfoDto,
    @GetUser() account: Account,
    @Query('writer') writer: string,
    @Query('commenter') commenter: number,
    @Query('regDate') regDate: string,
  ) {
    const { role } = getCommentInfoDto;
    const getCommentListQuery = new GetCommentListQuery(role, account, writer, commenter, regDate);
    return this.queryBus.execute(getCommentListQuery);
  }

  /**
   * 답변 상세 정보 조회
   * @param : qna_id
   * @returns : 답변 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCommentDetail(@Param('id') qnaId: number, @Body() getCommentInfoDto: GetCommentInfoDto) {
    const { role } = getCommentInfoDto;
    const command = new GetCommentDetailCommand(qnaId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 답변 상세 정보 수정
   * @param : comment_id
   * @returns : 답변 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() account: Account,
  ) {
    const { comment } = updateCommentDto;
    const command = new UpdateCommentCommand(commentId, comment, account);
    return this.commandBus.execute(command);
  }
}
