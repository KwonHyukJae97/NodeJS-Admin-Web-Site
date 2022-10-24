import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { FileType } from '../entities/file-type.enum';
import { FileDbInterface } from '../file-db.interface';

/**
 * 다중 파일 등록용 이벤트 정의
 */
export class FilesCreateEvent extends CqrsEvent implements IEvent {
  constructor(
    readonly id: number,
    readonly fileType: FileType,
    readonly files: Express.MulterS3.File[],
    readonly fileDbInterface: FileDbInterface,
  ) {
    super(FilesCreateEvent.name);
  }
}
