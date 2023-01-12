import { ICommand } from '@nestjs/cqrs';
import { Account } from '../../../account/entities/account.entity';

/**
 * 1:1 문의 등록용 커맨드 정의
 */
export class CreateQnaCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly account: Account,
    readonly files: Express.MulterS3.File[],
  ) {}
}
