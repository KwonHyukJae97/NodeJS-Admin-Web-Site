import { ICommand } from '@nestjs/cqrs';
import { BoardType } from '../../entities/board-type.enum';

/**
 * FAQ 등록 시, 사용되는 커맨드 정의
 */

export class CreateFaqCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly categoryName: string,
    readonly boardType: BoardType,
    readonly role: string,
    readonly files: Express.MulterS3.File[],
  ) {}
}
