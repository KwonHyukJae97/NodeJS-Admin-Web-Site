import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { FileDbInterface } from '../file-db.interface';

/**
 * 파일 삭제 처리 시, 사용되는 이벤트 정의
 */

export class FileDeleteEvent extends CqrsEvent implements IEvent {
  constructor(readonly id: number, readonly fileDbInterface: FileDbInterface) {
    super(FileDeleteEvent.name);
  }
}
