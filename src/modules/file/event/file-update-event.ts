import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { FileType } from '../entities/file-type.enum';

/**
 * 파일 업데이트 로직 처리 시, 사용되는 이벤트 정의
 */

export class FileUpdateEvent extends CqrsEvent implements IEvent {
  constructor(
    readonly boardId: number,
    readonly fileType: FileType,
    readonly files: Express.MulterS3.File[],
  ) {
    super(FileUpdateEvent.name);
  }
}
