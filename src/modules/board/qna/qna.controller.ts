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
import { GetQnaInfoDto } from './dto/get-qna-info.dto';
import { GetQnaRoleDto } from './dto/get-qna-role.dto';

/**
 * 1:1 문의 API controller
 */
@Controller('qna')
export class QnaController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 1:1 문의 등록
   * @Return : 1:1 문의 등록 커맨드 전송
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createQna(@Body() createQnaDto: CreateQnaDto, @UploadedFiles() files: Express.MulterS3.File[]) {
    const { title, content } = createQnaDto;
    const command = new CreateQnaCommand(title, content, files);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 상세 정보 조회
   * @Param : qna_id
   * @Return : 1:1 문의 상세 정보 조회 커맨드 전송
   */
  @Get('detail/:id')
  async getQnaDetail(@Param('id') qnaId: number, @Body() getQnaInfoDto: GetQnaInfoDto) {
    const { role, accountId } = getQnaInfoDto;
    const command = new GetQnaDetailCommand(qnaId, role, accountId);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 전체 리스트 조회
   * @Param : account_id
   * @Return : 1:1 문의 리스트 조회 쿼리 전송
   */
  @Get(':accountId')
  async getAllQna(@Param('accountId') accountId: number, @Body() getQnaRoleDto: GetQnaRoleDto) {
    const { role } = getQnaRoleDto;
    const getQnaInfoQuery = new GetQnaListQuery(role, accountId);
    return this.queryBus.execute(getQnaInfoQuery);
  }

  /**
   * 1:1 문의 상세 정보 수정
   * @Param : qna_id
   * @Return : 1:1 문의 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateQna(
    @Param('id') qnaId: number,
    @Body() updateQnaDto: UpdateQnaDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    const { title, content, accountId } = updateQnaDto;
    const command = new UpdateQnaCommand(title, content, qnaId, files, accountId);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 정보 삭제
   * @Param : qna_id
   * @Param : account_id (삭제 권한 확인을 위해 임시로 사용)
   * @Return : 1:1 문의 정보 삭제 커맨드 전송
   */
  @Delete(':id/:accountId')
  async deleteQna(@Param('id') qnaId: number, @Param('accountId') accountId: number) {
    const command = new DeleteQnaCommand(qnaId, accountId);
    return this.commandBus.execute(command);
  }
}
