import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './command/create-notice.command';
import { GetNoticeInfoQuery } from './query/get-notice-info.query';
import { Notice } from './entities/notice';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { UpdateNoticeCommand } from './command/update-notice.command';
import { DeleteNoticeCommand } from './command/delete-notice.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetNoticeDetailDto } from './dto/get-notice-detail.dto';
import { GetNoticeDetailCommand } from './command/get-notice-detail.command';
import { GetNoticeSearchQuery } from './query/get-notice-search.query';

/**
 * 공지사항 관련 API 처리하는 컨트롤러
 */

@Controller('notice')
export class NoticeController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 공지사항 등록
   */
  @Post(':type')
  @UsePipes(ValidationPipe)
  @UseInterceptors(FilesInterceptor('files'))
  createNotice(
    @Body() createNoticeDto: CreateNoticeDto,
    @Param('type') type: string,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<string> {
    const { title, content, isTop, noticeGrant } = createNoticeDto;
    const command = new CreateNoticeCommand(title, content, isTop, noticeGrant, files);
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
  async getNoticeDetail(@Param('id') noticeId: number): Promise<GetNoticeDetailDto> {
    const command = new GetNoticeDetailCommand(noticeId);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 검색어 조회
   * @ param : keyword
   */
  @Get(':keyword')
  async getNoticeSearch(@Param('keyword') keyword: string) {
    const getNoticeSearchQuery = new GetNoticeSearchQuery(keyword);
    return this.queryBus.execute(getNoticeSearchQuery);
  }

  /**
   * 공지사항 수정
   * @ param : notice_id
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateNotice(
    @Param('id') noticeId: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<Notice> {
    const { title, content, isTop, noticeGrant } = updateNoticeDto;
    const command = new UpdateNoticeCommand(title, content, isTop, noticeGrant, noticeId, files);
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
