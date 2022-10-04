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
import { CreateFaqDto } from './dto/create-faq.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateFaqCommand } from './command/create-faq.command';
import { GetFaqInfoQuery } from './query/get-faq-info.query';
import { Faq } from './entities/faq';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateFaqCommand } from './command/update-faq.command';
import { DeleteFaqCommand } from './command/delete-faq.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetFaqDetailDto } from './dto/get-faq-detail.dto';
import { GetFaqDetailCommand } from './command/get-faq-detail.command';
import { GetFaqSearchQuery } from './query/get-faq-search.query';

/**
 * FAQ 관련 API 처리하는 컨트롤러
 */

@Controller('faq')
export class FaqController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * FAQ 등록
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createFaq(
    @Body() createFaqDto: CreateFaqDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<string> {
    const { title, content, categoryName, isUse, boardType } = createFaqDto;
    const command = new CreateFaqCommand(title, content, categoryName, isUse, boardType, files);
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 리스트 조회
   */
  @Get()
  async getAllFaq() {
    const getFaqInfoQuery = new GetFaqInfoQuery();
    return this.queryBus.execute(getFaqInfoQuery);
  }

  /**
   * FAQ 상세 조회
   * @ param : faq_id
   */
  @Get(':id')
  async getFaqDetail(@Param('id') faqId: number): Promise<GetFaqDetailDto> {
    const command = new GetFaqDetailCommand(faqId);
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 검색어 조회
   * @ query : keyword
   */
  @Get()
  async getFaqSearch(@Query('keyword') keyword: string) {
    const getFaqSearchQuery = new GetFaqSearchQuery(keyword);
    return this.queryBus.execute(getFaqSearchQuery);
  }

  /**
   * FAQ 수정
   * @ param : faq_id
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateFaq(
    @Param('id') faqId: number,
    @Body() updateFaqDto: UpdateFaqDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ): Promise<Faq> {
    const { title, content } = updateFaqDto;
    const command = new UpdateFaqCommand(title, content, faqId, files);
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 삭제
   * @ param : faq_id
   */
  @Delete(':id')
  async deleteFaq(@Param('id') faqId: number): Promise<string> {
    const command = new DeleteFaqCommand(faqId);
    return this.commandBus.execute(command);
  }
}
