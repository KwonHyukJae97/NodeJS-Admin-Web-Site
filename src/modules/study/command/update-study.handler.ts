import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
import { Percent } from 'src/modules/percent/entities/percent';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study';
import { UpdateStudyCommand } from './update-study.command';

/**
 * 학습관리 수정 핸들러 정의
 */
@Injectable()
@CommandHandler(UpdateStudyCommand)
export class UpdateStudyHandler implements ICommandHandler<UpdateStudyCommand> {
  constructor(
    @InjectRepository(Study) private studyRepository: Repository<Study>,
    @InjectRepository(Percent) private percentRepository: Repository<Percent>,
    @InjectRepository(LevelStandard) private levelStandardRepository: Repository<LevelStandard>,
    @InjectRepository(GradeLevelRank) private gradeLevelRankRepository: Repository<GradeLevelRank>,
    @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
    @InjectRepository(StudyUnit) private studyUnitRepository: Repository<StudyUnit>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  async execute(command: UpdateStudyCommand) {
    const {
      studyId,
      percentId,
      levelStandardId,
      gradeLevelRankId,
      studyPlanId,
      studyUnitId,
      wordLevelId,
      studyTypeCode = '17',
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

    const studyData = await this.studyRepository.findOneBy({ studyId });
    const percentData = await this.percentRepository.findOneBy({ percentId });
    const levelStandardData = await this.levelStandardRepository.findOneBy({ levelStandardId });
    const gradeLevelRankData = await this.gradeLevelRankRepository.findOneBy({ gradeLevelRankId });
    const studyPlanData = await this.studyPlanRepository.findOneBy({ studyPlanId });
    const studyUnitData = await this.studyUnitRepository.findOneBy({ studyUnitId });

    if (
      !studyData ||
      !percentData ||
      !levelStandardData ||
      !gradeLevelRankData ||
      !studyPlanData ||
      !studyUnitData
    ) {
      return this.convertException.notFoundError('학습관리 ', 404);
    }

    try {
      //학습관리 정보 수정
      const study = queryRunner.manager.getRepository(Study).create({
        studyTypeCode,
        studyName: studyData.studyName,
        studyTarget: studyData.studyTarget,
        studyInformation: studyData.studyInformation,
        testScore: studyData.testScore,
        isService: studyData.isService,
        checkLevelUnder: studyData.checkLevelUnder,
        checkLevel: studyData.checkLevel,
        regBy: studyData.regBy,
      });
      // studyData.studyTypeCode = studyTypeCode;
      // studyData.studyName = studyName;
      // studyData.studyTarget = studyTarget;
      // studyData.studyInformation = studyInformation;
      // studyData.testScore = testScore;
      // studyData.isService = isService;
      // studyData.checkLevelUnder = checkLevelUnder;
      // studyData.checkLevel = checkLevel;
      // studyData.regBy = regBy;
      await queryRunner.manager.getRepository(Study).save(study);

      //백분율 정보 수정
      if (percentList) {
        for (const percentInfo of percentList) {
          const percentData = queryRunner.manager.getRepository(Percent).create({
            studyId: studyData.studyId,
            rankName: percentInfo.rankName,
            percent: percentInfo.percent,
            percentSequence: percentInfo.percentSequence,
          });

          console.log('이번에는 성공하자', percentData);

          await queryRunner.manager.getRepository(Percent).save(percentData);
        }
      }

      //레벨 수준 정보 수정
      const levelStandard = queryRunner.manager.getRepository(LevelStandard).create({
        studyId: studyData.studyId,
        //단어레베아이디 값 프로튼 단에서 넘겨서 보내주기
        wordLevelId: 18,
        standard: levelStandardData.standard,
        knownError: levelStandardData.knownError,
        levelStandardSequence: levelStandardData.levelStandardSequence,
      });

      await queryRunner.manager.getRepository(LevelStandard).save(levelStandard);

      //학년별 레벨별 등급정보 수정
      const gradeLevelRank = queryRunner.manager.getRepository(GradeLevelRank).create({
        levelStandardId: levelStandardData.levelStandardId,
        percentId: percentData.percentId,
        gradeRank: gradeLevelRankData.gradeRank,
      });

      await queryRunner.manager.getRepository(GradeLevelRank).save(gradeLevelRank);

      //학습 구성 정보 수정
      const studyPlan = queryRunner.manager.getRepository(StudyPlan).create({
        studyId: studyData.studyId,
        registerMode: studyPlanData.registerMode,
        studyMode: studyPlanData.studyMode,
        textbookName: studyPlanData.textbookName,
        textbookSequence: studyPlanData.textbookSequence,
      });

      // studyPlanData.studyId = studyData.studyId;
      // studyPlanData.registerMode = registerMode;
      // studyPlanData.studyMode = studyMode;
      // studyPlanData.textbookName = textbookName;
      // studyPlanData.textbookSequence = textbookSequence;

      await queryRunner.manager.getRepository(StudyPlan).save(studyPlan);

      //학습 단원 정보 수정
      const studyUnit = queryRunner.manager.getRepository(StudyUnit).create({
        studyPlanId: studyPlan.studyPlanId,
        unitName: studyUnitData.unitName,
        unitSequence: studyUnitData.unitSequence,
      });

      // studyUnitData.studyPlanId = studyPlanData.studyPlanId;
      // studyUnitData.unitName = unitName;
      // studyUnitData.unitSequence = unitSequence;

      await queryRunner.manager.getRepository(StudyUnit).save(studyUnitData);

      await queryRunner.commitTransaction();

      return {
        studyData,
        percentData,
        levelStandardData,
        gradeLevelRankData,
        studyPlanData,
        studyUnitData,
      };
    } catch (err) {
      console.log(err);
      return this.convertException.badInput('학습관리 정보에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
// import { Inject, Injectable } from '@nestjs/common';
// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ConvertException } from 'src/common/utils/convert-exception';
// import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
// import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
// import { Percent } from 'src/modules/percent/entities/percent';
// import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
// import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
// import { DataSource, Repository } from 'typeorm';
// import { Study } from '../entities/study';
// import { UpdateStudyCommand } from './update-study.command';

// /**
//  * 학습관리 수정 핸들러 정의
//  */
// @Injectable()
// @CommandHandler(UpdateStudyCommand)
// export class UpdateStudyHandler implements ICommandHandler<UpdateStudyCommand> {
//   constructor(
//     @InjectRepository(Study) private studyRepository: Repository<Study>,
//     @InjectRepository(Percent) private percentRepository: Repository<Percent>,
//     @InjectRepository(LevelStandard) private levelStandardRepository: Repository<LevelStandard>,
//     @InjectRepository(GradeLevelRank) private gradeLevelRankRepository: Repository<GradeLevelRank>,
//     @InjectRepository(StudyPlan) private studyPlanRepository: Repository<StudyPlan>,
//     @InjectRepository(StudyUnit) private studyUnitRepository: Repository<StudyUnit>,
//     @Inject(ConvertException) private convertException: ConvertException,
//     private dataSource: DataSource,
//   ) {}

//   async execute(command: UpdateStudyCommand) {
//       const {
//               studyId,
//               percentId,
//               levelStandardId,
//               gradeLevelRankId,
//               studyPlanId,
//               studyUnitId,
//               wordLevelId,
//               studyTypeCode = '17',
//               studyName,
//               studyTarget,
//               studyInformation,
//               testScore,
//               isService,
//               checkLevelUnder,
//               checkLevel,
//               regBy,
//               percentList,
//               standard,
//               knownError,
//               levelStandardSequence,
//               gradeRank,
//               registerMode,
//               studyMode,
//               textbookName,
//               textbookSequence,
//               unitName,
//               unitSequence,
//       } = command;

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const editStudy = async (
//         studyId,
//               percentId,
//               levelStandardId,
//               gradeLevelRankId,
//               studyPlanId,
//               studyUnitId,
//               wordLevelId,
//               studyTypeCode = '17',
//               studyName,
//               studyTarget,
//               studyInformation,
//               testScore,
//               isService,
//               checkLevelUnder,
//               checkLevel,
//               regBy,
//               percentList,
//               standard,
//               knownError,
//               levelStandardSequence,
//               gradeRank,
//               registerMode,
//               studyMode,
//               textbookName,
//               textbookSequence,
//               unitName,
//               unitSequence,
//       )
//     }
//   }
// }
