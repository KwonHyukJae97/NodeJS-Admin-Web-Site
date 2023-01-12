import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateQnaDto } from './dto/create-qna.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQnaCommand } from './command/create-qna.command';
import { GetQnaListQuery } from './query/get-qna-list.query';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { UpdateQnaCommand } from './command/update-qna.command';
import { DeleteQnaCommand } from './command/delete-qna.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetQnaDetailCommand } from './command/get-qna-detail.command';
import { GetUser } from '../../account/decorator/account.decorator';
import { Account } from '../../account/entities/account';
import { JwtAuthGuard } from '../../../guard/jwt/jwt-auth.guard';
import { GetQnaRequestDto } from './dto/get-qna-request.dto';

/**
 * 1:1 문의 API controller
 */
@Controller('qna')
export class QnaController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 1:1 문의 등록
   * @returns : 1:1 문의 등록 커맨드 전송
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  createQna(
    @Body() createQnaDto: CreateQnaDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    @GetUser() account: Account,
  ) {
    const { title, content } = createQnaDto;
    const command = new CreateQnaCommand(title, content, account, files);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 상세 정보 조회
   * @param : qna_id
   * @returns : 1:1 문의 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getQnaDetail(@Param('id') qnaId: number, @GetUser() account: Account) {
    const command = new GetQnaDetailCommand(qnaId, account);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 전체 리스트 조회 (본인이 작성한 문의 내역 기준)
   * @returns : 1:1 문의 리스트 조회 쿼리 전송
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllQna(@GetUser() account: Account, @Body() param: GetQnaRequestDto) {
    const getQnaInfoQuery = new GetQnaListQuery(param, account);
    return this.queryBus.execute(getQnaInfoQuery);
  }

  /**
   * 1:1 문의 상세 정보 수정
   * @param : qna_id
   * @returns : 1:1 문의 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async updateQna(
    @Param('id') qnaId: number,
    @Body() updateQnaDto: UpdateQnaDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    @GetUser() account: Account,
  ) {
    const { title, content } = updateQnaDto;
    const command = new UpdateQnaCommand(title, content, qnaId, files, account);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 정보 삭제
   * @param : qna_id
   * @param : account_id (삭제 권한 확인을 위해 임시로 사용)
   * @returns : 1:1 문의 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteQna(@Param('id') qnaId: number, @GetUser() account: Account) {
    const command = new DeleteQnaCommand(qnaId, account);
    return this.commandBus.execute(command);
  }
}
