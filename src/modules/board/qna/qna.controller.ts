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
import { Qna } from './entities/qna';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { UpdateQnaCommand } from './command/update-qna.command';
import { DeleteQnaCommand } from './command/delete-qna.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetQnaDetailDto } from './dto/get-qna-detail.dto';
import { GetQnaDetailCommand } from './command/get-qna-detail.command';
import { GetQnaInfoDto } from './dto/get-qna-info.dto';
import { GetQnaRoleDto } from './dto/get-qna-role.dto';

/**
 * 1:1 문의 관련 API 처리하는 컨트롤러
 */

@Controller('qna')
export class QnaController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 1:1 문의 등록
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createQna(
    @Body() createQnaDto: CreateQnaDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<string> {
    const { title, content } = createQnaDto;
    const command = new CreateQnaCommand(title, content, files);
    // '1:1 문의 등록 성공' 메세지 반환
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 상세 조회
   * @ param : qna_id
   */
  @Get('detail/:id')
  async getQnaDetail(
    @Param('id') qnaId: number,
    @Body() getQnaInfoDto: GetQnaInfoDto,
  ): Promise<GetQnaDetailDto> {
    const { role, accountId } = getQnaInfoDto;
    const command = new GetQnaDetailCommand(qnaId, role, accountId);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 리스트 조회
   * @ param : account_id
   */
  @Get(':accountId')
  async getAllQna(@Param('accountId') accountId: number, @Body() getQnaRoleDto: GetQnaRoleDto) {
    const { role } = getQnaRoleDto;
    const getQnaInfoQuery = new GetQnaListQuery(role, accountId);
    return this.queryBus.execute(getQnaInfoQuery);
  }

  /**
   * 1:1 문의 수정
   * @ param : qna_id
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateQna(
    @Param('id') qnaId: number,
    @Body() updateQnaDto: UpdateQnaDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<Qna> {
    const { title, content, accountId } = updateQnaDto;
    const command = new UpdateQnaCommand(title, content, qnaId, files, accountId);
    // qna 객체 반환
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 삭제
   * @ param : qna_id
   * @ param : account_id (삭제 권한 확인을 위해 임시로 사용)
   */
  @Delete(':id/:accountId')
  async deleteQna(
    @Param('id') qnaId: number,
    @Param('accountId') accountId: number,
  ): Promise<string> {
    const command = new DeleteQnaCommand(qnaId, accountId);
    // '1:1 문의 삭제 성공' 메세지 반환
    return this.commandBus.execute(command);
  }
}
