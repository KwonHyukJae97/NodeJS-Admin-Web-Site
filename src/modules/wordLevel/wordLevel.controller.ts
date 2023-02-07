import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/guard/jwt/jwt-auth.guard';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { CreateWordLevelCommand } from './command/create-wordLevel.command';
import { DeleteWordLevelCommand } from './command/delete-wordLevel.command';
import { GetWordLevelDetailCommand } from './command/get-wordLevel-detail.command';
import { UpdateWordLevelCommand } from './command/update-wordLevel.command';
import { CreateWordLevelDto } from './dto/create-wordLevel.dto';
import { GetWordLevelRequestDto } from './dto/get-wordLevel-request.dto';
import { UpdateWordLevelDto } from './dto/update-wordLevel.dto';
import { GetWordLevelListQuery } from './query/get-wordLevel-list.query';

/**
 * 단어레벨 컨트롤러 정의
 */
@Controller('word_level')
export class WordLevelController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 단어레벨 리스트 조회
   * @returns : 단어레벨 리스트 조회 쿼리 전송
   */
  @Get()
  // @UseGuards(JwtAuthGuard)
  getWordLevelList(@Body() param: GetWordLevelRequestDto) {
    const getWordLevelListQuery = new GetWordLevelListQuery(param);
    console.log('무슨값이려ㅑ나', param.isTotal);
    return this.queryBus.execute(getWordLevelListQuery);
  }

  /**
   * 단어레벨 상세 조회
   */
  @Get(':id')
  async getWordLevelDetail(@Param('id') wordLevelId: number) {
    const command = new GetWordLevelDetailCommand(wordLevelId);
    return this.commandBus.execute(command);
  }

  /**
   * 단어레벨 등록
   * @param createWordLevelDto : wordLevelName, isService, wordLevelSequence, regBy
   * @returns  단어레벨 등록 정보 커맨드 전송
   */
  @Post()
  createWordLevel(@Body() createWordLevelDto: CreateWordLevelDto): Promise<void> {
    const { wordLevelName, wordLevelSequence, regBy } = createWordLevelDto;
    const command = new CreateWordLevelCommand(wordLevelName, wordLevelSequence, regBy);
    return this.commandBus.execute(command);
  }

  /**
   * 단어레벨 정보 수정
   * @param dto : wordLevelName, wordLevelSequence, isService, updateBy
   * @returns : 단어레벨 정보 수정 커멘드 전송
   */
  @Patch(':id')
  async updateWordLevel(@Param('id') wordLevelId: number, @Body() dto: UpdateWordLevelDto) {
    const { wordLevelName, wordLevelSequence, isService, updateBy } = dto;
    const command = new UpdateWordLevelCommand(
      wordLevelId,
      wordLevelName,
      wordLevelSequence,
      isService,
      updateBy,
    );
    console.log('서비스여부 체크', isService);
    console.log('수정데이터', wordLevelName);
    return this.commandBus.execute(command);
  }

  /**
   * 단어레벨 정보 삭제
   * @param : wordLevelId
   * @returns : 단어레벨 정보 삭제 커멘드 전송
   */
  @Delete(':id')
  async deleteWordLevel(@Param('id') wordLevelId: number, delDate: Date) {
    const command = new DeleteWordLevelCommand(wordLevelId, delDate);
    return this.commandBus.execute(command);
  }
}
