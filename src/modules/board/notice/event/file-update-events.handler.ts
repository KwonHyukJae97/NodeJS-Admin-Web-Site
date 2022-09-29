import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { TestEvent } from './test.event';
import { FileService } from '../../file/file.service';
import { FileUpdateEvent } from './file-update-event';

/**
 * 파일 업데이트 시, 필요 로직을 처리하는 이벤트 핸들러
 */

@EventsHandler(FileUpdateEvent, TestEvent)
export class FileUpdateEventsHandler implements IEventHandler<FileUpdateEvent | TestEvent> {
  constructor(private fileService: FileService) {}

  async handle(event: FileUpdateEvent | TestEvent) {
    switch (event.name) {
      case FileUpdateEvent.name: {
        console.log('파일 업데이트 이벤트 발생!');
        const { boardId, files } = event as FileUpdateEvent;
        // 업로드 된 파일을 해당 db에 저장 및 기존 파일 db/S3 삭제
        await this.fileService.updateFiles(boardId, files);
        break;
      }
      case TestEvent.name: {
        console.log('공지사항 수정 최종 완료!');
        break;
      }
      default:
        break;
    }
  }
}
