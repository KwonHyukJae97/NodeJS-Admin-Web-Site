import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 공지사항 등록용 커맨드 정의
 */
export class CreateNoticeCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly isTop: boolean,
    readonly noticeGrant: string,
    readonly role: string,
    // readonly account: Account,
    readonly files: Express.MulterS3.File[],
  ) {}
}
