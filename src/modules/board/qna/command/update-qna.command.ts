import { ICommand } from '@nestjs/cqrs';
import { BoardType } from '../../entities/board-type.enum';

/**
 * 1:1 문의 수정 시, 사용되는 커맨드 정의
 */

export class UpdateQnaCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly qnaId: number,
    readonly boardType: BoardType.QNA,
    readonly files: Express.MulterS3.File[],
  ) {}
}
