import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { DataSource, Repository } from 'typeorm';
import { CreateWordLevelCommand } from './create-wordLevel.command';

/**
 * 단어레벨 생성 핸들러 정의
 */
@Injectable()
@CommandHandler(CreateWordLevelCommand)
export class CreateWordLevelHandler implements ICommandHandler<CreateWordLevelCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
    private commandBus: CommandBus,
    private dataSource: DataSource,
  ) {}

  async execute(command: CreateWordLevelCommand) {
    const { wordLevelName, isService, wordLevelSequence, regBy } = command;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wordLevel = queryRunner.manager.getRepository(WordLevel).create({
        wordLevelName,
        isService,
        wordLevelSequence,
        regBy,
      });

      await queryRunner.manager.getRepository(WordLevel).save(wordLevel);

      await queryRunner.commitTransaction();
      return wordLevel;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return this.convertException.badInput('단어 레벨 정보에 ', 400);
    } finally {
      await queryRunner.release();
    }
  }
}
