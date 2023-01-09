import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { Repository } from 'typeorm';
import { DeleteStudyCommand } from './delete-study.command';

/**
 * 학습관리 삭제 핸들러 정의
 */
@Injectable()
@CommandHandler(DeleteStudyCommand)
export class DeleteStudytHandler implements ICommandHandler<DeleteStudyCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
  ) {}

  async execute(command: DeleteStudyCommand) {}
}
