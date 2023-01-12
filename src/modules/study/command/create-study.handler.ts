import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
import { Percent } from 'src/modules/percent/entities/percent';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyType } from 'src/modules/studyType/entities/studyType';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study';
import { StudyFileDb } from '../study-file-db';
import { CreateStudyCommand } from './create-study.command';

/**
 * 학습관리 생성 핸들러 정의
 */
@Injectable()
@CommandHandler(CreateStudyCommand)
export class CreateStudyHandler implements ICommandHandler<CreateStudyCommand> {
  constructor(
    @InjectRepository(Study) private studyRepository: Repository<Study>,
    @InjectRepository(Percent) private percentRepository: Repository<Percent>,
    @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(StudyUnit) private studyUnitRepository: Repository<StudyUnit>,
    @InjectRepository(LevelStandard) private levelStandardRepository: Repository<LevelStandard>,
    @InjectRepository(GradeLevelRank) private gradeLevelRankRepository: Repository<GradeLevelRank>,
    @InjectRepository(StudyType) private studyTypeRepository: Repository<StudyType>,
    @Inject('studyFile') private studyFileDb: StudyFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
    private commandBus: CommandBus,
  ) {}
  async execute(command: CreateStudyCommand) {
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
      files,
    } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const studyType = await this.studyTypeRepository.findOneBy({ studyTypeCode });

    try {
      //파일 설정넣기

      const studyData = await saveStudy(
        studyType.studyTypeCode,
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
        // null,
        queryRunner,
        this.studyFileDb,
        this.commandBus,
        files,
      );
      console.log(studyData);
      // }
      await queryRunner.commitTransaction();
      return '학습관리 등록이 완료되었습니다.';
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('학습 관리 정보에', 400);
    } finally {
      await queryRunner.release();
    }
  }
}

export const saveStudy = async (
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
  queryRunner,
  studyFileDb,
  commandBus,
  files,
) => {
  const study = queryRunner.manager.getRepository(Study).create({
    studyTypeCode,
    studyName,
    studyTarget,
    studyInformation,
    testScore,
    isService,
    checkLevelUnder,
    checkLevel,
    regBy,
  });

  await queryRunner.manager.getRepository(Study).save(study);

  //파일정보저장
  // if (files) {
  //   const command = new CreateFilesCommand(
  //     study.studyId,
  //     FileType.STUDY,
  //     files,
  //     studyFileDb,
  //     queryRunner,
  //   );
  //   await commandBus.execute(command);
  // }

  const levelStandard = queryRunner.manager.getRepository(LevelStandard).create({
    studyId: study.studyId,
    //단어레벨 정보 가져오기
    wordLevelId: 18,
    standard,
    knownError,
    levelStandardSequence,
  });

  await queryRunner.manager.getRepository(LevelStandard).save(levelStandard);

  for (const percentInfo of percentList) {
    const percentData = queryRunner.manager.getRepository(Percent).create({
      studyId: study.studyId,
      rankName: percentInfo.rankName,
      percent: percentInfo.percent,
      percentSequence: percentInfo.percentSequence,
    });

    await queryRunner.manager.getRepository(Percent).save(percentData);

    const gradeRankData = queryRunner.manager.getRepository(GradeLevelRank).create({
      levelStandardId: levelStandard.levelStandardId,
      percentId: percentData.percentId,
      gradeRank,
    });

    await queryRunner.manager.getRepository(GradeLevelRank).save(gradeRankData);
  }

  const studyPlan = queryRunner.manager.getRepository(StudyPlan).create({
    studyId: study.studyId,
    registerMode,
    studyMode,
    textbookName,
    textbookSequence,
  });

  await queryRunner.manager.getRepository(StudyPlan).save(studyPlan);

  const studyUnit = queryRunner.manager.getRepository(StudyUnit).create({
    studyPlanId: studyPlan.studyPlanId,
    unitName,
    unitSequence,
  });

  await queryRunner.manager.getRepository(StudyUnit).save(studyUnit);
};
