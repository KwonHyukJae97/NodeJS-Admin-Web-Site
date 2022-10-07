import { ICommand } from '@nestjs/cqrs';
import { BoardType } from '../../entities/board-type.enum';

/**
 * 공지사항 등록 시, 사용되는 커맨드 정의
 */

export class CreateNoticeCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly isTop: boolean,
    readonly noticeGrant: string,
    readonly boardType: BoardType.NOTICE,
    readonly role: string,
    readonly files: Express.MulterS3.File[],
  ) {}
}
