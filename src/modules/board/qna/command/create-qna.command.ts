import { ICommand } from '@nestjs/cqrs';

/**
 * 1:1 문의 등록용 커맨드 정의
 */
export class CreateQnaCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly files: Express.MulterS3.File[],
  ) {}
}
