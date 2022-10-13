import { ICommand } from '@nestjs/cqrs';
import { FileType } from '../../../file/entities/file-type.enum';

/**
 * 1:1 문의 등록 시, 사용되는 커맨드 정의
 */

export class CreateQnaCommand implements ICommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly fileType: FileType.QNA,
    readonly files: Express.MulterS3.File[],
  ) {}
}
