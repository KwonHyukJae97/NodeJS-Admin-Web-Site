import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { BoardFile } from '../../file/entities/board_file';

/**
 * 파일 삭제 처리 시, 사용되는 이벤트 정의
 */

export class FileDeleteEvent extends CqrsEvent implements IEvent {
  constructor(readonly boardId: number, readonly files: BoardFile[]) {
    super(FileDeleteEvent.name);
  }
}
