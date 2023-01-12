import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../entities/project';
import { CreateProjectCommand } from './create-project.command';

/**
 * 프로젝트 생성 핸들러 정의
 */
@Injectable()
@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @InjectRepository(WordLevel) private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  async execute(command: CreateProjectCommand) {
    const { projectName, regBy, wordLevelId } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    //현재는 wordLevelId 값을 하드코딩으로 주입, 프론트 연동 이후에 선택박스에서 해당 단어레벨에 맞는 단어레벨 번호를 가져와서 wordLevelId에 주입
    try {
      const project = queryRunner.manager.getRepository(Project).create({
        projectName,
        wordLevelId,
        regBy,
      });

      await queryRunner.manager.getRepository(Project).save(project);

      await queryRunner.commitTransaction();

      return project;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('프로젝트 정보에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
