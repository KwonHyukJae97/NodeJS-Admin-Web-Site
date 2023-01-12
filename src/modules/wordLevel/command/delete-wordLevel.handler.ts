import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertException } from 'src/common/utils/convert-exception';
import { WordLevel } from 'src/modules/wordLevel/entities/wordLevel.entity';
import { Repository } from 'typeorm';
import { DeleteWordLevelCommand } from './delete-wordLevel.command';

/**
 * 단어레벨 삭제 핸들러 정의
 */
@Injectable()
@CommandHandler(DeleteWordLevelCommand)
export class DeleteWordLevelHandler implements ICommandHandler<DeleteWordLevelCommand> {
  constructor(
    @InjectRepository(WordLevel)
    private wordLevelRepository: Repository<WordLevel>,
    @Inject(ConvertException) private convertException: ConvertException,
  ) {}

  async execute(command: DeleteWordLevelCommand) {
    const { wordLevelId } = command;

    const wordLevel = await this.wordLevelRepository.findOneBy({ wordLevelId });

    if (!wordLevel) {
      return this.convertException.notFoundError('단어레벨', 404);
    }

    try {
      await this.wordLevelRepository.softDelete({ wordLevelId: wordLevel.wordLevelId });
    } catch (err) {
      return this.convertException.CommonError(500);
    }
    return '단어레벨 삭제가 완료되었습니다.';
  }
}
