import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { NoticeService } from "./notice.service";
import { CreateNoticeDto } from "./dto/create-notice.dto";

/**
 * 공지사항 관련 API 처리하는 컨트롤러
 */

@Controller('notice')
export class NoticeController {
  constructor(private noticeService: NoticeService) {}

  /**
   * 공지사항 등록 API
   */
  @Post()
  @UsePipes(ValidationPipe)
  createNotice(@Body() createNoticeDto: CreateNoticeDto): Promise<string> {
    return this.noticeService.createNotice(createNoticeDto);
  }

  /**
   * 공지사항 목록 조회 API
   */
  @Get()
  getAllNotice() {
    return this.noticeService.getAllNotices();
  }
}
