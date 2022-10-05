import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { FileCreateEvent } from './file-create-event';
import { TestEvent } from './test.event';
import { FileService } from '../../file/file.service';

/**
 * 파일 업로드 시, 필요 로직을 처리하는 이벤트 핸들러
 */

@EventsHandler(FileCreateEvent, TestEvent)
export class FileCreateEventsHandler implements IEventHandler<FileCreateEvent | TestEvent> {
  constructor(private fileService: FileService) {}

  async handle(event: FileCreateEvent | TestEvent) {
    switch (event.name) {
      case FileCreateEvent.name: {
        console.log('파일 업로드 이벤트 발생!');
        const { boardId, boardType, files } = event as FileCreateEvent;
        // 업로드 된 파일을 해당 db에 저장하는 로직
        await this.fileService.uploadFiles(boardId, boardType, files);
        break;
      }
      case TestEvent.name: {
        console.log('1:1 문의 등록 최종 완료!');
        break;
      }
      default:
        break;
    }
  }
}
