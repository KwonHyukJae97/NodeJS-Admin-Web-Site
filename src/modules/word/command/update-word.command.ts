import { ICommand } from '@nestjs/cqrs';
import { UpdateWordDto } from '../dto/update-word.dto';

/**
 * 단어 수정용 커맨드 정의
 */
export class UpdateWordCommand implements ICommand {
  constructor(readonly updateWordDto: UpdateWordDto[], readonly files: Express.MulterS3.File[]) {}
}
