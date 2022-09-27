import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateNoticeCommand } from "./command/create-notice.command";
import { GetNoticeInfoQuery } from "./query/get-notice-info.query";
import { Notice } from "./entities/notice";
import { GetNoticeDetailQuery } from "./query/get-notice-detail.query";
import { UpdateNoticeDto } from "./dto/update-notice.dto";
import { UpdateNoticeCommand } from "./command/update-notice.command";
import { DeleteNoticeCommand } from "./command/delete-notice.command";

/**
 * 공지사항 관련 API 처리하는 컨트롤러
 */

@Controller('notice')
export class NoticeController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 공지사항 등록
   */
  @Post()
  @UsePipes(ValidationPipe)
  createNotice(@Body() createNoticeDto: CreateNoticeDto): Promise<string> {
    const { title, content, isTop, noticeGrant } = createNoticeDto;
    const command = new CreateNoticeCommand(title, content, isTop, noticeGrant);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 리스트 조회
   */
  @Get()
  async getAllNotice() {
    const getNoticeInfoQuery = new GetNoticeInfoQuery();
    return this.queryBus.execute(getNoticeInfoQuery);
  }

  /**
   * 공지사항 상세 조회
   * @ param : notice_id
   */
  @Get(':id')
  async getNoticeDetail(@Param('id') noticeId: number): Promise<Notice> {
    const getNoticeDetailQuery = new GetNoticeDetailQuery(noticeId);
    return this.queryBus.execute(getNoticeDetailQuery);
  }

  /**
   * 공지사항 수정
   * @ param : notice_id
   */
  @Patch(':id')
  async updateNotice(
    @Param('id') noticeId: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
  ): Promise<Notice> {
    const { title, content, isTop, noticeGrant } = updateNoticeDto;
    const command = new UpdateNoticeCommand(title, content, isTop, noticeGrant, noticeId);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 삭제
   * @ param : notice_id
   */
  @Delete(':id')
  async deleteNotice(@Param('id') noticeId: number): Promise<string> {
    const command = new DeleteNoticeCommand(noticeId);
    return this.commandBus.execute(command);
  }
}
