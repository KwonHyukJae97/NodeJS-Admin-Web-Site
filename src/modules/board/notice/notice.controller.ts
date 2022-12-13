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
  UseGuards,
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
import { GetUser } from '../../account/decorator/account.decorator';
import { Account } from '../../account/entities/account';
import { GetNoticeRequestDto } from './dto/get-notice-request.dto';
import { JwtAuthGuard } from '../../../guard/jwt/jwt-auth.guard';

/**
 * 공지사항 API controller
 */
@Controller('notice')
export class NoticeController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 공지사항 등록
   * @returns : 공지사항 등록 커맨드 전송
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  createNotice(
    @Body() createNoticeDto: CreateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    // @GetUser() account: Account,
  ) {
    console.log('file', files);
    const { title, content, isTop, noticeGrant, role } = createNoticeDto;
    const command = new CreateNoticeCommand(title, content, isTop, noticeGrant, role, files);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 전체 & 검색 결과 리스트 조회
   * @returns : 공지사항 리스트 조회 쿼리 전송
   */
  @Get()
  // @UseGuards(JwtAuthGuard)
  async getAllSearchNotice(@Body() param: GetNoticeRequestDto) {
    const getNoticeListSearchQuery = new GetNoticeListQuery(param);
    return this.queryBus.execute(getNoticeListSearchQuery);
  }

  /**
   * 공지사항 상세 정보 조회
   * @param : notice_id
   * @returns : 공지사항 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async getNoticeDetail(@Param('id') noticeId: number, @Query() role: string) {
    const command = new GetNoticeDetailCommand(noticeId, role);
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 상세 정보 수정
   * @param : notice_id
   * @returns : 공지사항 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async updateNotice(
    @Param('id') noticeId: number,
    @Body() updateNoticeDto: UpdateNoticeDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    // @GetUser() account: Account,
  ) {
    const { title, content, isTop, noticeGrant, role } = updateNoticeDto;
    const command = new UpdateNoticeCommand(
      title,
      content,
      isTop,
      noticeGrant,
      noticeId,
      role,
      // account,
      files,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 공지사항 정보 삭제
   * @param : notice_id
   * @returns : 공지사항 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotice(
    @Param('id') noticeId: number,
    // @GetUser() account: Account,
  ) {
    const command = new DeleteNoticeCommand(noticeId);
    return this.commandBus.execute(command);
  }
}
