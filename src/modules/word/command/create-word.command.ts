import { ICommand } from '@nestjs/cqrs';
import { CreateWordDto } from '../dto/create-word.dto';

/**
 * 단어 등록용 커맨드 정의
 */
export class CreateWordCommand implements ICommand {
  constructor(readonly createWordDto: CreateWordDto[], readonly files: Express.MulterS3.File[]) {}
}
