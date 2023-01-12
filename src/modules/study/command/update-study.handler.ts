import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { UpdateFilesCommand } from 'src/modules/file/command/update-files.command';
import { FileType } from 'src/modules/file/entities/file-type.enum';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
import { Percent } from 'src/modules/percent/entities/percent';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyType } from 'src/modules/studyType/entities/studyType';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study';
import { StudyFileDb } from '../study-file-db';
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
    @InjectRepository(StudyType) private studyTypeRepository: Repository<StudyType>,
    @Inject('studyFile') private studyFileDb: StudyFileDb,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
    private commandBus: CommandBus,
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
    const study = await this.studyRepository.findOneBy({ studyId });
    const percentData = await this.percentRepository.findOneBy({ percentId });
    const levelStandardData = await this.levelStandardRepository.findOneBy({ levelStandardId });
    const gradeLevelRankData = await this.gradeLevelRankRepository.findOneBy({ gradeLevelRankId });
    const studyPlanData = await this.studyPlanRepository.findOneBy({ studyPlanId });
    const studyUnitData = await this.studyUnitRepository.findOneBy({ studyUnitId });

    if (
      !study ||
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
      study.studyTypeCode = studyTypeCode;
      study.studyName = studyName;
      study.studyTarget = studyTarget;
      study.studyInformation = studyInformation;
      study.testScore = testScore;
      study.isService = isService;
      study.checkLevelUnder = checkLevelUnder;
      study.checkLevel = checkLevel;
      study.regBy = regBy;
      await queryRunner.manager.getRepository(Study).save(study);

      //백분율 정보 수정
      if (percentList) {
        for (const percentInfo of percentList) {
          //백분율 정보가 없으면 새로 생성
          if (!percentInfo.percentId) {
            const newPercent = queryRunner.manager.getRepository(Percent).create({
              studyId: study.studyId,
              rankName: percentInfo.rankName,
              percent: percentInfo.percent,
              percentSequence: percentInfo.percentSequence,
            });

            await queryRunner.manager.getRepository(Percent).save(newPercent);
          } else {
            //백분율 정보가 있으면 업데이트
            const updatePercent = await this.percentRepository.findBy({
              percentId: Number(percentInfo.percentId),
            });
            if (updatePercent) {
              await queryRunner.manager.getRepository(Percent).update(
                {
                  percentId: percentInfo.percentId,
                },
                {
                  rankName: percentInfo.rankName,
                  percent: percentInfo.percent,
                  percentSequence: percentInfo.percentSequence,
                },
              );
            }
          }
        }
      }

      if (files) {
        const command = new UpdateFilesCommand(
          Number(study.studyId),
          FileType.STUDY,
          null,
          files,
          this.studyFileDb,
          queryRunner,
        );
        await this.commandBus.execute(command);
      }

      //레벨 수준 정보 수정
      levelStandardData.studyId = study.studyId;
      levelStandardData.wordLevelId = 18;
      levelStandardData.standard = standard;
      levelStandardData.knownError = knownError;
      levelStandardData.levelStandardSequence = levelStandardSequence;

      await queryRunner.manager.getRepository(LevelStandard).save(levelStandardData);

      //학년별 레벨별 등급정보 수정
      gradeLevelRankData.levelStandardId = levelStandardData.levelStandardId;
      gradeLevelRankData.percentId = percentData.percentId;
      gradeLevelRankData.gradeRank = gradeRank;

      await queryRunner.manager.getRepository(GradeLevelRank).save(gradeLevelRankData);

      //학습 구성 정보 수정
      studyPlanData.studyId = study.studyId;
      studyPlanData.registerMode = registerMode;
      studyPlanData.studyMode = studyMode;
      studyPlanData.textbookName = textbookName;
      studyPlanData.textbookSequence = textbookSequence;

      await queryRunner.manager.getRepository(StudyPlan).save(studyPlanData);

      //학습 단원 정보 수정
      studyUnitData.studyPlanId = studyPlanData.studyPlanId;
      studyUnitData.unitName = unitName;
      studyUnitData.unitSequence = unitSequence;

      await queryRunner.manager.getRepository(StudyUnit).save(studyUnitData);

      await queryRunner.commitTransaction();

      return {
        study,
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
