import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { FileType } from '../entities/file-type.enum';
import { FileDbInterface } from '../file-db.interface';

/**
 * 단일 파일 수정용 이벤트 정의
 */
export class FileUpdateEvent extends CqrsEvent implements IEvent {
  constructor(
    readonly id: number,
    readonly fileType: FileType,
    readonly file: Express.MulterS3.File,
    readonly fileDbInterface: FileDbInterface,
  ) {
    super(FileUpdateEvent.name);
  }
}
