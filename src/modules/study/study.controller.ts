import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateStudyCommand } from './command/create-study.command';
import { DeleteStudyCommand } from './command/delete-study.command';
import { UpdateStudyCommand } from './command/update-study.command';
import { CreateStudyDto } from './dto/create-study.dto';
import { GetStudyRequestDto } from './dto/get-study-request.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { GetStudyInfoQuery } from './query/get-study-info.query';
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
   * @returns 학습관리 리스트 조회 쿼리 전송
   */
  @Get()
  async getStudyList(@Body() param: GetStudyRequestDto) {
    const query = new GetStudyListQuery(param);

    return this.queryBus.execute(query);
  }

  /**
   * 학습관리 상세정보 조회
   * @param studyId
   * @returns 학습관리 상세정보 조회 쿼리 전송
   */
  @Get(':id')
  async getStudyInfo(@Param('id') studyId: number) {
    const query = new GetStudyInfoQuery(studyId);
    return this.queryBus.execute(query);
  }
  /**
   * 학습관리 등록
   * @param createStudyDto
   * @returns 학습관리 등록 커멘드 전송
   */
  @Post()
  async createStudy(@Body() createStudyDto: CreateStudyDto) {
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
      percentList,
      // rankName,
      // percent,
      // percentSequence,
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
      // createStudyDto,
      studyTypeCode,
      studyName,
      studyTarget,
      studyInformation,
      testScore,
      isService,
      checkLevelUnder,
      checkLevel,
      regBy,
      percentList,
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
    console.log('퍼센트 데이터 배열', percentList);

    return this.commandBus.execute(command);
  }

  /**
   * 학습관리 수정
   * @param studyId
   * @param updateStudyDto
   * @returns 학습관리 수정 커멘드 전송
   */
  @Patch(':id')
  async updateStudy(@Param('id') studyId: number, @Body() updateStudyDto: UpdateStudyDto) {
    const {
      percentId,
      levelStandardId,
      gradeLevelRankId,
      studyPlanId,
      studyUnitId,
      wordLevelId,
      studyTypeCode,
      studyName,
      studyTarget,
      studyInformation,
      testScore,
      isService,
      checkLevelUnder,
      checkLevel,
      regBy,
      percentList,
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
    } = updateStudyDto;

    const command = new UpdateStudyCommand(
      studyId,
      percentId,
      levelStandardId,
      gradeLevelRankId,
      studyPlanId,
      studyUnitId,
      wordLevelId,
      studyTypeCode,
      studyName,
      studyTarget,
      studyInformation,
      testScore,
      isService,
      checkLevelUnder,
      checkLevel,
      regBy,
      percentList,
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
    console.log('학습관리 컨트롤러 수정 데이터', percentList);
    console.log('학습관리 컨트롤러 수정 데이터', studyId);

    return this.commandBus.execute(command);
  }

  /**
   * 학습관리 삭제
   * @param studyId
   * @param delDate
   * @returns 학습관리 삭재 커멘드 전송
   */
  @Delete(':id')
  async deleteStudy(@Param('id') studyId: number, studyPlanId: number, delDate: Date) {
    const command = new DeleteStudyCommand(studyId, studyPlanId, delDate);

    return this.commandBus.execute(command);
  }
}
