import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TestEvent } from './test.event';
import { FileService } from '../../file/file.service';
import { FileDeleteEvent } from './file-delete-event';

/**
 * 파일 삭제 시, 필요 로직을 처리하는 이벤트 핸들러
 */

@EventsHandler(FileDeleteEvent, TestEvent)
export class FileDeleteEventsHandler implements IEventHandler<FileDeleteEvent | TestEvent> {
  constructor(private fileService: FileService) {}

  async handle(event: FileDeleteEvent | TestEvent) {
    switch (event.name) {
      case FileDeleteEvent.name: {
        console.log('파일 삭제 이벤트 발생!');
        const { boardId, res } = event as FileDeleteEvent;
        // 기존 파일 S3 삭제
        await this.fileService.deleteFiles(boardId, res);
        break;
      }
      case TestEvent.name: {
        console.log('공지사항 삭제 최종 완료!');
        break;
      }
      default:
        break;
    }
  }
}
