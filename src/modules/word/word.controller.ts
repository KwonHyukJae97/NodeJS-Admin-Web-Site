import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../guard/jwt/jwt-auth.guard';
import { CreateWordDto } from './dto/create-word.dto';
import { CreateWordCommand } from './command/create-word.command';
import { GetWordRequestDto } from './dto/get-word-request.dto';
import { GetWordListQuery } from './query/get-word-list.query';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Word } from './entities/word.entity';
import { Repository } from 'typeorm';
import { GetDuplicateWordListQuery } from './query/get-duplicate-word-list.query';
import { GetDuplicateWordRequestDto } from './dto/get-duplicate-word-request.dto';
import { GetOriginWordListQuery } from './query/get-origin-word-list.query';
import { UpdateWordDto } from './dto/update-word.dto';
import { UpdateWordCommand } from './command/update-word.command';

/**
 * 단어 정보 API controller
 */
@Controller('word')
export class WordController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    @InjectRepository(Word) private wordRepository: Repository<Word>,
  ) {}

  /**
   * 단어 등록
   * @returns : 단어 등록 커맨드 전송
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async createWord(
    @Body() createWordDto: CreateWordDto[],
    @UploadedFiles() files: Express.MulterS3.File[],
    // @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const command = new CreateWordCommand(createWordDto, files);
    return this.commandBus.execute(command);
  }

  /**
   * 단어 전체/검색 리스트 조회
   * @returns : 단어 전체/검색 리스트 조회 쿼리 전송
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllSearchWord(@Body() param: GetWordRequestDto) {
    const getWordListQuery = new GetWordListQuery(param);
    return this.queryBus.execute(getWordListQuery);
  }

  /**
   * 중복 단어 리스트 조회
   * @returns : 중복 단어 리스트 조회 쿼리 전송
   */
  @Get('duplication')
  @UseGuards(JwtAuthGuard)
  async getAllDuplicateWord(@Body() param: GetDuplicateWordRequestDto) {
    const getDuplicateWordListQuery = new GetDuplicateWordListQuery(param);
    return this.queryBus.execute(getDuplicateWordListQuery);
  }

  // /**
  //  * 본단어/일반단어 리스트 조회
  //  * @returns : 본단어/일반단어 리스트 조회 쿼리 전송
  //  */
  // @Get('origin')
  // @UseGuards(JwtAuthGuard)
  // async getAllOriginWord(@Body() param: GetOriginWordRequestDto) {
  //   console.log(param);
  //   const getOriginWordListQuery = new GetOriginWordListQuery(param);
  //   return this.queryBus.execute(getOriginWordListQuery);
  // }

  /**
   * 본단어/일반단어 리스트 조회
   * @returns : 본단어/일반단어 리스트 조회 쿼리 전송
   */
  @Get('origin')
  @UseGuards(JwtAuthGuard)
  async getAllOriginWord(@Query() param: string) {
    const getOriginWordListQuery = new GetOriginWordListQuery(param);
    return this.queryBus.execute(getOriginWordListQuery);
  }

  /**
   * 단어 정보 수정
   * @returns : 단어 상세 정보 수정 커맨드 전송
   */
  @Patch('correction')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async updateWord(
    @Body() updateWordDto: UpdateWordDto[],
    @UploadedFiles() files: Express.MulterS3.File[],
  ) {
    const command = new UpdateWordCommand(updateWordDto, files);
    return this.commandBus.execute(command);
  }
}
