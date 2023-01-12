import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { Repository } from 'typeorm';
import { Project } from '../entities/project';
import { DeleteProjectCommand } from './delete-project.command';

/**
 * 프로젝트 삭제 핸들러 정의
 */
@Injectable()
@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand> {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: DeleteProjectCommand) {
    const { projectId } = command;

    const project = await this.projectRepository.findOneBy({ projectId });

    if (!project) {
      return this.convertException.notFoundError('프로젝트', 404);
    }

    try {
      await this.projectRepository.softDelete({ projectId: project.projectId });
    } catch (err) {
      return this.convertException.CommonError(500);
    }
    return '프로젝트 삭제가 완료 되었습니다.';
  }
}
