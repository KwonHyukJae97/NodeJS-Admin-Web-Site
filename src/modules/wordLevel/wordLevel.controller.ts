import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWordLevelCommand } from './command/create-wordLevel.command';
import { DeleteWordLevelCommand } from './command/delete-wordLevel.command';
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
  getWordLevelList(@Body() param: GetWordLevelRequestDto) {
    const getWordLevelListQuery = new GetWordLevelListQuery(param);
    console.log('검색어 테스트', param);
    return this.queryBus.execute(getWordLevelListQuery);
  }

  /**
   * 단어레벨 등록
   * @param: 단어레벨등록 dto
   * @returns  단어레벨 등록 정보 커맨드 전송
   */
  @Post()
  async createWordLevel(@Body() createWordLevelDto: CreateWordLevelDto): Promise<void> {
    const { wordLevelName, isService, wordLevelSequence, regBy } = createWordLevelDto;
    const command = new CreateWordLevelCommand(wordLevelName, isService, wordLevelSequence, regBy);
    return this.commandBus.execute(command);
  }

  /**
   * 단어레벨 정보 수정
   * @param wordLevelId
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
