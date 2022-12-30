import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel';
import { Repository } from 'typeorm';
import { CreateWordLevelCommand } from './create-wordLevel.command';
import { UpdateWordLevelCommand } from './update-wordLevel.command';

/**
 * 단어레벨 수정 핸들러 정의
 */
@Injectable()
@CommandHandler(UpdateWordLevelCommand)
export class UpdateWordLevelHandler implements ICommandHandler<UpdateWordLevelCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  //수정자는 프론트에서 넘어오는 값에서 추출하여 대입
  async execute(command: UpdateWordLevelCommand) {
    const { wordLevelId, wordLevelSequence, wordLevelName, isService, updateBy } = command;

    const wordLevel = await this.wordLevelRepository.findOneBy({ wordLevelId: wordLevelId });

    if (!wordLevel) {
      return this.convertException.notFoundError('단어레벨', 404);
    }

    try {
      await this.wordLevelRepository.update({ wordLevelId }, { wordLevelSequence });
      await this.wordLevelRepository.update({ wordLevelId }, { wordLevelName });
      await this.wordLevelRepository.update({ wordLevelId }, { isService });
    } catch (err) {
      console.log(err);
    }
    return '단어레벨 수정이 완료되었습니다.';
  }
}
