import { ICommand } from '@nestjs/cqrs';

/**
 * 공지사항 정보 수정용 커맨드 정의
 */
export class UpdateNoticeCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly isTop: boolean,
    readonly noticeGrant: string,
    readonly noticeId: number,
    readonly files: Express.MulterS3.File[],
  ) {}
}
