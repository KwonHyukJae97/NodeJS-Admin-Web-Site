import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { GradeLevelRank } from 'src/modules/gradeLevelRank/entities/gradeLevelRank';
import { LevelStandard } from 'src/modules/levelStandard/entities/levelStandard';
import { Percent } from 'src/modules/percent/entities/percent';
import { StudyPlan } from 'src/modules/studyPlan/entities/studyPlan';
import { StudyUnit } from 'src/modules/studyUnit/entities/studyUnit';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { DataSource, Repository } from 'typeorm';
import { Study } from '../entities/study';
import { DeleteStudyCommand } from './delete-study.command';

/**
 * 학습관리 삭제 핸들러 정의
 */
@Injectable()
@CommandHandler(DeleteStudyCommand)
export class DeleteStudytHandler implements ICommandHandler<DeleteStudyCommand> {
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

  async execute(command: DeleteStudyCommand) {
    const { studyId, studyPlanId } = command;

    const study = await this.studyRepository.findOneBy({ studyId });
    const studyPlan = await this.studyPlanRepository.findOneBy({ studyPlanId });

    if (!study || !studyPlan) {
      return this.convertException.notFoundError('학습관리', 404);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(Study).softDelete({ studyId: study.studyId });
      await queryRunner.manager
        .getRepository(StudyPlan)
        .softDelete({ studyPlanId: studyPlan.studyPlanId });

      await queryRunner.commitTransaction();
    } catch (err) {
      return this.convertException.CommonError(500);
    } finally {
      await queryRunner.release();
    }

    return '학습관리 삭제가 완료 되었습니다.';
  }
}
