import { ICommand } from '@nestjs/cqrs';

/**
 * FAQ 정보 수정용 커맨드 정의
 */
export class UpdateFaqCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly categoryName: string,
    readonly faqId: number,
    readonly files: Express.MulterS3.File[],
  ) {}
}
