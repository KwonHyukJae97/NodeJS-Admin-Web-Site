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
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateFaqCommand } from './command/update-faq.command';
import { DeleteFaqCommand } from './command/delete-faq.command';
import { FilesInterceptor } from '@nestjs/platform-express/multer/interceptors/files.interceptor';
import { GetFaqDetailCommand } from './command/get-faq-detail.command';
import { GetFaqInfoDto } from './dto/get-faq-info.dto';
import { GetCategoryListQuery } from './query/get-category-list.query';
import { DeleteFaqInfoDto } from './dto/delete-faq-info.dto';
import { GetFaqListQuery } from './query/get-faq-list.query';

/**
 * FAQ API controller
 */
@Controller('faq')
export class FaqController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * FAQ 등록
   * @Return : FAQ 등록 커맨드 전송
   */
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  createFaq(@Body() createFaqDto: CreateFaqDto, @UploadedFiles() files: Express.MulterS3.File[]) {
    const { title, content, categoryName, role } = createFaqDto;
    const command = new CreateFaqCommand(title, content, categoryName, role, files);
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 전체 & 카테고리별 검색 결과 리스트 조회
   * @Query : category_name
   * @Query : keyword
   * @Return : FAQ 리스트 조회 쿼리 전송
   */
  @Get()
  async getFaqSearch(
    @Query('categoryName') categoryName: string,
    @Query('keyword') keyword: string,
    @Body() getFaqInfoDto: GetFaqInfoDto,
  ) {
    const { role } = getFaqInfoDto;
    const getFaqListSearchQuery = new GetFaqListQuery(categoryName, keyword, role);
    return this.queryBus.execute(getFaqListSearchQuery);
  }

  /**
   * FAQ 카테고리 리스트 조회
   * @Return : FAQ 카테고리 리스트 조회 쿼리 전송
   */
  @Get('category')
  async getAllCategory(@Body() getFaqInfoDto: GetFaqInfoDto) {
    const { role } = getFaqInfoDto;
    const getCategoryListQuery = new GetCategoryListQuery(role);
    return this.queryBus.execute(getCategoryListQuery);
  }

  /**
   * FAQ 상세 정보 조회
   * @Param : faq_id
   * @Return : FAQ 상세 정보 조회 커맨드 전송
   */
  @Get(':id')
  async getFaqDetail(@Param('id') faqId: number, @Body() getFaqInfoDto: GetFaqInfoDto) {
    const { role } = getFaqInfoDto;
    const command = new GetFaqDetailCommand(faqId, role);
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 상세 정보 수정
   * @Param : faq_id
   * @Return : FAQ 상세 정보 수정 커맨드 전송
   */
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async updateFaq(
    @Param('id') faqId: number,
    @Body() updateFaqDto: UpdateFaqDto,
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    const { title, content, categoryName, role, accountId } = updateFaqDto;
    const command = new UpdateFaqCommand(
      title,
      content,
      categoryName,
      role,
      accountId,
      faqId,
      files,
    );
    return this.commandBus.execute(command);
  }

  /**
   * FAQ 정보 삭제
   * @Param : faq_id
   * @Return : FAQ 정보 삭제 커맨드 전송
   */
  @Delete(':id')
  async deleteFaq(@Param('id') faqId: number, @Body() deleteFaqInfoDto: DeleteFaqInfoDto) {
    const { role, accountId } = deleteFaqInfoDto;
    const command = new DeleteFaqCommand(faqId, role, accountId);
    return this.commandBus.execute(command);
  }
}
