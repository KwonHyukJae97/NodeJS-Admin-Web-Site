import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { Response } from 'express';

/**
 * 파일 업로드 로직 처리 시, 사용되는 이벤트 정의
 */

export class FileCreateEvent extends CqrsEvent implements IEvent {
  constructor(
    readonly boardId: number,
    readonly boardType: string,
    readonly files: Express.MulterS3.File[],
    readonly res: Response,
  ) {
    super(FileCreateEvent.name);
  }
}
