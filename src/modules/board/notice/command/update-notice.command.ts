import { ICommand } from '@nestjs/cqrs';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * 공지사항 수정 시, 사용되는 커맨드 정의
 */

export class UpdateNoticeCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly isTop: boolean,
    readonly noticeGrant: string,
    readonly noticeId: number,
    readonly fileType: FileType.NOTICE,
    readonly role: string,
    readonly accountId: number,
    readonly files: Express.MulterS3.File[],
  ) {}
}
