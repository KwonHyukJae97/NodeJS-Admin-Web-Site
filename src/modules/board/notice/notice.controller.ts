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
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { UpdateNoticeCommand } from './command/update-notice.command';
import { DeleteNoticeCommand } from './command/delete-notice.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetNoticeDetailCommand } from './command/get-notice-detail.command';
import { GetNoticeListQuery } from './query/get-notice-list.query';
import { GetNoticeInfoDto } from './dto/get-notice-info.dto';
import { DeleteNoticeInfoDto } from './dto/delete-notice-info.dto';
import { GetNoticeRoleDto } from './dto/get-notice-role.dto';

/**
 * 공지사항 API controller
 */
@Controller('notice')
export class NoticeController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 공지사항 등록
   * @Return : 공지사항 등록 커맨드 전송
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createNotice(
    @Body() createNoticeDto: CreateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    const { title, content, isTop, noticeGrant, role } = createNoticeDto;
    const command = new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 전체 & 검색 결과 리스트 조회
   * @Query : keyword
   * @Return : 공지사항 리스트 조회 쿼리 전송
   */
  @Get()
  async getAllSearchNotice(
    @Query('keyword') keyword: string,
    @Body() getNoticeInfoDto: GetNoticeInfoDto,
  ) {
    const { role, noticeGrant } = getNoticeInfoDto;
    const getNoticeListSearchQuery = new GetNoticeListQuery(keyword, role, noticeGrant);
    return this.queryBus.execute(getNoticeListSearchQuery);
  }

  /**
   * 공지사항 상세 정보 조회
   * @Param : notice_id
   * @Return : 공지사항 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  async getNoticeDetail(@Param('id') noticeId: number, @Body() getNoticeRoleDto: GetNoticeRoleDto) {
    const { role } = getNoticeRoleDto;
    const command = new GetNoticeDetailCommand(noticeId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 상세 정보 수정
   * @Param : notice_id
   * @Return : 공지사항 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateNotice(
    @Param('id') noticeId: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    const { title, content, isTop, noticeGrant, role, accountId } = updateNoticeDto;
    const command = new UpdateNoticeCommand(
      title,
      content,
      isTop,
      noticeGrant,
      noticeId,
      role,
      accountId,
      files,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 정보 삭제
   * @Param : notice_id
   * @Return : 공지사항 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  async deleteNotice(
    @Param('id') noticeId: number,
    @Body() deleteNoticeInfoDto: DeleteNoticeInfoDto,
  ) {
    const { role, accountId } = deleteNoticeInfoDto;
    const command = new DeleteNoticeCommand(noticeId, role, accountId);
    return this.commandBus.execute(command);
  }
}
