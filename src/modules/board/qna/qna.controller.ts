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
import { CreateQnaDto } from './dto/create-qna.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQnaCommand } from './command/create-qna.command';
import { GetQnaInfoQuery } from './query/get-qna-info.query';
import { Qna } from './entities/qna';
import { UpdateQnaDto } from './dto/update-qna.dto';
import { UpdateQnaCommand } from './command/update-qna.command';
import { DeleteQnaCommand } from './command/delete-qna.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetQnaDetailDto } from './dto/get-qna-detail.dto';
import { GetQnaDetailCommand } from './command/get-qna-detail.command';
import { GetQnaSearchQuery } from './query/get-qna-search.query';

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
    // @Res() res: Response,
  ): Promise<string> {
    const { title, content, boardType } = createQnaDto;
    const command = new CreateQnaCommand(title, content, boardType, files);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 리스트 조회
   */
  @Get('/list')
  async getAllQna() {
    const getQnaInfoQuery = new GetQnaInfoQuery();
    return this.queryBus.execute(getQnaInfoQuery);
  }

  /**
   * 1:1 문의 상세 조회
   * @ param : qna_id
   */
  @Get(':id')
  async getQnaDetail(@Param('id') qnaId: number): Promise<GetQnaDetailDto> {
    const command = new GetQnaDetailCommand(qnaId);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 검색어 조회
   * @ query : keyword
   */
  @Get()
  async getQnaSearch(@Query('keyword') keyword: string) {
    const getQnaSearchQuery = new GetQnaSearchQuery(keyword);
    return this.queryBus.execute(getQnaSearchQuery);
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
    // @Res() res: Response,
  ): Promise<Qna> {
    const { title, content, boardType } = updateQnaDto;
    const command = new UpdateQnaCommand(title, content, qnaId, boardType, files);
    return this.commandBus.execute(command);
  }

  /**
   * 1:1 문의 삭제
   * @ param : qna_id
   */
  @Delete(':id')
  async deleteQna(@Param('id') qnaId: number): Promise<string> {
    const command = new DeleteQnaCommand(qnaId);
    return this.commandBus.execute(command);
  }
}
