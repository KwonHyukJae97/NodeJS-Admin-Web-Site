import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { FileDbInterface } from '../file-db.interface';

/**
 * 단일 파일 삭제용 이벤트 정의
 */
export class FileDeleteEvent extends CqrsEvent implements IEvent {
  constructor(readonly id: number, readonly fileDbInterface: FileDbInterface) {
    super(FileDeleteEvent.name);
  }
}
