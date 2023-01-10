// import { Inject, Injectable } from '@nestjs/common';
// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { ConvertException } from 'src/common/utils/convert-exception';
// import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
// import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
// import { Percent } from 'src/modules/percent/entities/percent';
// import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
// import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
// import { DataSource } from 'typeorm';
// import { Study } from '../entities/study';
// import { CreateStudyCommand } from './create-study.command';

// /**
//  * 학습관리 생성 핸들러 정의
//  */
// @Injectable()
// @CommandHandler(CreateStudyCommand)
// export class CreateStudyHandler implements ICommandHandler<CreateStudyCommand> {
//   constructor(
//     @Inject(ConvertException) private convertException: ConvertException,
//     private dataSource: DataSource,
//   ) {}

//   async execute(command: CreateStudyCommand) {
//     const {
//       studyTypeCode = '12',
//       studyName,
//       studyTarget,
//       studyInformation,
//       testScore,
//       isService,
//       checkLevelUnder,
//       checkLevel,
//       regBy,
//       percentList,
//       // rankName,
//       // percent,
//       // percentSequence,
//       //levelStandard
//       standard,
//       knownError,
//       levelStandardSequence,
//       //gradeRank
//       gradeRank,
//       //studyPlan
//       registerMode,
//       studyMode,
//       textbookName,
//       textbookSequence,
//       //studyUnit
//       unitName,
//       unitSequence,
//     } = command;

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     //현재 학습관리 테이블에만 저장
//     // 백분율정보, 레벨수준정보, 학년별 레벨별 등급 정보, 학습구성정보, 학습단원정보 테이블도 추가
//     try {
//       const study = queryRunner.manager.getRepository(Study).create({
//         studyTypeCode,
//         studyName,
//         studyTarget,
//         studyInformation,
//         testScore,
//         isService,
//         checkLevelUnder,
//         checkLevel,
//         regBy,
//       });

//       await queryRunner.manager.getRepository(Study).save(study);

//       const percentData = queryRunner.manager.getRepository(Percent).create({
//         studyId: study.studyId,

//         // percents,
//         // rankName,
//         // percent,
//         // percentSequence,
//       });

//       await queryRunner.manager.getRepository(Percent).save(percentData);

//       const levelStandard = queryRunner.manager.getRepository(LevelStandard).create({
//         studyId: study.studyId,
//         //단어레베아이디 값 프로튼 단에서 넘겨서 보내주기
//         wordLevelId: 20,
//         standard,
//         knownError,
//         levelStandardSequence,
//       });

//       await queryRunner.manager.getRepository(LevelStandard).save(levelStandard);

//       const gradeLevelRank = queryRunner.manager.getRepository(GradeLevelRank).create({
//         levelStandardId: levelStandard.levelStandardId,
//         percentId: percentData.percentId,
//         gradeRank,
//       });

//       await queryRunner.manager.getRepository(GradeLevelRank).save(gradeLevelRank);

//       const studyPlan = queryRunner.manager.getRepository(StudyPlan).create({
//         studyId: study.studyId,
//         registerMode,
//         studyMode,
//         textbookName,
//         textbookSequence,
//       });

//       await queryRunner.manager.getRepository(StudyPlan).save(studyPlan);

//       const studyUnit = queryRunner.manager.getRepository(StudyUnit).create({
//         studyPlanId: studyPlan.studyPlanId,
//         unitName,
//         unitSequence,
//       });

//       await queryRunner.manager.getRepository(StudyUnit).save(studyUnit);

//       //학습구성 정보 추가 하기

//       await queryRunner.commitTransaction();

//       return study;
//     } catch (err) {
//       console.log(err);
//       return this.convertException.badInput('학습관리 정보에', 400);
//     } finally {
//       await queryRunner.release();
//     }
//   }
// }
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
import { Percent } from 'src/modules/percent/entities/percent';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study';
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
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
    private commandBus: CommandBus,
  ) {}
  async execute(command: CreateStudyCommand) {
    const {
      studyTypeCode = '12',
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
    } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // for (let i = 0; i < createStudyDto['createStudyDto'].length; i++) {
      //파일 설정넣기

      const study = await saveStudy(
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
        // null,
        queryRunner,
        // this.commandBus,
      );
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
  // commandBus,
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
