import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateNoticeDto } from "./dto/create-notice.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateNoticeCommand } from "./command/create-notice.command";
import { GetNoticeInfoQuery } from "./query/get-notice-info.query";

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
}
