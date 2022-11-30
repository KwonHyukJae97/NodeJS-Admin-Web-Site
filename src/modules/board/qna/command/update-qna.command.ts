import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account';

/**
 * 1:1 문의 정보 수정용 커맨드 정의
 */
export class UpdateQnaCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly qnaId: number,
    readonly files: Express.MulterS3.File[],
  ) // readonly account: Account,
  {}
}
