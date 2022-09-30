import { ICommand } from '@nestjs/cqrs';

/**
 * FAQ 수정 시, 사용되는 커맨드 정의
 */

export class UpdateFaqCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly faqId: number,
    readonly files: Express.MulterS3.File[],
  ) {}
}
