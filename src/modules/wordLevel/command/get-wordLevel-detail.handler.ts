import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { DataSource, Repository } from 'typeorm';
import { WordLevel } from '../entities/wordLevel.entity';
import { GetWordLevelDetailCommand } from './get-wordLevel-detail.command';

/**
 * 단어레벨 상세 정보 조회용 커맨드 핸들러
 */

@Injectable()
@CommandHandler(GetWordLevelDetailCommand)
export class GetWordLevelDetailHandler implements ICommandHandler<GetWordLevelDetailCommand> {
  constructor(
    @InjectRepository(WordLevel) private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
    private dataSource: DataSource,
  ) {}

  async execute(command: GetWordLevelDetailCommand) {
    const { wordLevelId } = command;

    const wordLevel = await this.wordLevelRepository.findOneBy({ wordLevelId });

    if (!wordLevel) {
      return this.convertException.notFoundError('단어레벨', 404);
    }

    return wordLevel;
  }
}
