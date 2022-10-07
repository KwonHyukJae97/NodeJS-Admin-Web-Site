import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNoticeCommand } from './command/create-notice.command';
import { Notice } from './entities/notice';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { UpdateNoticeCommand } from './command/update-notice.command';
import { DeleteNoticeCommand } from './command/delete-notice.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetNoticeDetailDto } from './dto/get-notice-detail.dto';
import { GetNoticeDetailCommand } from './command/get-notice-detail.command';
import { GetNoticeSearchQuery } from './query/get-notice-search.query';
import { GetNoticeListQuery } from './query/get-notice-list.query';
import { GetNoticeInfoDto } from './dto/get-notice-info.dto';
import { DeleteNoticeInfoDto } from './dto/delete-notice-info.dto';
import { GetNoticeRoleDto } from './dto/get-notice-role.dto';

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
  @UseInterceptors(FilesInterceptor('files'))
  createNotice(
    @Body() createNoticeDto: CreateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    // @Res() res: Response,
  ): Promise<string> {
    const { title, content, isTop, noticeGrant, boardType, role } = createNoticeDto;
    const command = new CreateNoticeCommand(
      title,
      content,
      isTop,
      noticeGrant,
      boardType,
      role,
      files,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 리스트 조회
   */
  @Get('/list')
  async getAllNotice(@Body() getNoticeInfoDto: GetNoticeInfoDto) {
    const { role, noticeGrant } = getNoticeInfoDto;
    const getNoticeListQuery = new GetNoticeListQuery(role, noticeGrant);
    return this.queryBus.execute(getNoticeListQuery);
  }

  /**
   * 공지사항 상세 조회
   * @ param : notice_id
   */
  @Get(':id')
  async getNoticeDetail(
    @Param('id') noticeId: number,
    @Body() getNoticeRoleDto: GetNoticeRoleDto,
  ): Promise<GetNoticeDetailDto> {
    const { role } = getNoticeRoleDto;
    const command = new GetNoticeDetailCommand(noticeId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 검색어 조회
   * @ query : keyword
   */
  @Get()
  async getNoticeSearch(
    @Query('keyword') keyword: string,
    @Body() getNoticeInfoDto: GetNoticeInfoDto,
  ) {
    const { role, noticeGrant } = getNoticeInfoDto;
    const getNoticeSearchQuery = new GetNoticeSearchQuery(keyword, role, noticeGrant);
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
    // @Res() res: Response,
  ): Promise<Notice> {
    const { title, content, isTop, noticeGrant, boardType, role, accountId } = updateNoticeDto;
    const command = new UpdateNoticeCommand(
      title,
      content,
      isTop,
      noticeGrant,
      noticeId,
      boardType,
      role,
      accountId,
      files,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 삭제
   * @ param : notice_id
   */
  @Delete(':id')
  async deleteNotice(
    @Param('id') noticeId: number,
    @Body() deleteNoticeInfoDto: DeleteNoticeInfoDto,
  ): Promise<string> {
    const { role, accountId } = deleteNoticeInfoDto;
    const command = new DeleteNoticeCommand(noticeId, role, accountId);
    return this.commandBus.execute(command);
  }
}
