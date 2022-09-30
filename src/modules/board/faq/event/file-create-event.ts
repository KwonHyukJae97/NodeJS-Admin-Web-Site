import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';

/**
 * 파일 업로드 로직 처리 시, 사용되는 이벤트 정의
 */

export class FileCreateEvent extends CqrsEvent implements IEvent {
  constructor(readonly boardId: number, readonly files: Express.MulterS3.File[]) {
    super(FileCreateEvent.name);
  }
}
