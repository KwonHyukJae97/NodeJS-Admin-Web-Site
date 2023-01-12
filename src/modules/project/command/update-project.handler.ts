import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../entities/project';

import { UpdateProjectCommand } from './update-project.command';

/**
 * 프로젝트 수정 핸들러 정의
 */
@Injectable()
@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  //프론트 연동 후 수정자 내정보에서 가져와서 대입
  async execute(command: UpdateProjectCommand) {
    const { projectId, wordLevelName, wordLevelId, projectName, isService, updateBy } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const project = await this.projectRepository.findOneBy({ projectId });

    const wordLevel = await this.wordLevelRepository.findOneBy({ wordLevelId });

    if (!project) {
      return this.convertException.notFoundError('프로젝트', 404);
    }

    try {
      project.projectName = projectName;
      project.isService = isService;
      project.wordLevelId = wordLevelId;

      await queryRunner.manager.getRepository(Project).save(project);
      await queryRunner.commitTransaction();

      return { project, wordLevel };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      return this.convertException.badRequestError('프로젝트 정보 수정에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
