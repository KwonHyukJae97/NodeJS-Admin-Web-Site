import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { Repository } from 'typeorm';
import { UpdateStudyCommand } from './update-study.command';

/**
 * 학습관리 수정 핸들러 정의
 */
@Injectable()
@CommandHandler(UpdateStudyCommand)
export class UpdateStudyHandler implements ICommandHandler<UpdateStudyCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
  ) {}

  async execute(command: UpdateStudyCommand) {}
}
