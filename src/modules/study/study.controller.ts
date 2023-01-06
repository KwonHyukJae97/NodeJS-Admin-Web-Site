import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStudyCommand } from './command/create-study.command';
import { CreateStudyDto } from './dto/create-study.dto';
import { GetStudyRequestDto } from './dto/get-study-request.dto';
import { GetStudyListQuery } from './query/get-study-list.query';

/**
 * 학습관리 컨트롤러 정의
 */
@Controller('study')
export class StudyController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  /**
   * 학습관리 리스트 조회
   * @param param
   * @returns
   */
  @Get()
  getStudyList(@Body() param: GetStudyRequestDto) {
    const getStudyListQuery = new GetStudyListQuery(param);

    return this.queryBus.execute(getStudyListQuery);
  }

  /**
   * 학습관리 등록
   * @param createStudyDto
   * @returns 학습관리 등록 커멘드 전송
   */
  @Post()
  createStudy(@Body() createStudyDto: CreateStudyDto) {
    const {
      studyTypeCode,
      studyName,
      studyTarget,
      studyInformation,
      testScore,
      isService,
      checkLevelUnder,
      checkLevel,
      regBy,
      rankName,
      percent,
      percentSequence,
      standard,
      knownError,
      levelStandardSequence,
      gradeRank,
      registerMode,
      studyMode,
      textbookName,
      textbookSequence,
      unitName,
      unitSequence,
    } = createStudyDto;

    const command = new CreateStudyCommand(
      studyTypeCode,
      studyName,
      studyTarget,
      studyInformation,
      testScore,
      isService,
      checkLevelUnder,
      checkLevel,
      regBy,
      rankName,
      percent,
      percentSequence,
      standard,
      knownError,
      levelStandardSequence,
      gradeRank,
      registerMode,
      studyMode,
      textbookName,
      textbookSequence,
      unitName,
      unitSequence,
    );

    return this.commandBus.execute(command);
  }
}
